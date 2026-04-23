<?php
/**
 * 顧客API
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        getCustomers($db);
        break;
    case 'POST':
        createCustomer($db);
        break;
    case 'PUT':
        updateCustomer($db, $id);
        break;
    case 'DELETE':
        deleteCustomer($db, $id);
        break;
    default:
        errorResponse('許可されていないメソッドです', 405);
}

/**
 * 顧客一覧取得
 */
function getCustomers($db) {
    $stmt = $db->query('SELECT id, name, rank, is_app_user as isAppUser FROM customers ORDER BY name');
    $customers = $stmt->fetchAll();

    // is_app_user を boolean に変換
    foreach ($customers as &$customer) {
        $customer['id'] = (int)$customer['id'];
        $customer['isAppUser'] = (bool)$customer['isAppUser'];
    }

    jsonResponse($customers);
}

/**
 * 顧客登録
 */
function createCustomer($db) {
    $data = getRequestBody();

    if (empty($data['name'])) {
        errorResponse('顧客名は必須です');
    }

    $id = $data['id'] ?? (int)(microtime(true) * 1000);
    $name = $data['name'];
    $rank = $data['rank'] ?? 'C';
    $isAppUser = $data['isAppUser'] ?? false;

    // ランクのバリデーション
    if (!in_array($rank, ['A', 'B', 'C', 'D'])) {
        $rank = 'C';
    }

    try {
        $stmt = $db->prepare('INSERT INTO customers (id, name, rank, is_app_user) VALUES (?, ?, ?, ?)');
        $stmt->execute([$id, $name, $rank, $isAppUser ? 1 : 0]);

        jsonResponse([
            'success' => true,
            'id' => $id,
            'message' => '顧客を登録しました'
        ], 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            errorResponse('この顧客IDは既に存在します');
        }
        throw $e;
    }
}

/**
 * 顧客更新
 */
function updateCustomer($db, $id) {
    if (!$id) {
        errorResponse('顧客IDが必要です');
    }

    $data = getRequestBody();

    if (empty($data['name'])) {
        errorResponse('顧客名は必須です');
    }

    $name = $data['name'];
    $rank = $data['rank'] ?? 'C';
    $isAppUser = $data['isAppUser'] ?? false;

    // ランクのバリデーション
    if (!in_array($rank, ['A', 'B', 'C', 'D'])) {
        $rank = 'C';
    }

    $stmt = $db->prepare('UPDATE customers SET name = ?, rank = ?, is_app_user = ? WHERE id = ?');
    $stmt->execute([$name, $rank, $isAppUser ? 1 : 0, $id]);

    if ($stmt->rowCount() === 0) {
        errorResponse('顧客が見つかりません', 404);
    }

    // 売上テーブルの顧客名も更新（整合性維持）
    if (isset($data['oldName']) && $data['oldName'] !== $name) {
        $stmt = $db->prepare('UPDATE sales SET customer_name = ? WHERE customer_name = ?');
        $stmt->execute([$name, $data['oldName']]);
    }

    jsonResponse(['success' => true, 'message' => '顧客情報を更新しました']);
}

/**
 * 顧客削除
 */
function deleteCustomer($db, $id) {
    if (!$id) {
        errorResponse('顧客IDが必要です');
    }

    $stmt = $db->prepare('DELETE FROM customers WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        errorResponse('顧客が見つかりません', 404);
    }

    jsonResponse(['success' => true, 'message' => '顧客を削除しました']);
}
