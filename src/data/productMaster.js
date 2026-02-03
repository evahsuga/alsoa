/**
 * 製品マスタデータ
 * 化粧品販売管理アプリ - VSCode版
 * 
 * @version 1.4
 * @lastUpdated 2026-01-31
 */

export const PRODUCT_MASTER = {
  skincare: {
    name: 'スキンケア',
    taxRate: 10,
    products: [
      { code: '421628', name: 'アルソアクイーンシルバー(135g)', price: 4000, category: 'QS' },
      { code: '421636', name: 'アルソアクイーンシルバー(70g)', price: 2200, category: 'QS' },
      { code: '421644', name: 'アルソアクイーンシルバーPF(70g)', price: 2200, category: 'QS' },
      { code: '421652', name: 'アルソア クレイパック', price: 3500, category: 'P' },
      { code: '421660', name: 'アルソア ローションI', price: 3500, category: 'L' },
      { code: '421678', name: 'アルソア ローションII', price: 3500, category: 'L' },
      { code: '421686', name: 'アルソア セルローション', price: 4800, category: 'L' },
      { code: '430265', name: 'アルソア エッセンスI', price: 5000, category: 'ES' },
      { code: '421701', name: 'アルソア エッセンスII', price: 8000, category: 'ES' },
      { code: '430273', name: 'アルソア セルエッセンス', price: 13000, category: 'ES' },
      { code: '421727', name: 'アルソア モイストベイス', price: 4500, category: 'other' },
      { code: '430281', name: 'アルソア セルセラム', price: 8000, category: 'other' },
      { code: '446775', name: 'アルソア エス', price: 5000, category: 'other' },
      { code: '421751', name: 'アルソア セルジェル', price: 7000, category: 'other' },
      { code: '421769', name: 'アルソア エッセンスマスク', price: 7500, category: 'other' },
      { code: '421777', name: 'アルソア モイスチュアージェル', price: 3800, category: 'other' },
      { code: '419540', name: 'アムニーAP ソープ', price: 3500, category: 'other' },
      { code: '429789', name: 'アムニーAP スキンソープ', price: 2000, category: 'other' },
      { code: '386898', name: 'アムニーAP スキンローション', price: 2700, category: 'other' },
      { code: '386905', name: 'アムニーAP スキンコート', price: 2500, category: 'other' },
    ]
  },

  baseMakeup: {
    name: 'ベースメイクアップ',
    taxRate: 10,
    products: [
      { code: '441501', name: 'リベストナチュラルプレペア', price: 4000, category: 'other' },
      { code: '441519', name: 'リベストSPプレペア', price: 4200, category: 'SP' },
      { code: '441527', name: 'リベストモイストプレペア', price: 4500, category: 'other' },
      { code: '441535', name: 'リベストリキッドF ナチュラルピンク(01)', price: 4000, category: 'other' },
      { code: '441543', name: 'リベストリキッドF ナチュラルライト(02)', price: 4000, category: 'other' },
      { code: '441551', name: 'リベストリキッドF ナチュラル(03)', price: 4000, category: 'other' },
      { code: '441569', name: 'リベストリキッドF オークルライト(04)', price: 4000, category: 'other' },
      { code: '441577', name: 'リベストリキッドF ナチュラダーク(05)', price: 4000, category: 'other' },
      { code: '441585', name: 'リベストリキッドF ヴェールピンクライト(11)', price: 6000, category: 'other' },
      { code: '441593', name: 'リベストリキッドF ヴェールナチュラル(12)', price: 6000, category: 'other' },
      { code: '441600', name: 'リベストリキッドF ヴェールオークルライト(13)', price: 6000, category: 'other' },
      { code: '448490', name: 'リベストリキッドF ヴェールナチュラダーク(14)', price: 6000, category: 'other' },
      { code: '441618', name: 'リベストシルキーパウダーF ピンク(21)', price: 5600, category: 'other' },
      { code: '441626', name: 'リベストシルキーパウダーF ナチュラルライト(22)', price: 5600, category: 'other' },
    ]
  },

  hairBodyCare: {
    name: 'ヘアケア&ボディケア',
    taxRate: 10,
    products: [
      { code: '429151', name: 'アルソア シャンプー', price: 2500, category: 'other' },
      { code: '437250', name: 'アルソア シャンプー リフィル', price: 2000, category: 'other' },
      { code: '429177', name: 'アルソア コンディショナー', price: 2500, category: 'other' },
      { code: '437260', name: 'アルソア コンディショナー リフィル', price: 2000, category: 'other' },
      { code: '429193', name: 'アルソア EXシャンプー', price: 2600, category: 'other' },
      { code: '437270', name: 'アルソア EXシャンプー リフィル', price: 2200, category: 'other' },
      { code: '429218', name: 'アルソア EXトリートメント', price: 2800, category: 'other' },
      { code: '429226', name: 'アルソア ヘアミスト', price: 1800, category: 'other' },
      { code: '429234', name: 'アルソア トリートメントオイル', price: 2800, category: 'other' },
      { code: '429242', name: 'アルソア スカルプローション', price: 2700, category: 'other' },
      { code: '429250', name: 'アルソア スカルプエッセンス', price: 4500, category: 'other' },
      { code: '378952', name: 'プリシーノバスパウダー', price: 3000, category: 'other' },
      { code: '381997', name: 'プリシーノボディソープ', price: 2500, category: 'other' },
      { code: '382002', name: 'プリシーノボディソープ リフィル', price: 1700, category: 'other' },
      { code: '421339', name: 'プリシーノボディミスト', price: 2000, category: 'other' },
      { code: '22814', name: 'アピブラシ', price: 3000, category: 'other' },
      { code: '445933', name: 'しらきぬの湯s', price: 3000, category: 'other' },
    ]
  },

  healthcare: {
    name: 'ヘルスケア',
    taxRate: 8,  // 軽減税率適用
    products: [
      { code: '447731', name: 'アルソア 酵素', price: 10000, category: '酵素' },
      { code: '447757', name: 'アルソア 酵素プラス レギュラー', price: 5500, category: '酵素' },
      { code: '447765', name: 'アルソア 酵素プラス ラージ', price: 15000, category: '酵素' },
      { code: '447781', name: 'アルソア 酵素G', price: 20000, category: '酵素' },
      { code: '447806', name: 'アルソア 白鶴霊芝エクストラ 10本入', price: 12000, category: 'other' },
      { code: '447814', name: 'アルソア 白鶴霊芝エクストラ 30本入', price: 32000, category: 'other' },
      { code: '447856', name: 'アルソア 霊芝 レギュラー', price: 12000, category: 'other' },
      { code: '447864', name: 'アルソア 霊芝 ラージ', price: 30000, category: 'other' },
      { code: '448028', name: 'アルソア オメガ3', price: 9000, category: 'other' },
      { code: '447963', name: 'アルソア シナヤカ レギュラー', price: 9000, category: 'other' },
      { code: '447971', name: 'アルソア シナヤカ ラージ', price: 24000, category: 'other' },
      { code: '447898', name: 'アルソア ビエッセS', price: 10000, category: 'other' },
      { code: '447913', name: 'アルソア ビエッセEX', price: 20000, category: 'other' },
      { code: '448010', name: 'アルソア Fe', price: 4000, category: 'other' },
      { code: '448044', name: 'アルソア クリアー', price: 3800, category: 'other' },
      { code: '447830', name: 'アルソア 白鶴霊芝AG', price: 12000, category: 'other' },
      { code: '447997', name: 'アルソア ミネラルプラス', price: 5800, category: 'other' },
      { code: '447947', name: 'アルソア セルエナジィV', price: 10000, category: 'other' },
      { code: '447939', name: 'アルソア リナカンC', price: 5000, category: 'other' },
      { code: '447880', name: 'アルソア ピュアカルCa', price: 6500, category: 'other' },
      { code: '448052', name: 'アルソア 白鶴霊芝ティー', price: 3800, category: 'other' },
    ]
  },

  pointMakeup: {
    name: 'ポイントメイクアップ',
    taxRate: 10,
    products: [
      // リベストシェードオンリフィル ¥1,400
      { code: '441816', name: 'リベストシェードオンリフィル マザーシェル(C201)', price: 1400, category: '色' },
      { code: '441824', name: 'リベストシェードオンリフィル シルバームーン(C202)', price: 1400, category: '色' },
      { code: '441832', name: 'リベストシェードオンリフィル カームブラック(C203)', price: 1400, category: '色' },
      { code: '441840', name: 'リベストシェードオンリフィル ダイヤモンドダスト(N204)', price: 1400, category: '色' },
      { code: '441858', name: 'リベストシェードオンリフィル トワイライトベージュ(N205)', price: 1400, category: '色' },
      { code: '441866', name: 'リベストシェードオンリフィル ジャスパーレッド(N206)', price: 1400, category: '色' },
      { code: '441874', name: 'リベストシェードオンリフィル サンライト(W207)', price: 1400, category: '色' },
      { code: '441882', name: 'リベストシェードオンリフィル オレンジミスト(W208)', price: 1400, category: '色' },
      { code: '441890', name: 'リベストシェードオンリフィル ピノブラウン(W209)', price: 1400, category: '色' },
      { code: '441907', name: 'リベストシェードオンリフィル オーロラブルー(C210)', price: 1400, category: '色' },
      { code: '441915', name: 'リベストシェードオンリフィル オーシャンレイ(C211)', price: 1400, category: '色' },
      { code: '441923', name: 'リベストシェードオンリフィル コモレビイエロー(N212)', price: 1400, category: '色' },
      { code: '441931', name: 'リベストシェードオンリフィル ローズクラウド(N213)', price: 1400, category: '色' },
      { code: '441949', name: 'リベストシェードオンリフィル デューンゴールド(W214)', price: 1400, category: '色' },
      { code: '441957', name: 'リベストシェードオンリフィル サバンナグリーン(W215)', price: 1400, category: '色' },
      // リベストブラッシュオンリフィル ¥1,800
      { code: '441965', name: 'リベストブラッシュオンリフィル ハピネスピンク(C401)', price: 1800, category: '色' },
      { code: '441973', name: 'リベストブラッシュオンリフィル ディライトコーラル(N402)', price: 1800, category: '色' },
      { code: '441981', name: 'リベストブラッシュオンリフィル チアフルオレンジ(W403)', price: 1800, category: '色' },
      { code: '441999', name: 'リベストブラッシュオンリフィル グレースローズ(C404)', price: 1800, category: '色' },
      { code: '442004', name: 'リベストブラッシュオンリフィル シフォンホワイト(N405)', price: 1800, category: '色' },
      { code: '442012', name: 'リベストブラッシュオンリフィル セピアベージュ(N406)', price: 1800, category: '色' },
      // リベストリップカラーリフィル ¥1,000
      { code: '442020', name: 'リベストリップカラーリフィル ビーナスピンク(C701)', price: 1000, category: '色' },
      { code: '442038', name: 'リベストリップカラーリフィル パレスピンク(C702)', price: 1000, category: '色' },
      { code: '442046', name: 'リベストリップカラーリフィル セーブルローズ(C703)', price: 1000, category: '色' },
      { code: '442054', name: 'リベストリップカラーリフィル グアバピンク(N704)', price: 1000, category: '色' },
      { code: '442062', name: 'リベストリップカラーリフィル オペラレッド(N705)', price: 1000, category: '色' },
      { code: '442070', name: 'リベストリップカラーリフィル レッドリリー(N706)', price: 1000, category: '色' },
      { code: '442088', name: 'リベストリップカラーリフィル オレンジゼラニウム(W707)', price: 1000, category: '色' },
      { code: '442096', name: 'リベストリップカラーリフィル ピーチヴェール(W708)', price: 1000, category: '色' },
      { code: '442103', name: 'リベストリップカラーリフィル ガナッシュブラウン(W709)', price: 1000, category: '色' },
      { code: '442111', name: 'リベストリップカラーリフィル マジックティント(80)', price: 1000, category: '色' },
      // その他ポイントメイク商品
      { code: '446098', name: 'リベストリップコート', price: 3000, category: 'other' },
      { code: '446080', name: 'リベストリップグロス シャイニークリア', price: 2300, category: 'other' },
      { code: '446006', name: 'リベストアイブロウホルダー', price: 1700, category: 'other' },
      { code: '445983', name: 'リベストアイブロウリフィル ブラウン(55)', price: 1700, category: 'other' },
      { code: '445991', name: 'リベストアイブロウリフィル グレー(56)', price: 1700, category: 'other' },
      { code: '446048', name: 'リベストアイブロウパウダー', price: 3800, category: 'other' },
      { code: '446056', name: 'リベストアイブロウパウダー リフィル', price: 2700, category: 'other' },
      { code: '446030', name: 'リベストアイライナーホルダー', price: 1700, category: 'other' },
      { code: '446014', name: 'リベストアイライナーリフィル ブラウン(50)', price: 1700, category: 'other' },
      { code: '446022', name: 'リベストアイライナーリフィル グレー(51)', price: 1700, category: 'other' },
      { code: '446064', name: 'リベストリキッドアイライナー ブラック', price: 2100, category: 'other' },
      { code: '446072', name: 'リベストナチュラルロングマスカラ ブラック', price: 3300, category: 'other' },
      { code: '420670', name: '眉ブラシ＆コーム', price: 500, category: 'other' },
      { code: '448622', name: 'リップブラシ', price: 1500, category: 'other' },
      { code: '441759', name: 'リベストメイクオフ', price: 3000, category: 'MO' },
    ]
  }
};

/**
 * カテゴリ略称マッピング
 * 書類2（お客様分布リスト）の月別表示用
 */
export const CATEGORY_ABBREV = {
  'QS': 'クイーンシルバー',
  'L': 'ローション',
  'P': 'パック',
  'ES': 'エッセンス',
  'SP': 'SPプレペア',
  'MO': 'メイクオフ',
  '酵素': '酵素',
  '色': '色',
  'other': 'その他'
};

/**
 * 会計年度の月リスト（3月〜翌2月）
 */
export const FISCAL_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

/**
 * 製品目標数（年間）
 */
export const PRODUCT_TARGETS = {
  QS: 120,      // クイーンシルバー目標
  L: 210        // ローション目標
};
