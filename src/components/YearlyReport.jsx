/**
 * 年間ABC報告コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 書類3: 年間推移表示
 */

import React, { useState } from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { FISCAL_MONTHS } from '../data/productMaster';
import { printDocument } from '../utils/printDocument';

function YearlyReport({ monthlyReports, customers, sales }) {
  const [selectedYear, setSelectedYear] = useState(getFiscalYear(new Date()));

  /**
   * 年間データを取得
   */
  const getYearlyData = () => {
    const data = [];

    FISCAL_MONTHS.forEach(month => {
      const year = month >= 3 ? selectedYear : selectedYear + 1;
      const report = monthlyReports.find(r => r.year === year && r.month === month);

      const monthSales = sales.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      const rankData = {
        A: { count: 0, amount: 0 },
        B: { count: 0, amount: 0 },
        C: { count: 0, amount: 0 },
        D: { count: 0, amount: 0 }
      };
      const customerSet = { A: new Set(), B: new Set(), C: new Set(), D: new Set() };

      monthSales.forEach(sale => {
        const customer = customers.find(c => c.name === sale.customerName);
        const rank = customer?.rank || 'C';
        sale.items.forEach(item => {
          if (rankData[rank]) {
            rankData[rank].amount += item.price * item.quantity;
            customerSet[rank].add(sale.customerName);
          }
        });
      });

      Object.keys(rankData).forEach(rank => {
        rankData[rank].count = customerSet[rank].size;
      });

      data.push({
        month,
        year,
        report,
        rankData,
        totalCustomers: customers.length,
        totalSales: Object.values(rankData).reduce((sum, r) => sum + r.amount, 0)
      });
    });

    return data;
  };

  const yearlyData = getYearlyData();

  /**
   * PDF出力
   */
  const handlePrint = () => {
    const rows = yearlyData.map(data => `
      <tr>
        <td class="text-center">${data.month}月</td>
        <td class="text-center">${data.totalCustomers}</td>
        <td class="text-center">${data.rankData.A.count}</td>
        <td class="text-right">¥${data.rankData.A.amount.toLocaleString()}</td>
        <td class="text-center">${data.rankData.B.count}</td>
        <td class="text-right">¥${data.rankData.B.amount.toLocaleString()}</td>
        <td class="text-center">${data.rankData.C.count}</td>
        <td class="text-right">¥${data.rankData.C.amount.toLocaleString()}</td>
        <td class="text-center">${data.rankData.D.count}</td>
        <td class="text-right">¥${data.rankData.D.amount.toLocaleString()}</td>
        <td class="text-right">¥${data.totalSales.toLocaleString()}</td>
        <td class="text-right">¥${(data.report?.purchase || 0).toLocaleString()}</td>
        <td class="text-right">¥${(data.report?.selfUse || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    const content = `
      <div class="print-header">
        <h1>${selectedYear}年度 ABC報告（書類3）</h1>
        <div class="subtitle">${selectedYear}年3月〜${selectedYear + 1}年2月　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th rowspan="2" style="width:45px;">月</th>
            <th rowspan="2" style="width:45px;">総数</th>
            <th colspan="2">Aランク</th>
            <th colspan="2">Bランク</th>
            <th colspan="2">Cランク</th>
            <th colspan="2">Dランク</th>
            <th rowspan="2" style="width:80px;">実売</th>
            <th rowspan="2" style="width:80px;">仕入れ</th>
            <th rowspan="2" style="width:80px;">使用金額</th>
          </tr>
          <tr>
            <th style="width:35px;">人</th>
            <th style="width:70px;">金額</th>
            <th style="width:35px;">人</th>
            <th style="width:70px;">金額</th>
            <th style="width:35px;">人</th>
            <th style="width:70px;">金額</th>
            <th style="width:35px;">人</th>
            <th style="width:70px;">金額</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    printDocument(content, '年間ABC報告', 'landscape');
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>{selectedYear}年度 ABC報告（書類3）</h1>

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
        <button onClick={handlePrint} style={styles.printButton}>
          📄 PDF出力（横）
        </button>
      </div>

      <div style={styles.wideTableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>月</th>
              <th style={styles.th}>総数</th>
              <th style={styles.th} colSpan="2">Aランク</th>
              <th style={styles.th} colSpan="2">Bランク</th>
              <th style={styles.th} colSpan="2">Cランク</th>
              <th style={styles.th} colSpan="2">Dランク</th>
              <th style={styles.th}>実売</th>
              <th style={styles.th}>仕入れ</th>
              <th style={styles.th}>使用金額</th>
            </tr>
            <tr>
              <th style={styles.thSub}></th>
              <th style={styles.thSub}></th>
              <th style={styles.thSub}>人</th>
              <th style={styles.thSub}>金額</th>
              <th style={styles.thSub}>人</th>
              <th style={styles.thSub}>金額</th>
              <th style={styles.thSub}>人</th>
              <th style={styles.thSub}>金額</th>
              <th style={styles.thSub}>人</th>
              <th style={styles.thSub}>金額</th>
              <th style={styles.thSub}></th>
              <th style={styles.thSub}></th>
              <th style={styles.thSub}></th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((data, index) => (
              <tr key={index}>
                <td style={styles.td}>{data.month}月</td>
                <td style={styles.td}>{data.totalCustomers}</td>
                <td style={styles.td}>{data.rankData.A.count}</td>
                <td style={styles.td}>{data.rankData.A.amount.toLocaleString()}</td>
                <td style={styles.td}>{data.rankData.B.count}</td>
                <td style={styles.td}>{data.rankData.B.amount.toLocaleString()}</td>
                <td style={styles.td}>{data.rankData.C.count}</td>
                <td style={styles.td}>{data.rankData.C.amount.toLocaleString()}</td>
                <td style={styles.td}>{data.rankData.D.count}</td>
                <td style={styles.td}>{data.rankData.D.amount.toLocaleString()}</td>
                <td style={styles.td}>{data.totalSales.toLocaleString()}</td>
                <td style={styles.td}>{data.report?.purchase?.toLocaleString() || 0}</td>
                <td style={styles.td}>{data.report?.selfUse?.toLocaleString() || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyReport;
