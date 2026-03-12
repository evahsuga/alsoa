/**
 * メインアプリケーションコンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * @version 1.4
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// データ・ユーティリティ
import { PRODUCT_MASTER } from './data/productMaster';
import { getAllProducts } from './utils/productUtils';
import { getFiscalYear } from './utils/productUtils';
import {
  loadAllData,
  saveAllData,
  exportBackup as exportBackupUtil,
  importBackup as importBackupUtil,
  DEFAULT_VALUES
} from './utils/storage';

// スタイル
import { styles, COLORS } from './styles/styles';

// コンポーネント
import Dashboard from './components/Dashboard';
import SalesInput from './components/SalesInput';
import CustomerList from './components/CustomerList';
import ProductCount from './components/ProductCount';
import MonthlyReport from './components/MonthlyReport';
import YearlyReport from './components/YearlyReport';
import MasterManagement from './components/MasterManagement';
import BackupManagement from './components/BackupManagement';

// カスタムフック
import { useNotification } from './hooks/useNotification';
import { useMediaQuery } from './hooks/useMediaQuery';

/**
 * メインアプリコンポーネント
 */
function App() {
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

  // 初期データ読み込み
  useEffect(() => {
    loadData();
  }, []);

  /**
   * LocalStorageからデータを読み込む
   */
  const loadData = () => {
    const data = loadAllData();
    setCustomers(data.customers);
    setSales(data.sales);
    setMonthlyReports(data.monthlyReports);
    setCustomProducts(data.customProducts);
    setDisplayCutoff(data.displayCutoff);
  };

  /**
   * LocalStorageにデータを保存
   */
  const saveData = (
    newCustomers = customers,
    newSales = sales,
    newReports = monthlyReports,
    newCustomProducts = customProducts,
    newDisplayCutoff = displayCutoff
  ) => {
    saveAllData({
      customers: newCustomers,
      sales: newSales,
      monthlyReports: newReports,
      customProducts: newCustomProducts,
      displayCutoff: newDisplayCutoff
    });
  };

  // ============================================
  // 顧客操作
  // ============================================

  const addCustomer = (customer) => {
    const newCustomers = [...customers, { ...customer, id: Date.now() }];
    setCustomers(newCustomers);
    saveData(newCustomers, sales, monthlyReports);
    showNotification('顧客を登録しました');
  };

  const updateCustomer = (id, updates) => {
    const newCustomers = customers.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    setCustomers(newCustomers);
    saveData(newCustomers, sales, monthlyReports);
  };

  const deleteCustomer = (id) => {
    const customer = customers.find(c => c.id === id);
    if (window.confirm(`「${customer?.name}」を削除しますか？\n※この顧客の売上データは残ります`)) {
      const newCustomers = customers.filter(c => c.id !== id);
      setCustomers(newCustomers);
      saveData(newCustomers, sales, monthlyReports, customProducts);
      showNotification('顧客を削除しました');
    }
  };

  // ============================================
  // カスタム製品操作
  // ============================================

  const addCustomProduct = (categoryKey, product) => {
    const allProducts = getAllProducts(customProducts);
    if (allProducts.some(p => p.code === product.code)) {
      showNotification('この商品コードは既に使用されています', 'error');
      return false;
    }

    const newProduct = {
      ...product,
      id: Date.now(),
      isCustom: true
    };
    const newCustomProducts = {
      ...customProducts,
      [categoryKey]: [...(customProducts[categoryKey] || []), newProduct]
    };
    setCustomProducts(newCustomProducts);
    saveData(customers, sales, monthlyReports, newCustomProducts);
    showNotification('製品を追加しました');
    return true;
  };

  const deleteCustomProduct = (categoryKey, productId) => {
    const product = customProducts[categoryKey]?.find(p => p.id === productId);
    if (window.confirm(`「${product?.name}」を削除しますか？\n※過去の売上データには影響しません`)) {
      const newCustomProducts = {
        ...customProducts,
        [categoryKey]: customProducts[categoryKey].filter(p => p.id !== productId)
      };
      setCustomProducts(newCustomProducts);
      saveData(customers, sales, monthlyReports, newCustomProducts);
      showNotification('製品を削除しました');
    }
  };

  // ============================================
  // 売上操作
  // ============================================

  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const newSales = [...sales, newSale];
    setSales(newSales);
    saveData(customers, newSales, monthlyReports, customProducts, displayCutoff);
    showNotification('売上を登録しました');
  };

  const updateSale = (id, updatedSale) => {
    const newSales = sales.map(s =>
      s.id === id
        ? { ...s, ...updatedSale, updatedAt: new Date().toISOString() }
        : s
    );
    setSales(newSales);
    saveData(customers, newSales, monthlyReports, customProducts, displayCutoff);
    showNotification('売上を更新しました');
  };

  const deleteSale = (id) => {
    const sale = sales.find(s => s.id === id);
    if (window.confirm(`${sale?.date} ${sale?.customerName}の売上を削除しますか？\n※この操作は取り消せません`)) {
      const newSales = sales.filter(s => s.id !== id);
      setSales(newSales);
      saveData(customers, newSales, monthlyReports, customProducts, displayCutoff);
      showNotification('売上を削除しました');
    }
  };

  const clearSalesHistory = () => {
    if (window.confirm('履歴表示をクリアして翌月の入力を開始しますか？\n\n※売上データは削除されません\n※レポート集計には影響しません')) {
      const newCutoff = new Date().toISOString();
      setDisplayCutoff(newCutoff);
      saveData(customers, sales, monthlyReports, customProducts, newCutoff);
      showNotification('履歴表示をクリアしました');
    }
  };

  // ============================================
  // 月次レポート操作
  // ============================================

  const saveMonthlyReport = (report) => {
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
    saveData(customers, sales, newReports, customProducts, displayCutoff);
    showNotification('月次レポートを保存しました');
  };

  // ============================================
  // バックアップ操作
  // ============================================

  const exportBackup = () => {
    exportBackupUtil({
      customers,
      sales,
      monthlyReports,
      customProducts,
      displayCutoff
    });
    showNotification('バックアップをエクスポートしました');
  };

  const importBackup = async (file) => {
    try {
      const data = await importBackupUtil(file);
      setCustomers(data.customers);
      setSales(data.sales);
      setMonthlyReports(data.monthlyReports);
      setCustomProducts(data.customProducts);
      setDisplayCutoff(data.displayCutoff);
      saveData(
        data.customers,
        data.sales,
        data.monthlyReports,
        data.customProducts,
        data.displayCutoff
      );
      showNotification('バックアップを復元しました');
    } catch (err) {
      showNotification('ファイルの読み込みに失敗しました', 'error');
    }
  };

  // ============================================
  // 顧客インポート
  // ============================================

  const importCustomersFile = (file) => {
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = (e) => {
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
        rows.forEach((row, index) => {
          if (index === 0) {
            const firstCell = String(row[0] || '').toLowerCase();
            if (firstCell.includes('顧客') || firstCell.includes('名前') ||
                firstCell.includes('ランク') || firstCell === 'name') {
              return;
            }
          }

          const name = String(row[0] || '').trim();
          const rank = String(row[1] || 'C').trim().toUpperCase();

          if (name && name.length > 0) {
            const existing = customers.find(c => c.name === name);
            if (!existing) {
              newCustomers.push({
                id: Date.now() + index,
                name,
                rank: ['A', 'B', 'C', 'D'].includes(rank) ? rank : 'C',
                isAppUser: false  // インポート時はデフォルトfalse
              });
            }
          }
        });

        const allCustomers = [...customers, ...newCustomers];
        setCustomers(allCustomers);
        saveData(allCustomers, sales, monthlyReports, customProducts);
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
    { id: 'master', label: 'マスタ管理', icon: '⚙️' },
    { id: 'backup', label: 'データ管理', icon: '💾' },
  ];

  /**
   * ナビゲーション選択処理（モバイル時はサイドバーを閉じる）
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
            }}>ver2.0</span>
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
