/**
 * LocalStorage操作ユーティリティ
 * 化粧品販売管理アプリ - VSCode版
 */

// LocalStorageキー定義
export const STORAGE_KEYS = {
  CUSTOMERS: 'cosmetics_customers',
  SALES: 'cosmetics_sales',
  MONTHLY_REPORTS: 'cosmetics_monthly_reports',
  CUSTOM_PRODUCTS: 'cosmetics_custom_products',
  DISPLAY_CUTOFF: 'cosmetics_display_cutoff'
};

// デフォルト値
export const DEFAULT_VALUES = {
  customers: [],
  sales: [],
  monthlyReports: [],
  customProducts: {
    skincare: [],
    baseMakeup: [],
    hairBodyCare: [],
    healthcare: [],
    pointMakeup: []
  },
  displayCutoff: null
};

/**
 * LocalStorageからデータを読み込む
 * @returns {Object} 全データオブジェクト
 */
export const loadAllData = () => {
  try {
    const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || DEFAULT_VALUES.customers;
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)) || DEFAULT_VALUES.sales;
    const monthlyReports = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONTHLY_REPORTS)) || DEFAULT_VALUES.monthlyReports;
    const customProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS)) || DEFAULT_VALUES.customProducts;
    const displayCutoff = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISPLAY_CUTOFF)) || DEFAULT_VALUES.displayCutoff;

    return { customers, sales, monthlyReports, customProducts, displayCutoff };
  } catch (e) {
    console.error('データ読み込みエラー:', e);
    return DEFAULT_VALUES;
  }
};

/**
 * LocalStorageに全データを保存
 * @param {Object} data - 保存するデータ
 */
export const saveAllData = (data) => {
  try {
    const {
      customers = DEFAULT_VALUES.customers,
      sales = DEFAULT_VALUES.sales,
      monthlyReports = DEFAULT_VALUES.monthlyReports,
      customProducts = DEFAULT_VALUES.customProducts,
      displayCutoff = DEFAULT_VALUES.displayCutoff
    } = data;

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    localStorage.setItem(STORAGE_KEYS.MONTHLY_REPORTS, JSON.stringify(monthlyReports));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(customProducts));
    localStorage.setItem(STORAGE_KEYS.DISPLAY_CUTOFF, JSON.stringify(displayCutoff));
  } catch (e) {
    console.error('データ保存エラー:', e);
    throw new Error('データの保存に失敗しました');
  }
};

/**
 * 顧客データを保存
 * @param {Array} customers - 顧客配列
 */
export const saveCustomers = (customers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('顧客データ保存エラー:', e);
  }
};

/**
 * 売上データを保存
 * @param {Array} sales - 売上配列
 */
export const saveSales = (sales) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('売上データ保存エラー:', e);
  }
};

/**
 * バックアップデータをエクスポート
 * @param {Object} data - エクスポートするデータ
 * @returns {string} JSONファイル名
 */
export const exportBackup = (data) => {
  const backupData = {
    exportDate: new Date().toISOString(),
    version: '1.4',
    ...data
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `cosmetics_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);

  return fileName;
};

/**
 * バックアップデータをインポート
 * @param {File} file - JSONファイル
 * @returns {Promise<Object>} インポートされたデータ
 */
export const importBackup = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // バリデーション
        if (!data || typeof data !== 'object') {
          throw new Error('無効なファイル形式です');
        }

        const importedData = {
          customers: data.customers || DEFAULT_VALUES.customers,
          sales: data.sales || DEFAULT_VALUES.sales,
          monthlyReports: data.monthlyReports || DEFAULT_VALUES.monthlyReports,
          customProducts: data.customProducts || DEFAULT_VALUES.customProducts,
          displayCutoff: data.displayCutoff || DEFAULT_VALUES.displayCutoff
        };

        resolve(importedData);
      } catch (err) {
        reject(new Error('ファイルの読み込みに失敗しました'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
};

/**
 * LocalStorageの使用量を取得
 * @returns {Object} 使用量情報
 */
export const getStorageUsage = () => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2; // UTF-16なので2倍
    }
  }
  return {
    used: total,
    usedMB: (total / (1024 * 1024)).toFixed(2),
    maxMB: 5, // 一般的なLocalStorage制限
    percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(1)
  };
};
