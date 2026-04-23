<?php
/**
 * アプリ設定API
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getSettings($db);
        break;
    case 'PUT':
        updateSettings($db);
        break;
    default:
        errorResponse('許可されていないメソッドです', 405);
}

/**
 * 設定取得
 */
function getSettings($db) {
    $stmt = $db->query('SELECT setting_key, setting_value FROM app_settings');
    $rows = $stmt->fetchAll();

    $settings = [
        'displayCutoff' => null
    ];

    foreach ($rows as $row) {
        $key = $row['setting_key'];
        $value = $row['setting_value'];

        // キー名をキャメルケースに変換
        $camelKey = lcfirst(str_replace('_', '', ucwords($key, '_')));

        $settings[$camelKey] = $value;
    }

    jsonResponse($settings);
}

/**
 * 設定更新
 */
function updateSettings($db) {
    $data = getRequestBody();

    foreach ($data as $key => $value) {
        // キャメルケースをスネークケースに変換
        $snakeKey = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $key));

        // UPSERT (INSERT OR UPDATE)
        $stmt = $db->prepare('
            INSERT INTO app_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        ');
        $stmt->execute([$snakeKey, $value, $value]);
    }

    jsonResponse(['success' => true, 'message' => '設定を更新しました']);
}
