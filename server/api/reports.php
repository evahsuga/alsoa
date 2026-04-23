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
        // 特定月のレポート取得
        $stmt = $db->prepare('SELECT * FROM monthly_reports WHERE year = ? AND month = ?');
        $stmt->execute([$year, $month]);
        $row = $stmt->fetch();

        if ($row) {
            jsonResponse(formatReport($row));
        } else {
            // レポートが存在しない場合は空のデータを返す
            jsonResponse(getDefaultReport($year, $month));
        }
    } else {
        // 全レポート取得
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

    // JSON化するフィールド
    $actions = isset($data['actions']) ? json_encode($data['actions'], JSON_UNESCAPED_UNICODE) : null;
    $afterFollow = isset($data['afterFollow']) ? json_encode($data['afterFollow'], JSON_UNESCAPED_UNICODE) : null;
    $threeStepSales = isset($data['threeStepSales']) ? json_encode($data['threeStepSales'], JSON_UNESCAPED_UNICODE) : null;

    // 既存レポートの確認
    $stmt = $db->prepare('SELECT id FROM monthly_reports WHERE year = ? AND month = ?');
    $stmt->execute([$year, $month]);
    $existing = $stmt->fetch();

    if ($existing) {
        // 更新
        $stmt = $db->prepare('
            UPDATE monthly_reports SET
                target_sales = ?,
                result_sales = ?,
                purchase = ?,
                self_use = ?,
                actions = ?,
                after_follow = ?,
                met_count = ?,
                three_step_sales = ?
            WHERE year = ? AND month = ?
        ');
        $stmt->execute([
            $data['targetSales'] ?? 0,
            $data['resultSales'] ?? 0,
            $data['purchase'] ?? 0,
            $data['selfUse'] ?? 0,
            $actions,
            $afterFollow,
            $data['metCount'] ?? 0,
            $threeStepSales,
            $year,
            $month
        ]);
    } else {
        // 新規登録
        $stmt = $db->prepare('
            INSERT INTO monthly_reports
                (year, month, target_sales, result_sales, purchase, self_use, actions, after_follow, met_count, three_step_sales)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $year,
            $month,
            $data['targetSales'] ?? 0,
            $data['resultSales'] ?? 0,
            $data['purchase'] ?? 0,
            $data['selfUse'] ?? 0,
            $actions,
            $afterFollow,
            $data['metCount'] ?? 0,
            $threeStepSales
        ]);
    }

    jsonResponse(['success' => true, 'message' => '月次レポートを保存しました']);
}

/**
 * DBの行をフロントエンド形式に変換
 */
function formatReport($row) {
    return [
        'year' => (int)$row['year'],
        'month' => (int)$row['month'],
        'targetSales' => (int)$row['target_sales'],
        'resultSales' => (int)$row['result_sales'],
        'purchase' => (int)$row['purchase'],
        'selfUse' => (int)$row['self_use'],
        'actions' => $row['actions'] ? json_decode($row['actions'], true) : getDefaultActions(),
        'afterFollow' => $row['after_follow'] ? json_decode($row['after_follow'], true) : ['total' => 0, 'done' => 0],
        'metCount' => (int)$row['met_count'],
        'threeStepSales' => $row['three_step_sales'] ? json_decode($row['three_step_sales'], true) : getDefaultThreeStepSales()
    ];
}

/**
 * デフォルトのレポートデータ
 */
function getDefaultReport($year, $month) {
    return [
        'year' => (int)$year,
        'month' => (int)$month,
        'targetSales' => 0,
        'resultSales' => 0,
        'purchase' => 0,
        'selfUse' => 0,
        'actions' => getDefaultActions(),
        'afterFollow' => ['total' => 0, 'done' => 0],
        'metCount' => 0,
        'threeStepSales' => getDefaultThreeStepSales()
    ];
}

/**
 * デフォルトのアクション構造
 */
function getDefaultActions() {
    return [
        'newCustomer' => ['target' => 0, 'result' => 0, 'amount' => 0],
        'priceUp' => ['target' => 0, 'result' => 0, 'amount' => 0],
        'jp' => ['target' => 0, 'result' => 0, 'amount' => 0],
        'sample' => ['target' => 0, 'result' => 0],
        'monitor' => ['target' => 0, 'result' => 0],
        'expansion' => ['target' => 0, 'result' => 0],
        'repeat' => ['target' => 0, 'result' => 0]
    ];
}

/**
 * デフォルトの3ステップ実売数構造
 */
function getDefaultThreeStepSales() {
    return [
        'qs' => 0,
        'pack' => 0,
        'lotion' => 0,
        'mo' => 0,
        'sp' => 0
    ];
}
