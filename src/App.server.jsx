/**
 * メインアプリケーションコンポーネント（サーバー版）
 * 化粧品販売管理アプリ - エックスサーバー対応
 *
 * @version 3.1 Server Edition
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// データ・ユーティリティ
import { PRODUCT_MASTER } from './data/productMaster';
import { getAllProducts, getFiscalYear } from './utils/productUtils';
import { DEFAULT_VALUES } from './utils/storage';
import api from './utils/api';

// スタイル
import { styles, COLORS } from './styles/styles';

// コンポーネント
import Dashboard from './components/Dashboard';
import SalesInput from './components/SalesInput';
import CustomerList from './components/CustomerList';
import ProductCount from './components/ProductCount';
import MonthlyReport from './components/MonthlyReport';
import YearlyReport from './components/YearlyReport';
import IncomeStatement from './components/IncomeStatement';
import Beyond from './components/Beyond';
import MasterManagement from './components/MasterManagement';
import BackupManagement from './components/BackupManagement';
import LoginScreen from './components/LoginScreen';

// カスタムフック
import { useNotification } from './hooks/useNotification';
import { useMediaQuery } from './hooks/useMediaQuery';

/**
 * メインアプリコンポーネント（サーバー版）
 */
function App() {
  // 認証状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ビュー管理
  const [currentView, setCurrentView] = useState('dashboard');

  // モバイル対応
  const { isMobile } = useMediaQuery();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // PC用サイドバー折りたたみ
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // データState
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [customProducts, setCustomProducts] = useState(DEFAULT_VALUES.customProducts);
  const [displayCutoff, setDisplayCutoff] = useState(null);

  // 通知
  const { notification, showNotification } = useNotification(3000);

  // 初回認証チェック
  useEffect(() => {
    checkAuth();

    // 認証切れイベントのリスナー
    const handleAuthLogout = () => {
      setIsAuthenticated(false);
      showNotification('セッションが切れました。再度ログインしてください。', 'error');
    };
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  /**
   * 認証状態確認
   */
  const checkAuth = async () => {
    try {
      const result = await api.checkAuth();
      setIsAuthenticated(result.authenticated);
      if (result.authenticated) {
        await loadData();
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ログイン成功時
   */
  const handleLogin = async () => {
    setIsAuthenticated(true);
    await loadData();
  };

  /**
   * ログアウト
   */
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setCustomers([]);
    setSales([]);
    setMonthlyReports([]);
    setCustomProducts(DEFAULT_VALUES.customProducts);
    setDisplayCutoff(null);
  };

  /**
   * サーバーからデータを読み込む
   */
  const loadData = async () => {
    try {
      const data = await api.loadAllData();
      setCustomers(data.customers);
      setSales(data.sales);
      setMonthlyReports(data.monthlyReports);
      setCustomProducts(data.customProducts);
      setDisplayCutoff(data.displayCutoff);
    } catch (error) {
      showNotification('データの読み込みに失敗しました', 'error');
      console.error('Load data error:', error);
    }
  };

  // ============================================
  // 顧客操作
  // ============================================

  const addCustomer = async (customer) => {
    try {
      const newCustomer = { ...customer, id: Date.now() };
      await api.addCustomer(newCustomer);
      setCustomers([...customers, newCustomer]);
      showNotification('顧客を登録しました');
    } catch (error) {
      showNotification('顧客の登録に失敗しました', 'error');
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      const oldCustomer = customers.find(c => c.id === id);
      await api.updateCustomer(id, { ...updates, oldName: oldCustomer?.name });
      const newCustomers = customers.map(c =>
        c.id === id ? { ...c, ...updates } : c
      );
      setCustomers(newCustomers);
      showNotification('顧客情報を更新しました');
    } catch (error) {
      showNotification('顧客の更新に失敗しました', 'error');
    }
  };

  const deleteCustomer = async (id) => {
    const customer = customers.find(c => c.id === id);
    if (window.confirm(`「${customer?.name}」を削除しますか？\n※この顧客の売上データは残ります`)) {
      try {
        await api.deleteCustomer(id);
        setCustomers(customers.filter(c => c.id !== id));
        showNotification('顧客を削除しました');
      } catch (error) {
        showNotification('顧客の削除に失敗しました', 'error');
      }
    }
  };

  // ============================================
  // カスタム製品操作
  // ============================================

  const addCustomProduct = async (categoryKey, product) => {
    const allProducts = getAllProducts(customProducts);
    if (allProducts.some(p => p.code === product.code)) {
      showNotification('この商品コードは既に使用されています', 'error');
      return false;
    }

    try {
      const newProduct = {
        ...product,
        id: Date.now(),
        isCustom: true
      };
      await api.addCustomProduct(categoryKey, newProduct);
      const newCustomProducts = {
        ...customProducts,
        [categoryKey]: [...(customProducts[categoryKey] || []), newProduct]
      };
      setCustomProducts(newCustomProducts);
      showNotification('製品を追加しました');
      return true;
    } catch (error) {
      showNotification('製品の追加に失敗しました', 'error');
      return false;
    }
  };

  const deleteCustomProduct = async (categoryKey, productId) => {
    const product = customProducts[categoryKey]?.find(p => p.id === productId);
    if (window.confirm(`「${product?.name}」を削除しますか？\n※過去の売上データには影響しません`)) {
      try {
        await api.deleteCustomProduct(productId);
        const newCustomProducts = {
          ...customProducts,
          [categoryKey]: customProducts[categoryKey].filter(p => p.id !== productId)
        };
        setCustomProducts(newCustomProducts);
        showNotification('製品を削除しました');
      } catch (error) {
        showNotification('製品の削除に失敗しました', 'error');
      }
    }
  };

  // ============================================
  // 売上操作
  // ============================================

  const addSale = async (sale) => {
    try {
      const newSale = {
        ...sale,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      await api.addSale(newSale);
      setSales([...sales, newSale]);
      showNotification('売上を登録しました');
    } catch (error) {
      showNotification('売上の登録に失敗しました', 'error');
    }
  };

  const updateSale = async (id, updatedSale) => {
    try {
      await api.updateSale(id, updatedSale);
      const newSales = sales.map(s =>
        s.id === id
          ? { ...s, ...updatedSale, updatedAt: new Date().toISOString() }
          : s
      );
      setSales(newSales);
      showNotification('売上を更新しました');
    } catch (error) {
      showNotification('売上の更新に失敗しました', 'error');
    }
  };

  const deleteSale = async (id) => {
    const sale = sales.find(s => s.id === id);
    if (window.confirm(`${sale?.date} ${sale?.customerName}の売上を削除しますか？\n※この操作は取り消せません`)) {
      try {
        await api.deleteSale(id);
        setSales(sales.filter(s => s.id !== id));
        showNotification('売上を削除しました');
      } catch (error) {
        showNotification('売上の削除に失敗しました', 'error');
      }
    }
  };

  const clearSalesHistory = async () => {
    if (window.confirm('履歴表示をクリアして翌月の入力を開始しますか？\n\n※売上データは削除されません\n※レポート集計には影響しません')) {
      try {
        const newCutoff = new Date().toISOString();
        await api.updateSettings({ displayCutoff: newCutoff });
        setDisplayCutoff(newCutoff);
        showNotification('履歴表示をクリアしました');
      } catch (error) {
        showNotification('設定の更新に失敗しました', 'error');
      }
    }
  };

  // ============================================
  // 月次レポート操作
  // ============================================

  const saveMonthlyReport = async (report) => {
    try {
      await api.saveReport(report);
      const existingIndex = monthlyReports.findIndex(
        r => r.year === report.year && r.month === report.month
      );
      let newReports;
      if (existingIndex >= 0) {
        newReports = [...monthlyReports];
        newReports[existingIndex] = report;
      } else {
        newReports = [...monthlyReports, report];
      }
      setMonthlyReports(newReports);
      showNotification('月次レポートを保存しました');
    } catch (error) {
      showNotification('月次レポートの保存に失敗しました', 'error');
    }
  };

  // ============================================
  // バックアップ操作
  // ============================================

  const exportBackup = async () => {
    try {
      const data = await api.exportBackup();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmetics_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('バックアップをエクスポートしました');
    } catch (error) {
      showNotification('バックアップのエクスポートに失敗しました', 'error');
    }
  };

  const importBackup = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (window.confirm('バックアップを復元しますか？\n現在のデータは上書きされます。')) {
        await api.importBackup(data);
        // 再読み込み
        await loadData();
        showNotification('バックアップを復元しました');
      }
    } catch (error) {
      showNotification('ファイルの読み込みに失敗しました', 'error');
    }
  };

  // ============================================
  // 顧客インポート
  // ============================================

  const importCustomersFile = async (file) => {
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = async (e) => {
      try {
        let rows = [];

        if (isExcel) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          rows = jsonData;
        } else {
          const text = e.target.result;
          rows = text.split('\n').filter(line => line.trim()).map(line =>
            line.split(',').map(s => s.trim())
          );
        }

        const newCustomers = [];
        for (let index = 0; index < rows.length; index++) {
          const row = rows[index];
          if (index === 0) {
            const firstCell = String(row[0] || '').toLowerCase();
            if (firstCell.includes('顧客') || firstCell.includes('名前') ||
                firstCell.includes('ランク') || firstCell === 'name') {
              continue;
            }
          }

          const name = String(row[0] || '').trim();
          const rank = String(row[1] || 'C').trim().toUpperCase();

          if (name && name.length > 0) {
            const existing = customers.find(c => c.name === name);
            if (!existing) {
              const newCustomer = {
                id: Date.now() + index,
                name,
                rank: ['A', 'B', 'C', 'D'].includes(rank) ? rank : 'C',
                isAppUser: false
              };
              try {
                await api.addCustomer(newCustomer);
                newCustomers.push(newCustomer);
              } catch (err) {
                console.error('Failed to add customer:', name, err);
              }
            }
          }
        }

        setCustomers([...customers, ...newCustomers]);
        showNotification(`${newCustomers.length}件の顧客を追加しました`);
      } catch (err) {
        console.error('Import error:', err);
        showNotification('ファイルの読み込みに失敗しました', 'error');
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // ============================================
  // ナビゲーションメニュー
  // ============================================

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
    { id: 'sales-input', label: '売上伝票入力', icon: '📝' },
    { id: 'customer-list', label: 'お客様分布リスト', icon: '👥' },
    { id: 'product-count', label: '製品別販売積算', icon: '📈' },
    { id: 'monthly-report', label: '月末レポート', icon: '📋' },
    { id: 'yearly-report', label: '年間ABC報告', icon: '📅' },
    { id: 'income-statement', label: '収支計算書', icon: '💰' },
    { id: 'beyond', label: 'Beyond', icon: '🚀' },
    { id: 'master', label: 'マスタ管理', icon: '⚙️' },
    { id: 'backup', label: 'データ管理', icon: '💾' },
  ];

  /**
   * ナビゲーション選択処理
   */
  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // ============================================
  // レンダリング
  // ============================================

  // ローディング中
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        読み込み中...
      </div>
    );
  }

  // 未認証時はログイン画面
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} api={api} />;
  }

  return (
    <div style={styles.container}>
      {/* モバイル: ハンバーガーボタン */}
      {isMobile && (
        <button
          style={styles.hamburgerButton}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="メニュー"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* PC: サイドバー展開ボタン（折りたたみ時のみ表示） */}
      {!isMobile && sidebarCollapsed && (
        <button
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: 1001,
            width: 44,
            height: 44,
            backgroundColor: COLORS.primary,
            border: 'none',
            borderRadius: 8,
            color: COLORS.white,
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onClick={() => setSidebarCollapsed(false)}
          aria-label="メニューを開く"
        >
          ☰
        </button>
      )}

      {/* モバイル: オーバーレイ */}
      {isMobile && sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside style={isMobile ? {
        ...styles.sidebarMobile,
        ...(sidebarOpen ? styles.sidebarMobileOpen : {})
      } : {
        ...styles.sidebar,
        ...(sidebarCollapsed ? { display: 'none' } : {})
      }}>
        <div style={{...styles.logo, justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span style={styles.logoIcon}>💄</span>
            <span style={styles.logoText}>販売管理</span>
            <span style={{
              marginLeft: 8,
              fontSize: 10,
              color: '#888',
              backgroundColor: '#333',
              padding: '2px 6px',
              borderRadius: 4
            }}>v3.3</span>
          </div>
          {/* PC: サイドバー折りたたみボタン */}
          {!isMobile && (
            <button
              style={{
                width: 28,
                height: 28,
                backgroundColor: 'transparent',
                border: '1px solid #555',
                borderRadius: 4,
                color: '#aaa',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setSidebarCollapsed(true)}
              aria-label="メニューを閉じる"
              title="サイドバーを折りたたむ"
            >
              ◀
            </button>
          )}
        </div>
        <nav style={styles.nav}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                ...(isMobile ? styles.navItemMobile : styles.navItem),
                ...(currentView === item.id ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.fiscalYear}>
          会計年度: {getFiscalYear(new Date())}年度
          <br />
          <small>({getFiscalYear(new Date())}年3月〜{getFiscalYear(new Date()) + 1}年2月)</small>
          <br />
          <button
            onClick={handleLogout}
            style={{
              marginTop: 12,
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #666',
              borderRadius: 4,
              color: '#999',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main style={isMobile ? styles.mainMobile : {
        ...styles.main,
        ...(sidebarCollapsed ? { marginLeft: 0, paddingLeft: 70 } : {})
      }}>
        {/* 通知 */}
        {notification && (
          <div style={{
            ...styles.notification,
            backgroundColor: notification.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: notification.type === 'error' ? '#dc2626' : '#16a34a'
          }}>
            {notification.message}
          </div>
        )}

        {/* ビュールーティング */}
        {currentView === 'dashboard' && (
          <Dashboard
            customers={customers}
            sales={sales}
            monthlyReports={monthlyReports}
          />
        )}
        {currentView === 'sales-input' && (
          <SalesInput
            customers={customers}
            sales={sales}
            addSale={addSale}
            updateSale={updateSale}
            deleteSale={deleteSale}
            addCustomer={addCustomer}
            customProducts={customProducts}
            displayCutoff={displayCutoff}
            clearSalesHistory={clearSalesHistory}
          />
        )}
        {currentView === 'customer-list' && (
          <CustomerList
            customers={customers}
            sales={sales}
            updateCustomer={updateCustomer}
          />
        )}
        {currentView === 'product-count' && (
          <ProductCount sales={sales} />
        )}
        {currentView === 'monthly-report' && (
          <MonthlyReport
            customers={customers}
            sales={sales}
            monthlyReports={monthlyReports}
            saveMonthlyReport={saveMonthlyReport}
          />
        )}
        {currentView === 'yearly-report' && (
          <YearlyReport
            monthlyReports={monthlyReports}
            customers={customers}
            sales={sales}
          />
        )}
        {currentView === 'income-statement' && (
          <IncomeStatement
            monthlyReports={monthlyReports}
            saveMonthlyReport={saveMonthlyReport}
          />
        )}
        {currentView === 'beyond' && (
          <Beyond
            monthlyReports={monthlyReports}
          />
        )}
        {currentView === 'master' && (
          <MasterManagement
            customers={customers}
            addCustomer={addCustomer}
            updateCustomer={updateCustomer}
            deleteCustomer={deleteCustomer}
            importCustomersFile={importCustomersFile}
            customProducts={customProducts}
            addCustomProduct={addCustomProduct}
            deleteCustomProduct={deleteCustomProduct}
          />
        )}
        {currentView === 'backup' && (
          <BackupManagement
            exportBackup={exportBackup}
            importBackup={importBackup}
          />
        )}
      </main>
    </div>
  );
}

export default App;
