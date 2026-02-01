# 化粧品販売管理アプリ VSCode版 引継ぎ設計仕様書

## 📋 ドキュメント情報

| 項目 | 内容 |
|------|------|
| 作成日 | 2026年1月31日 |
| 対象バージョン | ポイントメイク追加版 (v1.4) |
| 対象ファイル | cosmetics-sales-app_ポイントメイク追加.html |
| 総行数 | 2,829行 |

---

## 🎯 プロジェクト概要

### 目的
化粧品BtoC個人販売者向けの販売管理Webアプリケーション

### 現状の課題
月末に手書き伝票から5種類の紙書類へ手作業で転記

### 解決策
売上伝票入力→各書類への自動反映で業務効率化

### 現場評価
**大変好評** - 実用段階に到達

---

## 📁 現行ファイル構造分析

### 単一HTMLファイル構成（2,829行）

```
cosmetics-sales-app_ポイントメイク追加.html
│
├─ [1-28行] HTML基本構造
│   ├─ DOCTYPE, meta charset="UTF-8"
│   ├─ CDNリンク (React 18.2.0, ReactDOM, Babel, XLSX 0.18.5)
│   ├─ Google Fonts (Noto Sans JP)
│   └─ 基本CSS (リセット, @keyframes spin)
│
├─ [29-388行] スクリプト開始・ユーティリティ
│   ├─ [38-191行] 製品マスタデータ (PRODUCT_MASTER)
│   │   ├─ skincare: スキンケア (税率10%) - 20製品
│   │   ├─ baseMakeup: ベースメイク (税率10%) - 15製品
│   │   ├─ hairBodyCare: ヘア&ボディ (税率10%) - 17製品
│   │   ├─ healthcare: ヘルスケア (税率8%) - 22製品
│   │   └─ pointMakeup: ポイントメイク (税率10%) - 41製品 ★新規追加
│   │
│   ├─ [194-205行] カテゴリ略称マッピング (CATEGORY_ABBREV)
│   ├─ [207-248行] ユーティリティ関数
│   │   ├─ getAllProducts() - カスタム製品含む全製品取得
│   │   ├─ findProductByCode() - 製品検索
│   │   └─ getFiscalYear() - 会計年度計算 (3月〜翌2月)
│   └─ [253-388行] printDocument() - PDF出力関数
│
├─ [393-789行] メインコンポーネント: CosmeticsSalesApp
│   ├─ State定義 (useState)
│   │   ├─ currentView - 現在の画面
│   │   ├─ customers - 顧客リスト
│   │   ├─ sales - 売上データ
│   │   ├─ monthlyReports - 月次レポート
│   │   ├─ customProducts - カスタム製品
│   │   ├─ displayCutoff - 履歴表示基準日
│   │   └─ notification - 通知
│   │
│   ├─ データ操作関数
│   │   ├─ loadData() / saveData() - LocalStorage操作
│   │   ├─ addCustomer() / updateCustomer() / deleteCustomer()
│   │   ├─ addCustomProduct() / deleteCustomProduct()
│   │   ├─ addSale() / updateSale() / deleteSale()
│   │   ├─ saveMonthlyReport()
│   │   ├─ exportBackup() / importBackup() - JSONバックアップ
│   │   └─ importCustomersFile() - Excel/CSVインポート
│   │
│   └─ ナビゲーション・ルーティング
│
├─ [794-2618行] サブコンポーネント
│   ├─ [794-939行] Dashboard - ダッシュボード
│   ├─ [940-1400行] SalesInput - 売上伝票入力 ★履歴編集機能付き
│   ├─ [1400-1565行] CustomerList - お客様分布リスト (書類2)
│   ├─ [1568-1713行] ProductCount - 製品別販売積算 (書類4)
│   ├─ [1718-2050行] MonthlyReport - 月末レポート入力 (書類1)
│   ├─ [2050-2237行] YearlyReport - 年間ABC報告 (書類3)
│   ├─ [2242-2557行] MasterManagement - マスタ管理
│   └─ [2562-2618行] BackupManagement - データ管理
│
├─ [2623-2822行] スタイル定義 (styles オブジェクト)
│
└─ [2825行] ReactDOM.render()
```

