/**
 * 伝票パーサー
 * 化粧品販売管理アプリ - VSCode版
 *
 * OCRテキストから伝票データを抽出
 */

import { getAllProducts } from '../utils/productUtils';

/**
 * OCRテキストから伝票データを抽出
 * @param {OCRResult} ocrResult - OCR処理結果
 * @param {Object} customProducts - カスタム製品データ
 * @returns {ParsedSlip}
 */
export const parseSlipData = (ocrResult, customProducts = {}) => {
  const allProducts = getAllProducts(customProducts);
  const lines = ocrResult.lines;

  const result = {
    customerName: '',
    date: '',
    items: [],
    confidence: 0,
    rawText: ocrResult.fullText,
    matchDetails: []
  };

  // 顧客名を抽出
  result.customerName = extractCustomerName(lines);

  // 日付を抽出
  result.date = extractDate(lines);

  // 商品をマッチング
  const { items, matchDetails } = matchProducts(lines, allProducts);
  result.items = items;
  result.matchDetails = matchDetails;

  // 信頼度スコアを計算
  result.confidence = calculateConfidence(result);

  return result;
};

/**
 * 顧客名を抽出
 * @param {string[]} lines
 * @returns {string}
 */
const extractCustomerName = (lines) => {
  // 「様」で終わるパターン
  const samaPattern = /^(.{1,10})様$/;

  // 「顧客:」「お客様:」などのラベル付きパターン
  const labelPatterns = [
    /顧客[：:]\s*(.+)/,
    /お客様[：:]\s*(.+)/,
    /お名前[：:]\s*(.+)/,
    /氏名[：:]\s*(.+)/
  ];

  for (const line of lines) {
    const trimmed = line.trim();

    // 「様」パターンをチェック
    const samaMatch = trimmed.match(samaPattern);
    if (samaMatch) {
      return samaMatch[1].trim();
    }

    // ラベル付きパターンをチェック
    for (const pattern of labelPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        let name = match[1].trim();
        // 「様」が付いている場合は除去
        name = name.replace(/様$/, '').trim();
        return name;
      }
    }
  }

  return '';
};

/**
 * 日付を抽出
 * @param {string[]} lines
 * @returns {string} YYYY-MM-DD形式
 */
const extractDate = (lines) => {
  const currentYear = new Date().getFullYear();

  // 日付パターン（優先順位順）
  const datePatterns = [
    // YYYY/MM/DD または YYYY-MM-DD
    {
      pattern: /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})日?/,
      parse: (match) => ({
        year: parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // 令和X年MM月DD日
    {
      pattern: /令和(\d+)年(\d{1,2})月(\d{1,2})日/,
      parse: (match) => ({
        year: 2018 + parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // R X.MM.DD または R X/MM/DD
    {
      pattern: /[RＲ]\s*(\d)[\.\/](\d{1,2})[\.\/](\d{1,2})/,
      parse: (match) => ({
        year: 2018 + parseInt(match[1]),
        month: parseInt(match[2]),
        day: parseInt(match[3])
      })
    },
    // MM/DD または MM月DD日（今年と仮定）
    {
      pattern: /(\d{1,2})[\/月](\d{1,2})日?/,
      parse: (match) => ({
        year: currentYear,
        month: parseInt(match[1]),
        day: parseInt(match[2])
      })
    }
  ];

  for (const line of lines) {
    for (const { pattern, parse } of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const { year, month, day } = parse(match);
        // 妥当性チェック
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const mm = month.toString().padStart(2, '0');
          const dd = day.toString().padStart(2, '0');
          return `${year}-${mm}-${dd}`;
        }
      }
    }
  }

  // デフォルトは今日の日付
  return new Date().toISOString().split('T')[0];
};

/**
 * テキスト行から商品をマッチング
 * @param {string[]} lines
 * @param {Array} products
 * @returns {{ items: Array, matchDetails: Array }}
 */
const matchProducts = (lines, products) => {
  const matchedItems = [];
  const matchDetails = [];

  for (const line of lines) {
    // 数量を抽出
    const quantity = extractQuantity(line);

    // 商品名マッチング
    const bestMatch = findBestProductMatch(line, products);

    if (bestMatch && bestMatch.score >= 0.5) {
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
        quantity: quantity
      });
    }
  }

  // 重複を除去（同じ商品コードは最初のものを残す）
  const uniqueItems = [];
  const seenCodes = new Set();
  for (const item of matchedItems) {
    if (!seenCodes.has(item.code)) {
      seenCodes.add(item.code);
      uniqueItems.push(item);
    }
  }

  return { items: uniqueItems, matchDetails };
};

/**
 * テキストから数量を抽出
 * @param {string} text
 * @returns {number}
 */
const extractQuantity = (text) => {
  // 数量パターン
  const quantityPatterns = [
    /[×xX](\d+)/,           // ×2, x2, X2
    /(\d+)[個本点セット]/,   // 2個, 2本, 2点, 2セット
    /数量[：:]\s*(\d+)/,     // 数量: 2
    /(\d+)\s*(?:個|本|点)/   // 2 個
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

  return 1; // デフォルト数量
};

/**
 * 最もマッチする商品を検索
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
    if (score > bestScore && score >= 0.5) {
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
  if (result.customerName) {
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
