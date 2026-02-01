/**
 * ダッシュボードコンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 売上概要、顧客数、年間目標達成率を表示
 */

import React from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { PRODUCT_TARGETS } from '../data/productMaster';

function Dashboard({ customers, sales, monthlyReports }) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const fiscalYear = getFiscalYear(currentDate);

  // 今月の売上を取得
  const currentMonthSales = sales.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  // 今月の売上合計
  const totalSalesAmount = currentMonthSales.reduce((sum, s) =>
    sum + s.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
  );

  // 会計年度の売上を取得
  const fiscalYearSales = sales.filter(s => getFiscalYear(new Date(s.date)) === fiscalYear);

  // QSとローションのカウント
  let qsCount = 0;
  let lotionCount = 0;

  fiscalYearSales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.category === 'QS') qsCount += item.quantity;
      if (item.category === 'L') lotionCount += item.quantity;
    });
  });

  // 顧客ランク別カウント
  const rankCounts = { A: 0, B: 0, C: 0, D: 0 };
  customers.forEach(c => {
    if (rankCounts[c.rank] !== undefined) rankCounts[c.rank]++;
  });

  const qsTarget = PRODUCT_TARGETS.QS;
  const lotionTarget = PRODUCT_TARGETS.L;

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>ダッシュボード</h1>

      <div style={styles.cardGrid}>
        {/* 今月の売上 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>💰</span>
            <span>今月の売上</span>
          </div>
          <div style={styles.cardValue}>
            ¥{totalSalesAmount.toLocaleString()}
          </div>
          <div style={styles.cardSub}>
            {currentMonthSales.length}件の取引
          </div>
        </div>

        {/* 総顧客数 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>👥</span>
            <span>総顧客数</span>
          </div>
          <div style={styles.cardValue}>
            {customers.length}名
          </div>
          <div style={styles.cardSub}>
            A:{rankCounts.A} B:{rankCounts.B} C:{rankCounts.C} D:{rankCounts.D}
          </div>
        </div>

        {/* QS目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🧼</span>
            <span>QS（年間目標{qsTarget}個）</span>
          </div>
          <div style={styles.cardValue}>
            {qsCount} / {qsTarget}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (qsCount / qsTarget) * 100)}%`
            }}></div>
          </div>
          <div style={styles.cardSub}>
            達成率: {Math.round((qsCount / qsTarget) * 100)}%
          </div>
        </div>

        {/* ローション目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>💧</span>
            <span>ローション（年間目標{lotionTarget}個）</span>
          </div>
          <div style={styles.cardValue}>
            {lotionCount} / {lotionTarget}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (lotionCount / lotionTarget) * 100)}%`,
              backgroundColor: '#3b82f6'
            }}></div>
          </div>
          <div style={styles.cardSub}>
            達成率: {Math.round((lotionCount / lotionTarget) * 100)}%
          </div>
        </div>
      </div>

      {/* 最近の売上 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>最近の売上（直近5件）</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>日付</th>
                <th style={styles.th}>顧客名</th>
                <th style={styles.th}>商品</th>
                <th style={styles.th}>金額</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(-5).reverse().map(sale => (
                <tr key={sale.id}>
                  <td style={styles.td}>{sale.date}</td>
                  <td style={styles.td}>{sale.customerName}</td>
                  <td style={styles.td}>
                    {sale.items.map(item => item.name).join(', ')}
                  </td>
                  <td style={styles.td}>
                    ¥{sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                    売上データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