---

## 🔧 VSCode版への分割提案

### 推奨ディレクトリ構造

```
cosmetics-sales-app/
│
├─ public/
│   └─ index.html              # エントリーポイント
│
├─ src/
│   ├─ index.jsx               # ReactDOM.render
│   │
│   ├─ App.jsx                 # メインコンポーネント (CosmeticsSalesApp)
│   │
│   ├─ data/
│   │   ├─ productMaster.js    # 製品マスタデータ
│   │   ├─ categoryAbbrev.js   # カテゴリ略称
│   │   └─ fiscalMonths.js     # 会計年度定義
│   │
│   ├─ utils/
│   │   ├─ productUtils.js     # 製品関連ユーティリティ
│   │   ├─ fiscalYear.js       # 会計年度計算
│   │   ├─ printDocument.js    # PDF出力
│   │   └─ storage.js          # LocalStorage操作
│   │
│   ├─ components/
│   │   ├─ Dashboard.jsx
│   │   ├─ SalesInput.jsx
│   │   ├─ CustomerList.jsx
│   │   ├─ ProductCount.jsx
│   │   ├─ MonthlyReport.jsx
│   │   ├─ YearlyReport.jsx
│   │   ├─ MasterManagement.jsx
│   │   └─ BackupManagement.jsx
│   │
│   ├─ styles/
│   │   └─ styles.js           # 共通スタイル定義
│   │
│   └─ hooks/
│       └─ useNotification.js  # 通知カスタムフック
│
├─ package.json
├─ README.md
└─ .gitignore
```

---

## ⚠️ 文字化け対策（重要）

### 現行ファイルの文字コード設定

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
```

### 日本語フォント設定

```css
font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
```

### VSCode設定推奨事項

#### .vscode/settings.json
```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false,
  "[javascript]": {
    "files.encoding": "utf8"
  },
  "[html]": {
    "files.encoding": "utf8"
  },
  "editor.formatOnSave": true
}
```

#### .editorconfig
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true

[*.{js,jsx,ts,tsx,json,html,css}]
indent_style = space
indent_size = 2
```

### 文字化け発生時のチェックリスト

1. **ファイルのBOM確認**: UTF-8 BOM無しで保存
2. **改行コード**: LF (Unix形式) を使用
3. **HTMLメタタグ**: `<meta charset="UTF-8">` が最初のmetaタグであること
4. **製品名の確認**: 特殊文字（〜、＆など）が正しく表示されるか確認

---

## 📊 データ構造

### LocalStorageキー

| キー | 内容 | バージョン |
|------|------|------------|
| cosmetics_customers | 顧客データ | v1.0〜 |
| cosmetics_sales | 売上データ | v1.0〜 |
| cosmetics_monthly_reports | 月次レポート | v1.0〜 |
| cosmetics_custom_products | カスタム製品 | v1.2〜 |
| cosmetics_display_cutoff | 履歴表示基準日 | v1.3〜 |

### customers（顧客）
```javascript
{
  id: 1234567890,        // Date.now() で生成
  name: "山田花子",       // 顧客名
  rank: "A"              // A/B/C/D
}
```

### sales（売上）
```javascript
{
  id: 1234567890,
  date: "2026-01-15",     // YYYY-MM-DD
  customerName: "山田花子",
  items: [
    {
      code: "421628",
      name: "アルソアクイーンシルバー(135g)",
      price: 4000,
      quantity: 2,
      category: "QS"      // 略称コード
    }
  ],
  createdAt: "2026-01-15T10:30:00.000Z",
  updatedAt: "2026-01-15T11:00:00.000Z"  // 編集時のみ
}
```

### customProducts（カスタム製品）
```javascript
{
  skincare: [
    {
      id: 1234567890,
      code: "999001",
      name: "カスタム製品名",
      price: 5000,
      category: "other",
      isCustom: true
    }
  ],
  baseMakeup: [],
  hairBodyCare: [],
  healthcare: [],
  pointMakeup: []
}
```

