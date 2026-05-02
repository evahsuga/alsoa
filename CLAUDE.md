# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

化粧品BtoC個人販売者向けの販売管理Webアプリ（v3.3）。月末の手書き伝票から7種類の書類への転記を自動化する。

**本番URL (GitHub Pages)**: https://evahsuga.github.io/alsoa/  
**本番URL (エックスサーバー)**: https://evahpro.xsrv.jp/arsoa/

## Commands

```bash
npm start                          # 開発サーバー (http://localhost:3000)
npm run build                      # GitHub Pages用ビルド (PUBLIC_URL=/alsoa)
npm run build:xserver              # エックスサーバー用ビルド (PUBLIC_URL=/arsoa, App.server.jsx使用)
npm run deploy && npm run deploy:xserver  # 両環境同時デプロイ（常にこの形で実行）
```

**⚠️ デプロイ注意**: GitHub Pages (`/alsoa/`) とエックスサーバー (`/arsoa/`) はベースパスが異なるため、同じビルド成果物を使い回してはいけない。`deploy:xserver` は内部で `build:xserver` を実行するので、常に上記の両環境同時コマンドを使うこと。

## 二重アプリ構成（最重要）

このリポジトリには**2つの独立したメインコンポーネント**が存在する：

| ファイル | 用途 | データ永続化 | 認証 |
|---------|------|------------|------|
| `src/App.jsx` | GitHub Pages版 | LocalStorage | なし |
| `src/App.server.jsx` | エックスサーバー版 | MySQL（PHP API経由） | パスワード認証あり |

`src/index.jsx` が環境変数 `REACT_APP_USE_SERVER=true` の有無で使用するAppを切り替える。**新機能追加・メニュー追加・ルーティング追加は必ず両ファイルに行うこと。**

## Architecture

### State Management
- `App.jsx` / `App.server.jsx` が全Stateを管理（customers, sales, monthlyReports, customProducts, displayCutoff）
- LocalStorage版: `src/utils/storage.js` の `loadAllData()` / `saveAllData()`
- サーバー版: `src/utils/api.js` の `ApiClient` クラス（`/arsoa/api/` のPHP APIへfetch）

### Routing
- React Router未使用。`currentView` stateで画面切り替え
- `menuItems` 配列の `id` と `currentView` をマッチング

### 書類一覧
| 画面ID | 書類 | コンポーネント |
|--------|------|--------------|
| `sales-input` | 書類5・売上伝票入力 | SalesInput.jsx |
| `customer-list` | 書類2・お客様分布リスト | CustomerList.jsx |
| `product-count` | 書類4・製品別販売積算 | ProductCount.jsx |
| `monthly-report` | 書類1・月末レポート | MonthlyReport.jsx |
| `yearly-report` | 書類3・年間ABC報告 | YearlyReport.jsx |
| `income-statement` | 書類6・収支計算書 | IncomeStatement.jsx |
| `beyond` | 書類7・Beyond（仕入れ目標達成） | Beyond.jsx |

## Key Data Structures

### monthlyReports（月次レポート）
```javascript
{
  year: 2026, month: 4,
  targetSales: 0,
  resultSales: 0,        // 通常顧客の売上（アプリ利用者除外）
  purchase: 0,           // 仕入れ（上代）
  purchaseInvoice: 0,    // 仕入れ（請求受額）← 書類6の④仕入金額
  salesBonus: 0,         // 販売奨励金 ← 書類6の⑥
  selfUse: 0,            // 自分の使用金額（アプリ利用者分が自動集計）
  expenses: 0,           // 経費合計 ← 書類6の⑧（月末レポートで入力）
  inventory: 0,          // 在庫金額 ← 書類6の⑩（月末レポートで入力）
  threeStepSales: { qs: 0, pack: 0, lotion: 0, mo: 0, sp: 0 },
  purchaseCount:  { qs: 0, pack: 0, lotion: 0, mo: 0, sp: 0 }, // 仕入れ個数 ← 書類7で集計
  actions: { newCustomer, priceUp, jp, sample, monitor, expansion, repeat },
  afterFollow: { total: 0, done: 0 },
  metCount: 0
}
```

新フィールドを追加する場合は `MonthlyReport.jsx` の `useState` 初期値と `useEffect` 内リセット値の**2箇所**に追加が必要。サーバー版では `server/api/reports.php` の saveReport・formatReport・getDefaultReport と、DBテーブルへの `ALTER TABLE` も必要。

