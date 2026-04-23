# エックスサーバー デプロイガイド

化粧品販売管理アプリをエックスサーバーにデプロイする手順書です。

## 前提条件

- エックスサーバーの契約がある
- サーバーパネルにログインできる
- FTPソフト（FileZillaなど）がインストール済み

---

## Step 1: データベース作成

### 1.1 サーバーパネルにログイン

1. エックスサーバーの[サーバーパネル](https://www.xserver.ne.jp/login_server.php)にログイン
2. 「MySQL設定」をクリック

### 1.2 データベース作成

1. 「MySQL追加」タブをクリック
2. データベース名を入力（例: `arsoa_db`）
3. 文字コード: `UTF-8`を選択
4. 「確認画面へ進む」→「追加する」

### 1.3 ユーザー作成

1. 「MySQLユーザ追加」タブをクリック
2. ユーザー名とパスワードを入力（メモしておく）
3. 「確認画面へ進む」→「追加する」

### 1.4 アクセス権設定

1. 「MySQL一覧」タブをクリック
2. 作成したデータベースの「アクセス権未所有ユーザ」から作成したユーザーを選択
3. 「追加」ボタンをクリック

### 1.5 テーブル作成

1. 「phpmyadmin」リンクをクリック
2. 左側から作成したデータベースを選択
3. 「SQL」タブをクリック
4. `server/database.sql`の内容をコピー＆ペースト
5. 「実行」ボタンをクリック

---

## Step 2: PHP APIファイルの設定

### 2.1 config.phpの編集

`server/api/config.php`を開いて、以下の部分を編集：

```php
// エックスサーバー管理画面で確認した情報を入力
define('DB_HOST', 'mysql○○○.xserver.jp');  // MySQL設定画面で確認
define('DB_NAME', 'あなたのサーバーID_arsoa_db');  // 作成したDB名
define('DB_USER', 'あなたのサーバーID_ユーザー名');  // 作成したユーザー名
define('DB_PASS', '設定したパスワード');
```

**確認場所**: サーバーパネル → MySQL設定 → MySQL一覧

---

## Step 3: FTPでアップロード

### 3.1 FTP接続情報

サーバーパネル → 「FTPアカウント設定」で確認：
- ホスト: `あなたのサーバーID.xsrv.jp`
- ユーザー: `あなたのサーバーID`
- パスワード: サーバーパネルのパスワード

### 3.2 APIファイルのアップロード

1. FTPソフトでサーバーに接続
2. `/public_html/arsoa/` フォルダを作成
3. `server/api/` フォルダの中身を `/public_html/arsoa/api/` にアップロード

```
アップロード対象:
server/api/
├── .htaccess
├── config.php      ← 編集済みのもの
├── auth.php
├── customers.php
├── sales.php
├── reports.php
├── products.php
├── settings.php
├── backup.php
└── migrate.php
```

---

## Step 4: 初期パスワード設定テスト

### 4.1 ブラウザでテスト

以下のURLにアクセス（ブラウザのデベロッパーツール → Console）:

```javascript
// 認証チェックテスト
fetch('https://あなたのドメイン/arsoa/api/auth.php?action=check')
  .then(r => r.json())
  .then(d => console.log(d));
```

`{"authenticated": false}` が返ればOK。

---

## Step 5: Reactアプリのビルドとデプロイ

### 5.1 App.jsxの切り替え

サーバー版に切り替える場合、`src/index.js`を編集：

```javascript
// LocalStorage版（既存）
// import App from './App';

// サーバー版
import App from './App.server';
```

### 5.2 APIベースURLの設定

`src/utils/api.js`を編集：

```javascript
// 本番用に変更
const API_BASE = 'https://あなたのドメイン/arsoa/api';
```

### 5.3 ビルド

```bash
npm run build
```

### 5.4 ビルドファイルのアップロード

`build/`フォルダの中身を `/public_html/arsoa/` にアップロード：

```
build/
├── index.html
├── static/
│   ├── js/
│   └── css/
├── favicon.ico
└── ...
```

---

## Step 6: 動作確認

### 6.1 アプリにアクセス

`https://あなたのドメイン/arsoa/` にアクセス

### 6.2 初期パスワード設定

1. ログイン画面が表示される
2. 初回は「パスワードが設定されていません」と表示される
3. 初期パスワードを入力して設定

### 6.3 データ移行

1. **旧アプリ**（GitHub Pages版）でバックアップをエクスポート
2. **新アプリ**にログイン
3. 「データ管理」→「ファイルを選択して復元」でJSONファイルを選択
4. データが復元される

---

## トラブルシューティング

### エラー: "データベース接続に失敗しました"

- `config.php`のDB接続情報を確認
- ホスト名は `mysql○○○.xserver.jp` の形式
- ユーザー名は `サーバーID_ユーザー名` の形式

### エラー: 500 Internal Server Error

- PHPファイルの文字コードがUTF-8(BOMなし)か確認
- `.htaccess`の設定を確認

### エラー: CORS

- `config.php`の`$allowed_origins`に本番URLを追加
- ブラウザのキャッシュをクリア

### ログイン後、データが表示されない

- ブラウザのコンソールでエラーを確認
- APIの各エンドポイントを個別にテスト

---

## SSL設定（HTTPS）

### エックスサーバーの無料SSL

1. サーバーパネル → 「SSL設定」
2. 対象ドメインを選択
3. 「独自SSL設定追加」タブで「追加する」

※反映まで最大1時間かかる場合があります

---

## 運用メモ

### バックアップ

- エックスサーバーは自動バックアップあり（7日間）
- 月末作業後は手動でJSONバックアップも推奨

### パスワード変更

アプリにログイン後、実装予定の設定画面から変更可能
（現在は直接APIを叩くか、DBを直接更新）

```sql
-- パスワードをリセットする場合（phpMyAdminで実行）
UPDATE app_config
SET config_value = '$2y$10$新しいハッシュ値'
WHERE config_key = 'password_hash';
```

新しいハッシュ値の生成:
```php
<?php
echo password_hash('新しいパスワード', PASSWORD_DEFAULT);
```

---

## ファイル構成（デプロイ後）

```
/public_html/arsoa/
├── index.html          # Reactアプリ
├── static/
│   ├── js/
│   │   └── main.xxxxx.js
│   └── css/
│       └── main.xxxxx.css
├── api/
│   ├── .htaccess
│   ├── config.php
│   ├── auth.php
│   ├── customers.php
│   ├── sales.php
│   ├── reports.php
│   ├── products.php
│   ├── settings.php
│   ├── backup.php
│   └── migrate.php
└── favicon.ico
```