### monthlyReports（月次レポート）
```javascript
{
  year: 2026,
  month: 1,
  targetSales: 100000,
  resultSales: 85000,
  actions: {
    newCustomer: { target: 0, result: 0, amount: 0 },
    priceUp: { target: 0, result: 0, amount: 0 },
    jp: { target: 0, result: 0, amount: 0 },
    sample: { target: 0, result: 0 },
    monitor: { target: 0, result: 0 },
    expansion: { target: 0, result: 0 },
    repeat: { target: 0, result: 0 }
  },
  afterFollow: { total: 0, done: 0 },
  metCount: 0,
  threeStepSales: { qs: 0, pack: 0, lotion: 0 },
  purchase: 50000,       // 仕入れ額
  selfUse: 10000         // 自己使用額
}
```

---

## 📝 製品マスタデータ（5カテゴリ）

### カテゴリ一覧

| カテゴリキー | 名称 | 税率 | 製品数 |
|-------------|------|------|--------|
| skincare | スキンケア | 10% | 20 |
| baseMakeup | ベースメイクアップ | 10% | 15 |
| hairBodyCare | ヘアケア&ボディケア | 10% | 17 |
| healthcare | ヘルスケア | 8% | 22 |
| pointMakeup | ポイントメイクアップ | 10% | 41 ★新規 |

### 略称マッピング

```javascript
const CATEGORY_ABBREV = {
  'QS': 'クイーンシルバー',  // せっけん
  'L': 'ローション',
  'P': 'パック',
  'ES': 'エッセンス',
  'SP': 'SPプレペア',
  'MO': 'メイクオフ',
  '酵素': '酵素',
  '色': '色',               // ポイントメイク用
  'other': 'その他'
};
```

---

## 🎨 UIコンポーネント仕様

### 画面一覧

| ID | 画面名 | 対応書類 | 主要機能 |
|----|--------|----------|----------|
| dashboard | ダッシュボード | - | 概要表示、目標達成率 |
| sales-input | 売上伝票入力 | 書類5 | 伝票登録・編集・削除 |
| customer-list | お客様分布リスト | 書類2 | 顧客別月次購入履歴 |
| product-count | 製品別販売積算 | 書類4 | QS/ローション目標管理 |
| monthly-report | 月末レポート | 書類1 | 月次実績入力 |
| yearly-report | 年間ABC報告 | 書類3 | 年間推移表示 |
| master | マスタ管理 | - | 顧客・製品マスタ |
| backup | データ管理 | - | バックアップ操作 |

### スタイル方針

- **CSS-in-JS**: インラインスタイルオブジェクト使用
- **カラーテーマ**:
  - メイン: #1a1a2e (ダークネイビー)
  - アクセント: #e94560 (ピンク)
  - 成功: #10b981 (グリーン)
  - 情報: #3b82f6 (ブルー)
  - 警告: #f59e0b (オレンジ)

---

## 🔄 バージョン履歴

| バージョン | 主な変更 |
|------------|----------|
| v1.0 | 初期リリース（4カテゴリ） |
| v1.1 | Excel/CSVインポート対応 |
| v1.2 | カスタム製品追加機能 |
| v1.3 | 売上履歴編集・削除機能、履歴クリア機能 |
| v1.4 | ポイントメイクアップカテゴリ追加（41製品） |

---

## 🚀 拡張時の注意事項

### 製品追加時
1. `PRODUCT_MASTER`に製品を追加
2. 必要に応じて`CATEGORY_ABBREV`に略称追加
3. `customProducts`の初期値にカテゴリキーを追加

### 新機能追加時
1. メインコンポーネントの`menuItems`にナビゲーション追加
2. `currentView`の条件分岐に画面追加
3. 対応するサブコンポーネントを作成

### データ移行時
1. `exportBackup`でJSONバックアップ
2. 新バージョンの`version`値を更新
3. `importBackup`で互換性を確認

---

## 📞 サポート情報

### 既知の制限事項
- LocalStorage容量制限（約5MB）
- ブラウザキャッシュクリアでデータ消失の可能性
- OCR機能は未実装（UIのみ）

### 推奨バックアップ運用
- 月末作業後は必ずJSONバックアップ
- クラウドストレージ（Google Drive等）での保管推奨

---

*本仕様書は VSCode編集版への移行を支援するために作成されました*
