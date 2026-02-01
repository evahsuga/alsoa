/**
 * ユーティリティ関数
 * 化粧品販売管理アプリ - VSCode版
 */

import { PRODUCT_MASTER } from '../data/productMaster';

/**
 * 全製品リストを取得（カスタム製品を含む）
 * @param {Object} customProducts - カスタム製品オブジェクト
 * @returns {Array} 全製品の配列
 */
export const getAllProducts = (customProducts = {}) => {
  const products = [];
  Object.entries(PRODUCT_MASTER).forEach(([key, category]) => {
    // 組み込み製品
    category.products.forEach(product => {
      products.push({
        ...product,
        categoryName: category.name,
        categoryKey: key,
        taxRate: category.taxRate,
        isCustom: false
      });
    });
    // カスタム製品
    if (customProducts[key]) {
      customProducts[key].forEach(product => {
        products.push({
          ...product,
          categoryName: category.name,
          categoryKey: key,
          taxRate: category.taxRate,
          isCustom: true
        });
      });
    }
  });
  return products;
};

/**
 * 製品コードから製品を検索
 * @param {string} code - 製品コード
 * @param {Object} customProducts - カスタム製品オブジェクト
 * @returns {Object|undefined} 見つかった製品
 */
export const findProductByCode = (code, customProducts = {}) => {
  return getAllProducts(customProducts).find(p => p.code === code);
};

/**
 * 会計年度を取得（3月〜翌2月）
 * @param {Date} date - 日付
 * @returns {number} 会計年度
 */
export const getFiscalYear = (date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 3 ? year : year - 1;
};

/**
 * 指定した会計年度の開始日を取得
 * @param {number} fiscalYear - 会計年度
 * @returns {Date} 開始日（3月1日）
 */
export const getFiscalYearStart = (fiscalYear) => {
  return new Date(fiscalYear, 2, 1); // 3月1日
};

/**
 * 指定した会計年度の終了日を取得
 * @param {number} fiscalYear - 会計年度
 * @returns {Date} 終了日（翌年2月末日）
 */
export const getFiscalYearEnd = (fiscalYear) => {
  return new Date(fiscalYear + 1, 2, 0); // 翌年2月末日
};

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 * @param {Date|string} date - 日付
 * @returns {string} フォーマットされた日付
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * 日付をM/D形式にフォーマット
 * @param {Date|string} date - 日付
 * @returns {string} フォーマットされた日付
 */
export const formatShortDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/**
 * 金額をカンマ区切りにフォーマット
 * @param {number} amount - 金額
 * @returns {string} フォーマットされた金額
 */
export const formatCurrency = (amount) => {
  return `¥${amount.toLocaleString()}`;
};