### 書類6（収支計算書）の計算式
- ③売上合計 = ①resultSales + ②selfUse
- ⑤売上利益 = ③ - ④purchaseInvoice
- ⑦売上総利益 = ⑤ + ⑥salesBonus
- ⑨所得金額 = ⑦ - ⑧expenses
- ⑩在庫金額（参照のみ・計算なし）

書類6の⑧経費合計・⑩在庫金額は**月末レポート画面で入力**し、収支計算書は読み取り専用で表示する。

### 書類7（Beyond）の仕入れ目標
QS: 120個 / パック: 60個 / ローション: 210本 / MO: 90本 / SP: 60本  
`monthlyReports[].purchaseCount` を会計年度分集計して達成率を表示。

### Product Category Keys
`skincare`, `baseMakeup`, `hairBodyCare`, `healthcare`, `pointMakeup`, `other`

### アプリ利用者 (`isAppUser` フラグ)
販売者本人の自己使用分を区別する顧客フラグ：
- ダッシュボード・年間ABC報告: **除外**
- 月末レポート: resultSalesから**除外**、selfUseに**自動集計**
- お客様分布リスト: **表示する**（青背景、合計から除外）
- 製品別販売積算: **含める**

## 3ステップ実売数カウントルール

- **QS**: `'QS'` または `'QS('` で始まる + set3系 + B4系
- **P**: `'P'` 完全一致 + set3系 + B4系
- **L**: `'LI'`, `'LII'`, `'Lｾﾙ'` + set3系 + B4系
- **MO**: `'MO'` 完全一致 + B4系
- **SP**: `'下地SP'` 完全一致
- **MP**: `'下地MP'` 完全一致
- **set3系** (`set3Ⅰ`, `set3Ⅱ`, `set3ｾﾙ`): QS + P + L を各+1
- **B4系** (`B4Ⅰ`, `B4Ⅱ`, `B4ｾﾙ`): QS + P + L + MO を各+1

## 会計年度

3月〜翌2月が1会計年度。`FISCAL_MONTHS = [3,4,5,6,7,8,9,10,11,12,1,2]`。  
`getFiscalYear(date)` で年度取得（`src/utils/productUtils.js`）。  
month >= 3 は `selectedYear`、month < 3（1・2月）は `selectedYear + 1` の年を使う。

## Styling

- CSS-in-JS（インラインスタイル）。共通スタイルは `src/styles/styles.js`
- カラー: メイン `#1a1a2e`、アクセント `#e94560`、成功 `#10b981`、情報 `#3b82f6`

## Adding New Features

1. `src/components/` にコンポーネント作成
2. **`App.jsx` と `App.server.jsx` の両方**に import・menuItems・ルーティング追加
3. monthlyReportsの新フィールドを使う場合:
   - `MonthlyReport.jsx` の useState・useEffect 初期値（2箇所）に追加
   - `server/api/reports.php` の saveReport・formatReport・getDefaultReport に追加
   - SSHでDBカラムを追加: `mysql -h mysql201b.xserver.jp -u evahpro_arsoa -pPASSWORD evahpro_arsoa -e "ALTER TABLE monthly_reports ADD COLUMN ..."`

## Server-Side API (エックスサーバー版のみ)

`server/api/` 以下にPHPファイル群。`src/utils/api.js` の `ApiClient` が呼び出す。  
APIエンドポイント: `https://evahpro.xsrv.jp/arsoa/api/*.php`  
設定ファイル: `server/api/config.php`（DB接続情報）

PHPファイルの更新は rsync で個別アップロード:
```bash
rsync -avz server/api/reports.php xserver-blog:/home/evahpro/evahpro.xsrv.jp/public_html/arsoa/api/
```

## SSH / Deploy

```
Host: xserver-blog（~/.ssh/config に設定済み）
実体: evahpro@evahpro.xsrv.jp:10022, 鍵: ~/.ssh/evahpro.key
デプロイ先: /home/evahpro/evahpro.xsrv.jp/public_html/arsoa/
api/ ディレクトリはrsync除外（PHPファイルは手動管理）
DB: mysql201b.xserver.jp / evahpro_arsoa / evahpro_arsoa
```
