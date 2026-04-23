<?php
/**
 * カスタム製品API
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        getCustomProducts($db);
        break;
    case 'POST':
        createCustomProduct($db);
        break;
    case 'DELETE':
        deleteCustomProduct($db, $id);
        break;
    default:
        errorResponse('許可されていないメソッドです', 405);
}

/**
 * カスタム製品一覧取得
 */
function getCustomProducts($db) {
    $stmt = $db->query('SELECT * FROM custom_products ORDER BY category_key, name');
    $rows = $stmt->fetchAll();

    // カテゴリごとにグループ化
    $products = [
        'skincare' => [],
        'baseMakeup' => [],
        'hairBodyCare' => [],
        'healthcare' => [],
        'pointMakeup' => [],
        'other' => []
    ];

    foreach ($rows as $row) {
        $categoryKey = $row['category_key'];
        if (!isset($products[$categoryKey])) {
            $products[$categoryKey] = [];
        }

        $products[$categoryKey][] = [
            'id' => (int)$row['id'],
            'code' => $row['code'],
            'name' => $row['name'],
            'price' => (int)$row['price'],
            'category' => $row['category'],
            'isCustom' => true
        ];
    }

    jsonResponse($products);
}

/**
 * カスタム製品登録
 */
function createCustomProduct($db) {
    $data = getRequestBody();

    if (empty($data['categoryKey'])) {
        errorResponse('カテゴリは必須です');
    }
    if (empty($data['name'])) {
        errorResponse('製品名は必須です');
    }
    if (!isset($data['price'])) {
        errorResponse('価格は必須です');
    }

    $id = $data['id'] ?? (int)(microtime(true) * 1000);
    $categoryKey = $data['categoryKey'];
    $code = $data['code'] ?? 'CUSTOM-' . $id;
    $name = $data['name'];
    $price = (int)$data['price'];
    $category = $data['category'] ?? 'other';

    try {
        $stmt = $db->prepare('
            INSERT INTO custom_products (id, category_key, code, name, price, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$id, $categoryKey, $code, $name, $price, $category]);

        jsonResponse([
            'success' => true,
            'id' => $id,
            'message' => 'カスタム製品を登録しました'
        ], 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            errorResponse('この製品コードは既に存在します');
        }
        throw $e;
    }
}

/**
 * カスタム製品削除
 */
function deleteCustomProduct($db, $id) {
    if (!$id) {
        errorResponse('製品IDが必要です');
    }

    $stmt = $db->prepare('DELETE FROM custom_products WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        errorResponse('製品が見つかりません', 404);
    }

    jsonResponse(['success' => true, 'message' => 'カスタム製品を削除しました']);
}
