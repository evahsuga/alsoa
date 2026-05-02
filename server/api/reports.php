<?php
/**
 * 月次レポートAPI
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getReports($db);
        break;
    case 'POST':
        saveReport($db);
        break;
    default:
        errorResponse('許可されていないメソッドです', 405);
}

/**
 * 月次レポート取得
 */
function getReports($db) {
    $year = $_GET['year'] ?? null;
    $month = $_GET['month'] ?? null;

    if ($year && $month) {
        $stmt = $db->prepare('SELECT * FROM monthly_reports WHERE year = ? AND month = ?');
        $stmt->execute([$year, $month]);
        $row = $stmt->fetch();

        if ($row) {
            jsonResponse(formatReport($row));
        } else {
            jsonResponse(getDefaultReport($year, $month));
        }
    } else {
        $stmt = $db->query('SELECT * FROM monthly_reports ORDER BY year DESC, month DESC');
        $rows = $stmt->fetchAll();

        $reports = [];
        foreach ($rows as $row) {
            $reports[] = formatReport($row);
        }

        jsonResponse($reports);
    }
}

/**
 * 月次レポート保存（登録または更新）
 */
function saveReport($db) {
    $data = getRequestBody();

    if (!isset($data['year']) || !isset($data['month'])) {
        errorResponse('年と月は必須です');
    }

    $year = (int)$data['year'];
    $month = (int)$data['month'];

    if ($month < 1 || $month > 12) {
        errorResponse('月は1〜12の範囲で指定してください');
    }

    $actions        = isset($data['actions'])        ? json_encode($data['actions'],        JSON_UNESCAPED_UNICODE) : null;
    $afterFollow    = isset($data['afterFollow'])    ? json_encode($data['afterFollow'],    JSON_UNESCAPED_UNICODE) : null;
    $threeStepSales = isset($data['threeStepSales']) ? json_encode($data['threeStepSales'], JSON_UNESCAPED_UNICODE) : null;
    $purchaseCount  = isset($data['purchaseCount'])  ? json_encode($data['purchaseCount'],  JSON_UNESCAPED_UNICODE) : null;

    $stmt = $db->prepare('SELECT id FROM monthly_reports WHERE year = ? AND month = ?');
    $stmt->execute([$year, $month]);
    $existing = $stmt->fetch();

    if ($existing) {
        $stmt = $db->prepare('
            UPDATE monthly_reports SET
                target_sales     = ?,
                result_sales     = ?,
                purchase         = ?,
                purchase_invoice = ?,
                sales_bonus      = ?,
                self_use         = ?,
                expenses         = ?,
                inventory        = ?,
                actions          = ?,
                after_follow     = ?,
                met_count        = ?,
                three_step_sales = ?,
                purchase_count   = ?
            WHERE year = ? AND month = ?
        ');
        $stmt->execute([
            $data['targetSales']     ?? 0,
            $data['resultSales']     ?? 0,
            $data['purchase']        ?? 0,
            $data['purchaseInvoice'] ?? 0,
            $data['salesBonus']      ?? 0,
            $data['selfUse']         ?? 0,
            $data['expenses']        ?? 0,
            $data['inventory']       ?? 0,
            $actions,
            $afterFollow,
            $data['metCount']        ?? 0,
            $threeStepSales,
            $purchaseCount,
            $year,
            $month
        ]);
    } else {
        $stmt = $db->prepare('
            INSERT INTO monthly_reports
                (year, month, target_sales, result_sales, purchase, purchase_invoice, sales_bonus,
                 self_use, expenses, inventory, actions, after_follow, met_count, three_step_sales, purchase_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $year,
            $month,
            $data['targetSales']     ?? 0,
            $data['resultSales']     ?? 0,
            $data['purchase']        ?? 0,
            $data['purchaseInvoice'] ?? 0,
            $data['salesBonus']      ?? 0,
            $data['selfUse']         ?? 0,
            $data['expenses']        ?? 0,
            $data['inventory']       ?? 0,
            $actions,
            $afterFollow,
            $data['metCount']        ?? 0,
            $threeStepSales,
            $purchaseCount
        ]);
    }

    jsonResponse(['success' => true, 'message' => '月次レポートを保存しました']);
}

/**
 * DBの行をフロントエンド形式に変換
 */
function formatReport($row) {
    return [
        'year'            => (int)$row['year'],
        'month'           => (int)$row['month'],
        'targetSales'     => (int)$row['target_sales'],
        'resultSales'     => (int)$row['result_sales'],
        'purchase'        => (int)$row['purchase'],
        'purchaseInvoice' => (int)($row['purchase_invoice'] ?? 0),
        'salesBonus'      => (int)($row['sales_bonus']      ?? 0),
        'selfUse'         => (int)$row['self_use'],
        'expenses'        => (int)($row['expenses']         ?? 0),
        'inventory'       => (int)($row['inventory']        ?? 0),
        'actions'         => $row['actions']          ? json_decode($row['actions'],          true) : getDefaultActions(),
        'afterFollow'     => $row['after_follow']     ? json_decode($row['after_follow'],     true) : ['total' => 0, 'done' => 0],
        'metCount'        => (int)$row['met_count'],
        'threeStepSales'  => $row['three_step_sales'] ? json_decode($row['three_step_sales'], true) : getDefaultThreeStepSales(),
        'purchaseCount'   => $row['purchase_count']   ? json_decode($row['purchase_count'],   true) : getDefaultPurchaseCount(),
    ];
}

/**
 * デフォルトのレポートデータ
 */
function getDefaultReport($year, $month) {
    return [
        'year'            => (int)$year,
        'month'           => (int)$month,
        'targetSales'     => 0,
        'resultSales'     => 0,
        'purchase'        => 0,
        'purchaseInvoice' => 0,
        'salesBonus'      => 0,
        'selfUse'         => 0,
        'expenses'        => 0,
        'inventory'       => 0,
        'actions'         => getDefaultActions(),
        'afterFollow'     => ['total' => 0, 'done' => 0],
        'metCount'        => 0,
        'threeStepSales'  => getDefaultThreeStepSales(),
        'purchaseCount'   => getDefaultPurchaseCount(),
    ];
}

function getDefaultActions() {
    return [
        'newCustomer' => ['target' => 0, 'result' => 0, 'amount' => 0],
        'priceUp'     => ['target' => 0, 'result' => 0, 'amount' => 0],
        'jp'          => ['target' => 0, 'result' => 0, 'amount' => 0],
        'sample'      => ['target' => 0, 'result' => 0],
        'monitor'     => ['target' => 0, 'result' => 0],
        'expansion'   => ['target' => 0, 'result' => 0],
        'repeat'      => ['target' => 0, 'result' => 0]
    ];
}

function getDefaultThreeStepSales() {
    return ['qs' => 0, 'pack' => 0, 'lotion' => 0, 'mo' => 0, 'sp' => 0];
}

function getDefaultPurchaseCount() {
    return ['qs' => 0, 'pack' => 0, 'lotion' => 0, 'mo' => 0, 'sp' => 0];
}
