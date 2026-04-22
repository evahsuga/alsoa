/**
 * ダッシュボードコンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 売上概要、顧客数、年間目標達成率を表示
 */

import React, { useState } from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { PRODUCT_TARGETS, FISCAL_MONTHS } from '../data/productMaster';

function Dashboard({ customers, sales, monthlyReports }) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(getFiscalYear(currentDate));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // 選択した月の売上を取得（会計年度に応じて年を調整）
  const getYearForMonth = (month) => {
    // 会計年度は3月〜翌2月。3月以降は選択年度、1-2月は選択年度+1
    return month >= 3 ? selectedYear : selectedYear + 1;
  };

  const selectedMonthSales = sales.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === getYearForMonth(selectedMonth);
  });

  // 選択した月の売上合計（アプリ利用者を除外）
  const totalSalesAmount = selectedMonthSales.reduce((sum, s) => {
    const customer = customers.find(c => c.name === s.customerName);
    // アプリ利用者の売上は除外
    if (customer?.isAppUser) return sum;
    return sum + s.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
  }, 0);

  // 選択した会計年度の売上を取得
  const fiscalYearSales = sales.filter(s => getFiscalYear(new Date(s.date)) === selectedYear);

  /**
   * カテゴリをカウント対象グループにマッピング
   */
  const getCategoryCountGroups = (category) => {
    if (!category) return [];
    if (category === 'QS' || category === 'QS(PF') return ['QS'];
    if (category === 'P') return ['P'];
    if (category === 'LI' || category === 'LII' || category === 'Lｾﾙ' || category === 'L') return ['L'];
    if (category === 'MO') return ['MO'];
    if (category === '下地SP') return ['SP'];
    if (category === '下地MP') return ['MP'];
    if (category === 'set3Ⅰ' || category === 'set3Ⅱ' || category === 'set3ｾﾙ') return ['QS', 'P', 'L'];
    if (category === 'B4Ⅰ' || category === 'B4Ⅱ' || category === 'B4ｾﾙ') return ['QS', 'P', 'L'];
    return [];
  };

  // 各カテゴリのカウント
  const categoryCounts = { QS: 0, P: 0, L: 0, MO: 0, SP: 0, MP: 0 };

  fiscalYearSales.forEach(sale => {
    sale.items.forEach(item => {
      const groups = getCategoryCountGroups(item.category);
      groups.forEach(group => {
        if (categoryCounts[group] !== undefined) {
          categoryCounts[group] += item.quantity;
        }
      });
    });
  });

  // 顧客ランク別カウントと購入金額（アプリ利用者を除外）
  const rankData = { A: { count: 0, amount: 0 }, B: { count: 0, amount: 0 }, C: { count: 0, amount: 0 }, D: { count: 0, amount: 0 } };

  // アプリ利用者を除いた顧客数
  const regularCustomers = customers.filter(c => !c.isAppUser);

  regularCustomers.forEach(c => {
    if (rankData[c.rank] !== undefined) {
      rankData[c.rank].count++;
      // その顧客の年間購入金額を計算
      const customerSales = fiscalYearSales.filter(s => s.customerName === c.name);
      const customerAmount = customerSales.reduce((sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
      );
      rankData[c.rank].amount += customerAmount;
    }
  });

  // 選択した月のレポートデータ（仕入れ・自分の使用金額）
  const currentReport = monthlyReports.find(r => r.year === getYearForMonth(selectedMonth) && r.month === selectedMonth);
  const purchaseAmount = currentReport?.purchase || 0;
  const selfUseAmount = currentReport?.selfUse || 0;

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>ダッシュボード</h1>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label>年度:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={styles.filterSelect}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}年度</option>
            ))}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label>月:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={styles.filterSelect}
          >
            {FISCAL_MONTHS.map(month => (
              <option key={month} value={month}>{month}月</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.cardGrid}>
        {/* 選択月の売上 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>💰</span>
            <span>{selectedMonth}月の売上</span>
          </div>
          <div style={styles.cardValue}>
            ¥{totalSalesAmount.toLocaleString()}
          </div>
          <div style={styles.cardSub}>
            {selectedMonthSales.length}件の取引
          </div>
        </div>

        {/* QS目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🧼</span>
            <span>QS（目標{PRODUCT_TARGETS.QS}個）</span>
          </div>
          <div style={styles.cardValue}>
            {categoryCounts.QS} / {PRODUCT_TARGETS.QS}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (categoryCounts.QS / PRODUCT_TARGETS.QS) * 100)}%`,
              backgroundColor: '#10b981'
            }}></div>
          </div>
        </div>

        {/* P目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🧴</span>
            <span>パック（目標{PRODUCT_TARGETS.P}個）</span>
          </div>
          <div style={styles.cardValue}>
            {categoryCounts.P} / {PRODUCT_TARGETS.P}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (categoryCounts.P / PRODUCT_TARGETS.P) * 100)}%`,
              backgroundColor: '#8b5cf6'
            }}></div>
          </div>
        </div>

        {/* L目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>💧</span>
            <span>ローション（目標{PRODUCT_TARGETS.L}個）</span>
          </div>
          <div style={styles.cardValue}>
            {categoryCounts.L} / {PRODUCT_TARGETS.L}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (categoryCounts.L / PRODUCT_TARGETS.L) * 100)}%`,
              backgroundColor: '#3b82f6'
            }}></div>
          </div>
        </div>

        {/* MO目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>✨</span>
            <span>メイクオフ（目標{PRODUCT_TARGETS.MO}個）</span>
          </div>
          <div style={styles.cardValue}>
            {categoryCounts.MO} / {PRODUCT_TARGETS.MO}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (categoryCounts.MO / PRODUCT_TARGETS.MO) * 100)}%`,
              backgroundColor: '#f59e0b'
            }}></div>
          </div>
        </div>

        {/* SP目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🎨</span>
            <span>下地SP（目標{PRODUCT_TARGETS.SP}個）</span>
          </div>
          <div style={styles.cardValue}>
            {categoryCounts.SP} / {PRODUCT_TARGETS.SP}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (categoryCounts.SP / PRODUCT_TARGETS.SP) * 100)}%`,
              backgroundColor: '#ec4899'
            }}></div>
          </div>
        </div>

        {/* MP目標 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>💄</span>
            <span>下地MP（目標{PRODUCT_TARGETS.MP}個）</span>
          </div>
          <div style={styles.cardValue}>
            {categoryCounts.MP} / {PRODUCT_TARGETS.MP}
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(100, (categoryCounts.MP / PRODUCT_TARGETS.MP) * 100)}%`,
              backgroundColor: '#06b6d4'
            }}></div>
          </div>
        </div>
      </div>

      {/* 顧客ランク別集計 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>顧客ランク別集計（{selectedYear}年度）</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}></th>
                <th style={styles.th}>総ユーザー数</th>
                <th style={styles.th}>Aランク</th>
                <th style={styles.th}>Bランク</th>
                <th style={styles.th}>Cランク</th>
                <th style={styles.th}>Dランク</th>
                <th style={styles.th}>仕入れ</th>
                <th style={styles.th}>自分の使用金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{...styles.td, fontWeight: 'bold'}}>人数</td>
                <td style={{...styles.td, textAlign: 'center'}}>{regularCustomers.length}人</td>
                <td style={{...styles.td, textAlign: 'center'}}>{rankData.A.count}人</td>
                <td style={{...styles.td, textAlign: 'center'}}>{rankData.B.count}人</td>
                <td style={{...styles.td, textAlign: 'center'}}>{rankData.C.count}人</td>
                <td style={{...styles.td, textAlign: 'center'}}>{rankData.D.count}人</td>
                <td style={{...styles.td, textAlign: 'center'}}>-</td>
                <td style={{...styles.td, textAlign: 'center'}}>-</td>
              </tr>
              <tr>
                <td style={{...styles.td, fontWeight: 'bold'}}>購入金額</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{(rankData.A.amount + rankData.B.amount + rankData.C.amount + rankData.D.amount).toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{rankData.A.amount.toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{rankData.B.amount.toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{rankData.C.amount.toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{rankData.D.amount.toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{purchaseAmount.toLocaleString()}</td>
                <td style={{...styles.td, textAlign: 'right'}}>¥{selfUseAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
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
