<?php
/**
 * 設定ファイル
 * 化粧品販売管理アプリ - サーバー版
 *
 * エックスサーバーの管理画面で確認した情報を入力してください
 */

// エラー表示設定（本番ではOFF）
ini_set('display_errors', 0);
error_reporting(E_ALL);

// タイムゾーン
date_default_timezone_set('Asia/Tokyo');

// ========================================
// DB接続設定（エックスサーバー用）
// ========================================
// エックスサーバー管理画面 → MySQL設定 で確認してください
define('DB_HOST', 'localhost');  // 通常はlocalhost
define('DB_NAME', 'your_database_name');  // データベース名
define('DB_USER', 'your_database_user');  // ユーザー名
define('DB_PASS', 'your_database_password');  // パスワード

// ========================================
// セッション設定
// ========================================
define('SESSION_NAME', 'cosmetics_session');
define('SESSION_LIFETIME', 86400 * 7); // 7日間

// ========================================
// CORS設定
// ========================================
// 開発時は '*' でOK。本番では特定のオリジンに制限推奨
$allowed_origins = [
    'https://evahsuga.github.io',  // 既存のGitHub Pages（移行中）
    // 本番URLを追加: 'https://〇〇〇.xsrv.jp'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins) || empty($allowed_origins[0])) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// OPTIONSリクエストへの対応（プリフライト）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ========================================
// データベース接続
// ========================================
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'データベース接続に失敗しました']);
            exit;
        }
    }
    return $pdo;
}

// ========================================
// ユーティリティ関数
// ========================================

/**
 * JSONレスポンスを返す
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * エラーレスポンスを返す
 */
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}

/**
 * リクエストボディをJSONとして取得
 */
function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

/**
 * 認証チェック（auth.phpから呼び出し）
 */
function requireAuth() {
    session_name(SESSION_NAME);
    session_start();

    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        errorResponse('認証が必要です', 401);
    }
}
