<?php
/**
 * 売上API
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        getSales($db);
        break;
    case 'POST':
        createSale($db);
        break;
    case 'PUT':
        updateSale($db, $id);
        break;
    case 'DELETE':
        deleteSale($db, $id);
        break;
    default:
        errorResponse('許可されていないメソッドです', 405);
}

/**
 * 売上一覧取得
 */
function getSales($db) {
    $month = $_GET['month'] ?? null;
    $year = $_GET['year'] ?? null;
    $fiscalYear = $_GET['fiscalYear'] ?? null;

    $sql = '
        SELECT
            s.id,
            s.sale_date as date,
            s.customer_name as customerName,
            s.created_at as createdAt,
            s.updated_at as updatedAt
        FROM sales s
    ';

    $params = [];

    if ($month) {
        // 特定月の売上
        $sql .= ' WHERE DATE_FORMAT(s.sale_date, "%Y-%m") = ?';
        $params[] = $month;
    } elseif ($year && isset($_GET['month'])) {
        // 年月指定
        $sql .= ' WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ?';
        $params[] = $year;
        $params[] = $_GET['month'];
    } elseif ($fiscalYear) {
        // 会計年度（3月〜翌2月）
        $sql .= ' WHERE (
            (MONTH(s.sale_date) >= 3 AND YEAR(s.sale_date) = ?) OR
            (MONTH(s.sale_date) <= 2 AND YEAR(s.sale_date) = ?)
        )';
        $params[] = $fiscalYear;
        $params[] = $fiscalYear + 1;
    }

    $sql .= ' ORDER BY s.sale_date DESC, s.id DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $salesRows = $stmt->fetchAll();

    // 売上IDを収集
    $saleIds = array_column($salesRows, 'id');

    if (empty($saleIds)) {
        jsonResponse([]);
        return;
    }

    // 明細を一括取得
    $placeholders = implode(',', array_fill(0, count($saleIds), '?'));
    $stmt = $db->prepare("
        SELECT
            sale_id as saleId,
            product_code as code,
            product_name as name,
            price,
            quantity,
            category
        FROM sale_items
        WHERE sale_id IN ($placeholders)
        ORDER BY id
    ");
    $stmt->execute($saleIds);
    $items = $stmt->fetchAll();

    // 明細をsale_idでグループ化
    $itemsBySaleId = [];
    foreach ($items as $item) {
        $saleId = $item['saleId'];
        unset($item['saleId']);
        $item['price'] = (int)$item['price'];
        $item['quantity'] = (int)$item['quantity'];
        $itemsBySaleId[$saleId][] = $item;
    }

    // 結果を組み立て
    $sales = [];
    foreach ($salesRows as $row) {
        $sales[] = [
            'id' => (int)$row['id'],
            'date' => $row['date'],
            'customerName' => $row['customerName'],
            'items' => $itemsBySaleId[$row['id']] ?? [],
            'createdAt' => $row['createdAt'],
            'updatedAt' => $row['updatedAt']
        ];
    }

    jsonResponse($sales);
}

/**
 * 売上登録
 */
function createSale($db) {
    $data = getRequestBody();

    if (empty($data['date'])) {
        errorResponse('日付は必須です');
    }
    if (empty($data['customerName'])) {
        errorResponse('顧客名は必須です');
    }
    if (empty($data['items']) || !is_array($data['items'])) {
        errorResponse('商品は1つ以上必要です');
    }

    $id = $data['id'] ?? (int)(microtime(true) * 1000);
    $date = $data['date'];
    $customerName = $data['customerName'];
    $items = $data['items'];

    $db->beginTransaction();
    try {
        // 売上ヘッダー登録
        $stmt = $db->prepare('INSERT INTO sales (id, sale_date, customer_name) VALUES (?, ?, ?)');
        $stmt->execute([$id, $date, $customerName]);

        // 明細登録
        $stmt = $db->prepare('
            INSERT INTO sale_items (sale_id, product_code, product_name, price, quantity, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ');

        foreach ($items as $item) {
            $stmt->execute([
                $id,
                $item['code'] ?? '',
                $item['name'] ?? '',
                $item['price'] ?? 0,
                $item['quantity'] ?? 1,
                $item['category'] ?? ''
            ]);
        }

        $db->commit();

        jsonResponse([
            'success' => true,
            'id' => $id,
            'message' => '売上を登録しました'
        ], 201);
    } catch (Exception $e) {
        $db->rollBack();
        error_log('Sale creation failed: ' . $e->getMessage());
        errorResponse('売上の登録に失敗しました', 500);
    }
}

/**
 * 売上更新
 */
function updateSale($db, $id) {
    if (!$id) {
        errorResponse('売上IDが必要です');
    }

    $data = getRequestBody();

    if (empty($data['date'])) {
        errorResponse('日付は必須です');
    }
    if (empty($data['customerName'])) {
        errorResponse('顧客名は必須です');
    }
    if (empty($data['items']) || !is_array($data['items'])) {
        errorResponse('商品は1つ以上必要です');
    }

    $db->beginTransaction();
    try {
        // 売上ヘッダー更新
        $stmt = $db->prepare('
            UPDATE sales
            SET sale_date = ?, customer_name = ?, updated_at = NOW()
            WHERE id = ?
        ');
        $stmt->execute([$data['date'], $data['customerName'], $id]);

        if ($stmt->rowCount() === 0) {
            $db->rollBack();
            errorResponse('売上が見つかりません', 404);
        }

        // 明細を削除して再登録
        $stmt = $db->prepare('DELETE FROM sale_items WHERE sale_id = ?');
        $stmt->execute([$id]);

        $stmt = $db->prepare('
            INSERT INTO sale_items (sale_id, product_code, product_name, price, quantity, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ');

        foreach ($data['items'] as $item) {
            $stmt->execute([
                $id,
                $item['code'] ?? '',
                $item['name'] ?? '',
                $item['price'] ?? 0,
                $item['quantity'] ?? 1,
                $item['category'] ?? ''
            ]);
        }

        $db->commit();
        jsonResponse(['success' => true, 'message' => '売上を更新しました']);
    } catch (Exception $e) {
        $db->rollBack();
        error_log('Sale update failed: ' . $e->getMessage());
        errorResponse('売上の更新に失敗しました', 500);
    }
}

/**
 * 売上削除
 */
function deleteSale($db, $id) {
    if (!$id) {
        errorResponse('売上IDが必要です');
    }

    // CASCADE削除で明細も自動削除される
    $stmt = $db->prepare('DELETE FROM sales WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        errorResponse('売上が見つかりません', 404);
    }

    jsonResponse(['success' => true, 'message' => '売上を削除しました']);
}
