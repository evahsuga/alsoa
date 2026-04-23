<?php
/**
 * 認証API
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';

session_name(SESSION_NAME);
session_set_cookie_params([
    'lifetime' => SESSION_LIFETIME,
    'path' => '/',
    'secure' => true,  // HTTPS必須
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    case 'change-password':
        handleChangePassword();
        break;
    case 'init-password':
        handleInitPassword();
        break;
    default:
        errorResponse('不明なアクションです', 404);
}

/**
 * ログイン処理
 */
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('POSTメソッドを使用してください', 405);
    }

    $data = getRequestBody();
    $password = $data['password'] ?? '';

    if (empty($password)) {
        errorResponse('パスワードを入力してください');
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT config_value FROM app_config WHERE config_key = ?');
    $stmt->execute(['password_hash']);
    $row = $stmt->fetch();

    if (!$row) {
        errorResponse('パスワードが設定されていません。初期設定を行ってください。', 500);
    }

    if (password_verify($password, $row['config_value'])) {
        $_SESSION['authenticated'] = true;
        $_SESSION['login_time'] = time();
        jsonResponse(['success' => true, 'message' => 'ログインしました']);
    } else {
        errorResponse('パスワードが正しくありません', 401);
    }
}

/**
 * ログアウト処理
 */
function handleLogout() {
    $_SESSION = [];
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'ログアウトしました']);
}

/**
 * 認証状態確認
 */
function handleCheck() {
    $authenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
    jsonResponse(['authenticated' => $authenticated]);
}

/**
 * パスワード変更
 */
function handleChangePassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('POSTメソッドを使用してください', 405);
    }

    // 認証チェック
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        errorResponse('認証が必要です', 401);
    }

    $data = getRequestBody();
    $currentPassword = $data['currentPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        errorResponse('現在のパスワードと新しいパスワードを入力してください');
    }

    if (strlen($newPassword) < 4) {
        errorResponse('新しいパスワードは4文字以上にしてください');
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT config_value FROM app_config WHERE config_key = ?');
    $stmt->execute(['password_hash']);
    $row = $stmt->fetch();

    if (!$row || !password_verify($currentPassword, $row['config_value'])) {
        errorResponse('現在のパスワードが正しくありません');
    }

    // 新しいパスワードをハッシュ化して保存
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE app_config SET config_value = ? WHERE config_key = ?');
    $stmt->execute([$newHash, 'password_hash']);

    jsonResponse(['success' => true, 'message' => 'パスワードを変更しました']);
}

/**
 * 初期パスワード設定（初回のみ）
 */
function handleInitPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('POSTメソッドを使用してください', 405);
    }

    $data = getRequestBody();
    $password = $data['password'] ?? '';

    if (empty($password)) {
        errorResponse('パスワードを入力してください');
    }

    if (strlen($password) < 4) {
        errorResponse('パスワードは4文字以上にしてください');
    }

    $db = getDB();

    // 既にパスワードが設定されているか確認
    $stmt = $db->prepare('SELECT config_value FROM app_config WHERE config_key = ?');
    $stmt->execute(['password_hash']);
    $row = $stmt->fetch();

    if ($row && strpos($row['config_value'], '$2y$') === 0) {
        // 既に有効なハッシュが設定されている
        errorResponse('パスワードは既に設定されています。変更はログイン後に行ってください。');
    }

    // パスワードをハッシュ化して保存
    $hash = password_hash($password, PASSWORD_DEFAULT);

    if ($row) {
        $stmt = $db->prepare('UPDATE app_config SET config_value = ? WHERE config_key = ?');
        $stmt->execute([$hash, 'password_hash']);
    } else {
        $stmt = $db->prepare('INSERT INTO app_config (config_key, config_value) VALUES (?, ?)');
        $stmt->execute(['password_hash', $hash]);
    }

    // 自動ログイン
    $_SESSION['authenticated'] = true;
    $_SESSION['login_time'] = time();

    jsonResponse(['success' => true, 'message' => '初期パスワードを設定しました']);
}
