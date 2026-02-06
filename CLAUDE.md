# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

化粧品BtoC個人販売者向けの販売管理Webアプリケーション。月末の手書き伝票から5種類の紙書類への転記作業を自動化する。

**本番URL**: https://evahsuga.github.io/alsoa/

## Commands

```bash
npm install     # 依存関係インストール
npm start       # 開発サーバー起動 (http://localhost:3000)
npm run build   # 本番ビルド (build/フォルダに出力)
npm run deploy  # GitHub Pagesへデプロイ（build後に自動実行）
npm test        # テスト実行
```

## Architecture

### State Management
- App.jsx が全アプリケーションStateを管理（customers, sales, monthlyReports, customProducts, displayCutoff, sidebarCollapsed）
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

### レスポンシブ対応
- `useMediaQuery` フックで画面サイズ検出（768px境界）
- モバイル: ハンバーガーメニュー + スライドインサイドバー
- PC: 折りたたみ可能なサイドバー（`sidebarCollapsed` state）

### 会計年度
- 3月〜翌2月を1会計年度とする
- `getFiscalYear(date)` で会計年度を取得
- `FISCAL_MONTHS = [3,4,5,6,7,8,9,10,11,12,1,2]`

## Key Data Structures

### Product Category Keys
`skincare`, `baseMakeup`, `hairBodyCare`, `healthcare`, `pointMakeup`, `other`

### Product Abbreviations (略称)
- 6文字以内の半角カタカナ推奨（表示崩れ防止）
- お客様分布リスト集計グループ: `QS`, `L`, `P`, `MO`, `SP`, `other`
- セット商品は複数グループにカウント（set3→QS+L+P, B4→QS+L+P+MO）
- 略称マッピング: `CATEGORY_ABBREV`（productMaster.js）

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
※略称は`CATEGORY_ABBREV`にも追加が必要

## Styling

- CSS-in-JS（インラインスタイル）使用
- 共通スタイルは`src/styles/styles.js`で定義
- 幅の広いテーブルは`minWidth`設定で横スクロール対応
- sticky列は`position: sticky`+`left`+`zIndex`で実装

## Encoding

UTF-8必須（BOM無し）。日本語製品名を含むため文字化け注意。
