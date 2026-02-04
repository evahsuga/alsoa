/**
 * 伝票パーサー（改善版）
 * 化粧品販売管理アプリ - VSCode版
 *
 * OCRテキストから伝票データを抽出
 * - キーワード辞書による手書き略称対応
 * - 価格による照合でマッチング精度向上
 */

import { getAllProducts } from '../utils/productUtils';

/**
 * 手書き略称 → 商品マッチング用キーワード辞書
 * OCRで読み取った文字列から商品を特定するためのキーワード
 */
const PRODUCT_KEYWORDS = {
  // スキンケア - QS（クイーンシルバー）
  'クイーンシルバー': { keywords: ['クイーン', 'シルバー', 'QS', 'qs'], category: 'QS' },
  'クイーンシルバー135': { keywords: ['クイーン', 'シルバー', '135', '4000', '4,000'], price: 4000, category: 'QS' },
  'クイーンシルバー70': { keywords: ['クイーン', 'シルバー', '70', '2200', '2,200'], price: 2200, category: 'QS' },

  // スキンケア - ローション
  'ローションI': { keywords: ['ローション', 'ローションI', 'ローション1', 'ローションⅠ'], price: 3500, category: 'L' },
  'ローションII': { keywords: ['ローション', 'ローションII', 'ローション2', 'ローションⅡ', 'ローション Ⅱ'], price: 3500, category: 'L' },
  'セルローション': { keywords: ['セルローション', 'セル', 'ローション', '4800', '4,800'], price: 4800, category: 'L' },

  // スキンケア - パック
  'クレイパック': { keywords: ['クレイ', 'パック', 'クレイパック'], price: 3500, category: 'P' },

  // スキンケア - エッセンス
  'エッセンスI': { keywords: ['エッセンス', 'エッセンスI', 'エッセンス1', '5000', '5,000'], price: 5000, category: 'ES' },
  'エッセンスII': { keywords: ['エッセンス', 'エッセンスII', 'エッセンス2', '8000', '8,000'], price: 8000, category: 'ES' },
  'セルエッセンス': { keywords: ['セルエッセンス', 'セル', 'エッセンス', '13000', '13,000'], price: 13000, category: 'ES' },

  // スキンケア - その他
  'セルジェル': { keywords: ['セルジェル', 'ジェル', '7000', '7,000'], price: 7000, category: 'other' },
  'モイストベイス': { keywords: ['モイストベイス', 'ベイス', '4500', '4,500'], price: 4500, category: 'other' },
  'セルセラム': { keywords: ['セルセラム', 'セラム', '8000', '8,000'], price: 8000, category: 'other' },

  // ベースメイクアップ - プレペア
  'SPプレペア': { keywords: ['SP', 'SPプレペア', 'プレペア', '4200', '4,200'], price: 4200, category: 'SP' },
  'モイストプレペア': { keywords: ['モイスト', 'プレペア', 'モイストプレペア', '4500', '4,500'], price: 4500, category: 'other' },
  'ナチュラルプレペア': { keywords: ['ナチュラル', 'プレペア', '4000', '4,000'], price: 4000, category: 'other' },

  // ベースメイクアップ - リキッドファンデーション
  'リキッドF標準': { keywords: ['リキッド', 'ファンデ', 'ファンデーション', '4000', '4,000'], price: 4000, category: 'other' },
  'リキッドFヴェール': { keywords: ['リキッド', 'ファンデ', 'ヴェール', '6000', '6,000'], price: 6000, category: 'other' },

  // ベースメイクアップ - パウダー
  'シルキーパウダー': { keywords: ['シルキー', 'パウダー', 'フェイスパウダー', '5600', '5,600'], price: 5600, category: 'other' },

  // ポイントメイクアップ - メイクオフ
  'メイクオフ': { keywords: ['メイクオフ', 'MO', '3000', '3,000'], price: 3000, category: 'MO' },

  // ヘルスケア - 酵素
  '酵素': { keywords: ['酵素', '10000', '10,000'], price: 10000, category: '酵素' },
  '酵素プラスR': { keywords: ['酵素', 'プラス', 'レギュラー', '5500', '5,500'], price: 5500, category: '酵素' },
  '酵素プラスL': { keywords: ['酵素', 'プラス', 'ラージ', '15000', '15,000'], price: 15000, category: '酵素' },
  '酵素G': { keywords: ['酵素', 'G', '20000', '20,000'], price: 20000, category: '酵素' },
};

/**
 * 価格から商品を逆引きするマップ
 */
