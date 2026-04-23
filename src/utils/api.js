/**
 * APIクライアント
 * 化粧品販売管理アプリ - サーバー版
 *
 * LocalStorageからサーバーAPIへの移行用
 */

// APIのベースURL
// 本番環境: エックスサーバー
const API_BASE = 'https://evahpro.xsrv.jp/arsoa/api';

/**
 * APIクライアントクラス
 */
class ApiClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * 汎用リクエストメソッド
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include', // セッションCookieを送信
      ...options
    };

    try {
      const response = await fetch(url, config);

      // 認証エラー
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('認証が必要です。ログインしてください。');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'APIエラーが発生しました');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========================================
  // 認証API
  // ========================================

  /**
   * ログイン
   */
  async login(password) {
    return this.request('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  /**
   * ログアウト
   */
  async logout() {
    return this.request('/auth.php?action=logout', {
      method: 'POST'
    });
  }

  /**
   * 認証状態確認
   */
  async checkAuth() {
    return this.request('/auth.php?action=check');
  }

  /**
   * パスワード変更
   */
  async changePassword(currentPassword, newPassword) {
    return this.request('/auth.php?action=change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  /**
   * 初期パスワード設定
   */
  async initPassword(password) {
    return this.request('/auth.php?action=init-password', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  // ========================================
  // 顧客API
  // ========================================

  /**
   * 顧客一覧取得
   */
  async getCustomers() {
    return this.request('/customers.php');
  }

  /**
   * 顧客追加
   */
  async addCustomer(customer) {
    return this.request('/customers.php', {
      method: 'POST',
      body: JSON.stringify(customer)
    });
  }

  /**
   * 顧客更新
   */
  async updateCustomer(id, updates) {
    return this.request(`/customers.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * 顧客削除
   */
  async deleteCustomer(id) {
    return this.request(`/customers.php?id=${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // 売上API
  // ========================================

  /**
   * 売上一覧取得
   * @param {Object} options - フィルターオプション
   * @param {string} options.month - 月（YYYY-MM形式）
   * @param {number} options.fiscalYear - 会計年度
   */
  async getSales(options = {}) {
    let endpoint = '/sales.php';
    const params = new URLSearchParams();

    if (options.month) {
      params.append('month', options.month);
    }
    if (options.fiscalYear) {
      params.append('fiscalYear', options.fiscalYear);
    }

    const queryString = params.toString();
    if (queryString) {
      endpoint += '?' + queryString;
    }

    return this.request(endpoint);
  }

  /**
   * 売上追加
   */
  async addSale(sale) {
    return this.request('/sales.php', {
      method: 'POST',
      body: JSON.stringify(sale)
    });
  }

  /**
   * 売上更新
   */
  async updateSale(id, sale) {
    return this.request(`/sales.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(sale)
    });
  }

  /**
   * 売上削除
   */
  async deleteSale(id) {
    return this.request(`/sales.php?id=${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // 月次レポートAPI
  // ========================================

  /**
   * 月次レポート一覧取得
   */
  async getReports() {
    return this.request('/reports.php');
  }

  /**
   * 特定月のレポート取得
   */
  async getReport(year, month) {
    return this.request(`/reports.php?year=${year}&month=${month}`);
  }

  /**
   * 月次レポート保存
   */
  async saveReport(report) {
    return this.request('/reports.php', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  }

  // ========================================
  // カスタム製品API
  // ========================================

  /**
   * カスタム製品一覧取得
   */
  async getCustomProducts() {
    return this.request('/products.php');
  }

  /**
   * カスタム製品追加
   */
  async addCustomProduct(categoryKey, product) {
    return this.request('/products.php', {
      method: 'POST',
      body: JSON.stringify({ categoryKey, ...product })
    });
  }

  /**
   * カスタム製品削除
   */
  async deleteCustomProduct(id) {
    return this.request(`/products.php?id=${id}`, {
      method: 'DELETE'
    });
  }

  // ========================================
  // 設定API
  // ========================================

  /**
   * 設定取得
   */
  async getSettings() {
    return this.request('/settings.php');
  }

  /**
   * 設定更新
   */
  async updateSettings(settings) {
    return this.request('/settings.php', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // ========================================
  // バックアップAPI
  // ========================================

  /**
   * バックアップエクスポート
   */
  async exportBackup() {
    return this.request('/backup.php?action=export');
  }

  /**
   * バックアップインポート
   */
  async importBackup(data) {
    return this.request('/backup.php?action=import', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * データ移行（JSONからDB）
   */
  async migrateFromJson(jsonData, overwrite = false) {
    const endpoint = overwrite
      ? '/migrate.php?overwrite=true'
      : '/migrate.php';

    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(jsonData)
    });
  }

  // ========================================
  // 全データ一括取得（初期読み込み用）
  // ========================================

  /**
   * 全データを一括取得
   */
  async loadAllData() {
    const [customers, sales, monthlyReports, customProducts, settings] = await Promise.all([
      this.getCustomers(),
      this.getSales(),
      this.getReports(),
      this.getCustomProducts(),
      this.getSettings()
    ]);

    return {
      customers,
      sales,
      monthlyReports,
      customProducts,
      displayCutoff: settings.displayCutoff
    };
  }
}

// シングルトンインスタンス
export const api = new ApiClient();
export default api;
