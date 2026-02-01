# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

化粧品BtoC個人販売者向けの販売管理Webアプリケーション。月末の手書き伝票から5種類の紙書類への転記作業を自動化する。

## Commands

```bash
npm install     # 依存関係インストール
npm start       # 開発サーバー起動 (http://localhost:3000)
npm run build   # 本番ビルド (build/フォルダに出力)
npm test        # テスト実行
```

## Architecture

### State Management
- App.jsx が全アプリケーションStateを管理（customers, sales, monthlyReports, customProducts, displayCutoff）
- LocalStorageで永続化（`src/utils/storage.js`のSTORAGE_KEYSで定義）
- 各コンポーネントにpropsでデータと操作関数を渡す

### Routing
- React Routerは未使用。`currentView` stateで画面切り替え
- menuItemsの`id`とcurrentViewをマッチングしてコンポーネントを表示

### Data Flow
```
App.jsx (State管理・データ操作関数)
  ├── loadAllData() / saveAllData() → LocalStorage
  └── 各Componentにpropsで渡す
```

### 会計年度
- 3月〜翌2月を1会計年度とする
- `getFiscalYear(date)` で会計年度を取得
- `FISCAL_MONTHS = [3,4,5,6,7,8,9,10,11,12,1,2]`

## Key Data Structures

### Product Category Keys
`skincare`, `baseMakeup`, `hairBodyCare`, `healthcare`, `pointMakeup`

### Product Category Abbreviations
`QS`(クイーンシルバー), `L`(ローション), `P`(パック), `ES`(エッセンス), `SP`(SPプレペア), `MO`(メイクオフ), `酵素`, `色`, `other`

### Tax Rates
- ヘルスケア: 8%（軽減税率）
- その他カテゴリ: 10%

## Adding New Features

1. `src/components/`にコンポーネント作成
2. `App.jsx`の`menuItems`配列にナビ追加
3. `currentView`の条件分岐にレンダリング追加

## Adding Products

`src/data/productMaster.js`の`PRODUCT_MASTER`に追加:
```javascript
{ code: '123456', name: '商品名', price: 3000, category: 'QS' }
```

## Encoding

UTF-8必須（BOM無し）。日本語製品名を含むため文字化け注意。