const PRICE_TO_PRODUCTS = {
  2200: [
    { code: '421636', name: 'アルソアクイーンシルバー(70g)', category: 'QS' },
    { code: '421644', name: 'アルソアクイーンシルバーPF(70g)', category: 'QS' },
  ],
  3000: [
    { code: '441759', name: 'リベストメイクオフ', category: 'MO' },
  ],
  3500: [
    { code: '421652', name: 'アルソア クレイパック', category: 'P' },
    { code: '421660', name: 'アルソア ローションI', category: 'L' },
    { code: '421678', name: 'アルソア ローションII', category: 'L' },
  ],
  4000: [
    { code: '421628', name: 'アルソアクイーンシルバー(135g)', category: 'QS' },
    { code: '441501', name: 'リベストナチュラルプレペア', category: 'other' },
  ],
  4200: [
    { code: '441519', name: 'リベストSPプレペア', category: 'SP' },
  ],
  4500: [
    { code: '421727', name: 'アルソア モイストベイス', category: 'other' },
    { code: '441527', name: 'リベストモイストプレペア', category: 'other' },
  ],
  4800: [
    { code: '421686', name: 'アルソア セルローション', category: 'L' },
  ],
  5000: [
    { code: '430265', name: 'アルソア エッセンスI', category: 'ES' },
  ],
  5600: [
    { code: '441618', name: 'リベストシルキーパウダーF ピンク(21)', category: 'other' },
    { code: '441626', name: 'リベストシルキーパウダーF ナチュラルライト(22)', category: 'other' },
  ],
  6000: [
    { code: '441585', name: 'リベストリキッドF ヴェールピンクライト(11)', category: 'other' },
    { code: '441593', name: 'リベストリキッドF ヴェールナチュラル(12)', category: 'other' },
    { code: '441600', name: 'リベストリキッドF ヴェールオークルライト(13)', category: 'other' },
  ],
  7000: [
    { code: '421751', name: 'アルソア セルジェル', category: 'other' },
  ],
  8000: [
    { code: '421701', name: 'アルソア エッセンスII', category: 'ES' },
    { code: '430281', name: 'アルソア セルセラム', category: 'other' },
  ],
  10000: [
    { code: '447731', name: 'アルソア 酵素', category: '酵素' },
  ],
  13000: [
    { code: '430273', name: 'アルソア セルエッセンス', category: 'ES' },
  ],
};

/**
 * 除外パターン（商品行として処理しない行）
 * これらのキーワードを含む行は商品マッチングから除外される
 */
const EXCLUDE_PATTERNS = [
  // 税計算・合計欄
  /10\s*%\s*対象/,
  /8\s*%\s*対象/,
  /税込.*合計/,
  /合計.*金額/,
  /消費税/,
  /受入.*金額/,
  /残金/,

  // 振込・銀行情報
  /振込/,
  /口座/,
  /銀行/,
  /支店/,
  /普通/,
  /当座/,

  // メッセージ・挨拶
  /ありがとう/,
  /よろしく/,
  /お願い/,
  /いつも/,
  /プレゼント/,
  /同封/,

  // 伝票ヘッダー・フッター
  /納品.*書/,
  /控/,
  /ARSOA/i,
  /No\./,
  /住所/,
  /電話/,
  /販売.*業者/,
  /代表.*者/,
  /次回.*訪問/,
  /物品.*受領/,

  // テーブルヘッダー
  /^品\s*名$/,
  /^数量$/,
  /^金額/,
  /^税率/,
];

/**
 * 行が除外対象かどうかを判定
 * @param {string} line
 * @returns {boolean}
 */
const shouldExcludeLine = (line) => {
  // 空行や短すぎる行は除外
  if (!line || line.trim().length < 2) {
    return true;
  }

  // 除外パターンにマッチするか確認
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  // 数字のみの行は除外（口座番号など）
  if (/^\d+$/.test(line.replace(/[\s,]/g, ''))) {
    return true;
  }

  return false;
};

/**
 * OCRテキストから伝票データを抽出
 * @param {OCRResult} ocrResult - OCR処理結果
 * @param {Object} customProducts - カスタム製品データ
 * @returns {ParsedSlip}
 */
