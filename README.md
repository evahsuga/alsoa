# 化粧品販売管理アプリ - VSCode版

## 📋 概要

化粧品BtoC個人販売者向けの販売管理Webアプリケーションです。
月末の手書き伝票から紙書類への転記作業を効率化します。

## 🚀 クイックスタート

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

ブラウザで http://localhost:3000 を開きます。

### ビルド

```bash
# 本番用ビルド
npm run build
```

`build/` フォルダに静的ファイルが生成されます。

## 📁 ディレクトリ構造

```
cosmetics-sales-app/
├── public/
│   └── index.html              # HTMLテンプレート
├── src/
│   ├── index.jsx               # エントリーポイント
│   ├── App.jsx                 # メインコンポーネント
│   ├── data/
│   │   └── productMaster.js    # 製品マスタデータ
│   ├── utils/
│   │   ├── productUtils.js     # 製品関連ユーティリティ
│   │   ├── storage.js          # LocalStorage操作
│   │   └── printDocument.js    # PDF出力
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── SalesInput.jsx
│   │   └── ...
│   └── styles/
│       └── styles.js           # 共通スタイル定義
├── package.json
├── HANDOVER_SPECIFICATION.md   # 引継ぎ設計仕様書
└── README.md
```

## 📊 機能一覧

| 機能 | 対応書類 | 説明 |
|------|----------|------|
| ダッシュボード | - | 売上概要、目標達成率 |
| 売上伝票入力 | 書類5 | 伝票の登録・編集・削除 |
| お客様分布リスト | 書類2 | 顧客別月次購入履歴 |
| 製品別販売積算 | 書類4 | QS/ローション目標管理 |
| 月末レポート | 書類1 | 月次実績入力 |
| 年間ABC報告 | 書類3 | 年間推移表示 |
| マスタ管理 | - | 顧客・製品マスタ |
| データ管理 | - | バックアップ・復元 |

## 💾 データ保存

データはブラウザのLocalStorageに保存されます。

### バックアップ

- 月末作業後は必ずJSONバックアップを取得してください
- 「データ管理」画面からエクスポート/インポートが可能です

### 注意事項

- ブラウザのキャッシュクリアでデータが消失する可能性があります
- クラウドストレージ（Google Drive等）でのバックアップ保管を推奨します

## 🔧 開発ガイド

### 製品の追加

`src/data/productMaster.js` の `PRODUCT_MASTER` に製品を追加します。

```javascript
{
  code: '123456',
  name: '新商品名',
  price: 3000,
  category: 'other'  // QS, L, P, ES, SP, MO, 酵素, 色, other
}
```

### 新機能の追加

1. `src/components/` に新しいコンポーネントを作成
2. `App.jsx` の `menuItems` にナビゲーション追加
3. ルーティング条件分岐を追加

### スタイル変更

`src/styles/styles.js` でグローバルスタイルを定義しています。
カラーパレットは `COLORS` オブジェクトで管理しています。

## 📝 バージョン履歴

| バージョン | 変更内容 |
|------------|----------|
| v1.4 | ポイントメイクアップカテゴリ追加 |
| v1.3 | 売上履歴編集・削除機能追加 |
| v1.2 | カスタム製品追加機能 |
| v1.1 | Excel/CSVインポート対応 |
| v1.0 | 初期リリース |

## 📖 関連ドキュメント

- [引継ぎ設計仕様書](./HANDOVER_SPECIFICATION.md) - 詳細な仕様書

## 📞 サポート

開発に関する質問は、引継ぎ設計仕様書を参照してください。

---

*Last Updated: 2026-01-31*