export const parseSlipData = (ocrResult, customProducts = {}) => {
  const allProducts = getAllProducts(customProducts);
  const lines = ocrResult.lines;
  const fullText = ocrResult.fullText;

  const result = {
    customerName: '',
    date: '',
    items: [],
    confidence: 0,
    rawText: fullText,
    matchDetails: []
  };

  // 顧客名を抽出（改善版）
  result.customerName = extractCustomerNameImproved(lines, fullText);

  // 日付を抽出（改善版）
  result.date = extractDateImproved(lines, fullText);

  // 商品をマッチング（改善版：キーワード＋価格照合）
  const { items, matchDetails } = matchProductsImproved(lines, allProducts, fullText);
  result.items = items;
  result.matchDetails = matchDetails;

  // 信頼度スコアを計算
  result.confidence = calculateConfidence(result);

  return result;
};

/**
 * 顧客名を抽出（改善版）
 * ARSOAの納品書フォーマットに特化
 * @param {string[]} lines
 * @param {string} fullText
 * @returns {string}
 */
const extractCustomerNameImproved = (lines, fullText) => {
  // パターン1: 「〇〇 〇〇 様」の形式（名前 + 様）
  // 納品書の顧客名は通常、姓名の後に「様」が付く
  const samaPatterns = [
    /([一-龯ぁ-んァ-ン]{1,6})\s*([一-龯ぁ-んァ-ン]{1,6})\s*様/,  // 姓 名 様
    /([一-龯ぁ-んァ-ン]{2,8})\s*様/,  // 名前様（スペースなし）
  ];

  for (const line of lines) {
    for (const pattern of samaPatterns) {
      const match = line.match(pattern);
      if (match) {
        // マッチした部分から「様」を除去して返す
        let name = match[0].replace(/\s*様$/, '').trim();
        // 余計な文字（住所、電話など）が含まれていないか確認
        if (name.length >= 2 && name.length <= 12 && !name.includes('住所') && !name.includes('電話')) {
          return name;
        }
      }
    }
  }

  // パターン2: 全テキストから「様」の前を探す
  const fullTextMatch = fullText.match(/([一-龯ぁ-んァ-ン]{2,4})\s*([一-龯ぁ-んァ-ン]{2,4})\s*様/);
  if (fullTextMatch) {
    return (fullTextMatch[1] + ' ' + fullTextMatch[2]).trim();
  }

  // パターン3: 単純な「様」パターン
  const simpleMatch = fullText.match(/([一-龯ぁ-んァ-ン]{2,8})様/);
  if (simpleMatch) {
    return simpleMatch[1].trim();
  }

  return '';
};

/**
 * 日付を抽出（改善版）
 * 令和表記（R7, R8など）に対応
 * @param {string[]} lines
 * @param {string} fullText
 * @returns {string} YYYY-MM-DD形式
 */
const extractDateImproved = (lines, fullText) => {
  const currentYear = new Date().getFullYear();
  const textToSearch = fullText + ' ' + lines.join(' ');

  // 日付パターン（優先順位順）
  const datePatterns = [
    // R7年7月31日 形式（令和略記）
    {
      pattern: /[RＲ](\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
      parse: (match) => ({
        year: 2018 + parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // 令和7年7月31日 形式
    {
      pattern: /令和\s*(\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
      parse: (match) => ({
        year: 2018 + parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // R7/7/31 または R7.7.31 形式
    {
      pattern: /[RＲ](\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/,
      parse: (match) => ({
        year: 2018 + parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // 2025/7/31 または 2025-07-31 形式
    {
      pattern: /(20\d{2})[\/\-年](\d{1,2})[\/\-月](\d{1,2})日?/,
      parse: (match) => ({
        year: parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // 7月31日 形式（年なし、今年と仮定）
    {
      pattern: /(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
      parse: (match) => ({
        year: currentYear,
        month: parseInt(match[1]),
        day: parseInt(match[2])
      })
    },
  ];

  for (const { pattern, parse } of datePatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      const { year, month, day } = parse(match);
      // 妥当性チェック
      if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const mm = month.toString().padStart(2, '0');
        const dd = day.toString().padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      }
    }
  }

  // デフォルトは今日の日付
  return new Date().toISOString().split('T')[0];
};

/**
 * 商品をマッチング（改善版）
 * キーワード + 価格による照合
 * @param {string[]} lines
 * @param {Array} allProducts
 * @param {string} fullText
 * @returns {{ items: Array, matchDetails: Array }}
 */
const matchProductsImproved = (lines, allProducts, fullText) => {
  const matchedItems = [];
  const matchDetails = [];
  const usedProducts = new Set();

  // 各行を処理
  for (const line of lines) {
    // 除外パターンに該当する行はスキップ
    if (shouldExcludeLine(line)) {
      continue;
    }

    // 価格を抽出（カンマ区切りにも対応）
    const priceMatch = line.match(/[¥￥]?\s*([0-9,]+)/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;

    // 数量を抽出
    const quantity = extractQuantity(line);

    // まずキーワードマッチングを試行
    let bestMatch = findByKeywordAndPrice(line, price, allProducts);

    // キーワードでマッチしなければ従来の方法
    if (!bestMatch) {
      bestMatch = findBestProductMatch(line, allProducts);
    }

    if (bestMatch && bestMatch.score >= 0.4 && !usedProducts.has(bestMatch.product.code)) {
      usedProducts.add(bestMatch.product.code);

      matchedItems.push({
        code: bestMatch.product.code,
        name: bestMatch.product.name,
        price: bestMatch.product.price,
        category: bestMatch.product.category,
        quantity: quantity,
        matchScore: bestMatch.score
      });

      matchDetails.push({
        originalText: line,
        matchedProduct: bestMatch.product.name,
        score: bestMatch.score,
        quantity: quantity,
        matchMethod: bestMatch.method || 'similarity'
      });
    }
  }

  return { items: matchedItems, matchDetails };
};

/**
 * キーワードと価格で商品を検索
 * @param {string} text
 * @param {number|null} price
 * @param {Array} allProducts
 * @returns {{ product: Object, score: number, method: string } | null}
 */
const findByKeywordAndPrice = (text, price, allProducts) => {
  const normalizedText = text.replace(/\s/g, '').toLowerCase();
  let candidates = [];

  // キーワード辞書でマッチング
  for (const [productKey, config] of Object.entries(PRODUCT_KEYWORDS)) {
    const keywordMatch = config.keywords.some(keyword =>
      normalizedText.includes(keyword.toLowerCase().replace(/\s/g, ''))
    );

    if (keywordMatch) {
      // 価格が一致すればスコアを上げる
      const priceMatch = price && config.price && (price === config.price || Math.abs(price - config.price) < 100);
      const score = priceMatch ? 0.95 : 0.7;

      candidates.push({
        key: productKey,
        config,
        score,
        priceMatch
      });
    }
  }

  // 価格のみでのマッチング（キーワードがなくても価格が一致する場合）
  if (price && PRICE_TO_PRODUCTS[price]) {
    for (const productInfo of PRICE_TO_PRODUCTS[price]) {
      // キーワードでも部分的にマッチするか確認
      const partialMatch = normalizedText.includes(productInfo.name.slice(0, 4).toLowerCase().replace(/\s/g, ''));
      if (partialMatch || candidates.length === 0) {
        candidates.push({
          key: productInfo.name,
          config: { price },
          score: partialMatch ? 0.85 : 0.6,
          priceMatch: true,
          directProduct: productInfo
        });
      }
    }
  }

  // 最も高いスコアの候補を選択
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    // 直接商品情報がある場合
    if (best.directProduct) {
      const product = allProducts.find(p => p.code === best.directProduct.code);
      if (product) {
        return { product, score: best.score, method: 'price+keyword' };
      }
    }

    // キーワードマッチの場合、対応する商品を探す
    const matchingProduct = findProductByKeywordConfig(best.config, allProducts, price);
    if (matchingProduct) {
      return { product: matchingProduct, score: best.score, method: 'keyword' };
    }
  }

  return null;
};

/**
 * キーワード設定から商品を検索
 * @param {Object} config
 * @param {Array} allProducts
 * @param {number|null} price
 * @returns {Object|null}
 */
const findProductByKeywordConfig = (config, allProducts, price) => {
  // 価格が設定されている場合は価格で絞り込み
  if (config.price) {
    const byPrice = allProducts.filter(p => p.price === config.price);
    if (byPrice.length === 1) {
      return byPrice[0];
    }
    // カテゴリでさらに絞り込み
    if (config.category && byPrice.length > 1) {
      const byCategory = byPrice.filter(p => p.category === config.category);
      if (byCategory.length > 0) {
        return byCategory[0];
      }
    }
    if (byPrice.length > 0) {
      return byPrice[0];
    }
  }

  // 価格での絞り込みができない場合はカテゴリで
  if (config.category) {
    const byCategory = allProducts.filter(p => p.category === config.category);
    if (byCategory.length > 0) {
      // 引数の価格が近いものを優先
      if (price) {
        byCategory.sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price));
      }
      return byCategory[0];
    }
  }

  return null;
};

/**
 * テキストから数量を抽出
 * @param {string} text
 * @returns {number}
 */
const extractQuantity = (text) => {
  // 数量パターン
  const quantityPatterns = [
    /[×xX]\s*(\d+)/,           // ×2, x2, X2
    /(\d+)\s*[個本点セット]/,   // 2個, 2本, 2点, 2セット
    /数量[：:]\s*(\d+)/,       // 数量: 2
    /^\s*[/／|｜]\s*(\d+)\s*[/／|｜]/, // テーブル形式 | 1 |
  ];

  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const qty = parseInt(match[1]);
      if (qty >= 1 && qty <= 99) {
        return qty;
      }
    }
  }

  // テーブル形式で数量が1の場合（単独の1または/1/）
  if (/[/／|｜]\s*1\s*[/／|｜]/.test(text) || /^\s*1\s*[/／|｜]/.test(text)) {
    return 1;
  }

  return 1; // デフォルト数量
};

/**
 * 最もマッチする商品を検索（従来方式・フォールバック用）
 * @param {string} text
 * @param {Array} products
 * @returns {{ product: Object, score: number } | null}
 */
const findBestProductMatch = (text, products) => {
  let bestMatch = null;
  let bestScore = 0;

  const normalizedText = normalizeProductName(text);

  // テキストが短すぎる場合はスキップ
  if (normalizedText.length < 2) {
    return null;
  }

  for (const product of products) {
    const normalizedProductName = normalizeProductName(product.name);

    // 商品コード完全一致
    if (text.includes(product.code)) {
      return { product, score: 1.0 };
    }

    // 商品名完全包含
    if (normalizedText.includes(normalizedProductName)) {
      const score = 0.95;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { product, score };
      }
      continue;
    }

    // 商品名が部分的にテキストに含まれている
    if (normalizedProductName.length >= 4 && normalizedText.includes(normalizedProductName.slice(0, 4))) {
      const score = 0.7;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { product, score };
      }
      continue;
    }

    // 類似度計算
    const score = calculateStringSimilarity(normalizedText, normalizedProductName);
    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = { product, score };
    }
  }

  return bestMatch;
};

/**
 * 商品名を正規化（マッチング用）
 * @param {string} name
 * @returns {string}
 */
const normalizeProductName = (name) => {
  return name
    .replace(/[（(][^）)]*[）)]/g, '')  // カッコ内を除去
    .replace(/[\s　]/g, '')             // 空白を除去
    .replace(/アルソア/g, '')           // ブランド名を除去
    .replace(/リベスト/g, '')           // ブランド名を除去
    .replace(/ARSOA/gi, '')
    .toLowerCase();
};

/**
 * 文字列の類似度を計算（簡易版）
 * @param {string} str1
 * @param {string} str2
 * @returns {number} 0-1の類似度スコア
 */
const calculateStringSimilarity = (str1, str2) => {
  if (str1.length === 0 || str2.length === 0) {
    return 0;
  }

  // 共通文字数をカウント
  const set1 = new Set(str1);
  const set2 = new Set(str2);
  let common = 0;
  for (const char of set1) {
    if (set2.has(char)) {
      common++;
    }
  }

  // Jaccard類似度
  const union = new Set([...set1, ...set2]).size;
  const jaccard = common / union;

  // 長さの類似度
  const lengthSimilarity = Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);

  // 重み付き平均
  return jaccard * 0.7 + lengthSimilarity * 0.3;
};

/**
 * 信頼度スコアを計算
 * @param {ParsedSlip} result
 * @returns {number} 0-1のスコア
 */
const calculateConfidence = (result) => {
  let score = 0;
  let factors = 0;

  // 顧客名が抽出できた
  if (result.customerName && result.customerName.length >= 2) {
    score += 0.3;
  }
  factors += 0.3;

  // 日付が今日でない（＝抽出できた可能性が高い）
  const today = new Date().toISOString().split('T')[0];
  if (result.date && result.date !== today) {
    score += 0.2;
  }
  factors += 0.2;

  // 商品がマッチした
  if (result.items.length > 0) {
    // 平均マッチスコア
    const avgMatchScore = result.items.reduce((sum, item) => sum + (item.matchScore || 0), 0) / result.items.length;
    score += avgMatchScore * 0.5;
  }
  factors += 0.5;

  return factors > 0 ? score / factors : 0;
};

/**
 * @typedef {Object} ParsedSlip
 * @property {string} customerName - 抽出された顧客名
 * @property {string} date - 抽出された日付 (YYYY-MM-DD)
 * @property {Array} items - マッチした商品リスト
 * @property {number} confidence - 信頼度スコア (0-1)
 * @property {string} rawText - 元のOCRテキスト
 * @property {Array} matchDetails - マッチング詳細
 */
