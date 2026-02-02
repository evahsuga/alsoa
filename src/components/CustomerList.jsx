/**
 * お客様分布リストコンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 書類2: 顧客別の月次購入履歴・ランク管理
 */

import React, { useState } from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { FISCAL_MONTHS } from '../data/productMaster';
import { printDocument } from '../utils/printDocument';

function CustomerList({ customers, sales, updateCustomer }) {
  const [selectedYear, setSelectedYear] = useState(getFiscalYear(new Date()));
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * 顧客別の売上データを取得
   */
  const getCustomerSales = (customerName) => {
    const customerSales = sales.filter(s =>
      s.customerName === customerName &&
      getFiscalYear(new Date(s.date)) === selectedYear
    );

    const monthlyPurchases = {};
    FISCAL_MONTHS.forEach(m => monthlyPurchases[m] = []);

    const categoryCounts = { QS: 0, L: 0, P: 0, ES: 0, other: 0 };
    let totalAmount = 0;

    customerSales.forEach(sale => {
      const month = new Date(sale.date).getMonth() + 1;
      sale.items.forEach(item => {
        if (monthlyPurchases[month]) {
          const abbrev = item.category || 'other';
          monthlyPurchases[month].push(abbrev);
        }
        if (categoryCounts[item.category] !== undefined) {
          categoryCounts[item.category] += item.quantity;
        } else {
          categoryCounts.other += item.quantity;
        }
        totalAmount += item.price * item.quantity;
      });
    });

    return {
      monthlyPurchases,
      categoryCounts,
      totalAmount,
      monthlyAverage: customerSales.length > 0 ? Math.round(totalAmount / 12) : 0
    };
  };

  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchTerm) || c.rank.includes(searchTerm)
  );

  /**
   * PDF出力
   */
  const handlePrint = () => {
    const rows = filteredCustomers.map((customer, index) => {
      const salesData = getCustomerSales(customer.name);
      return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td class="text-center">${customer.rank}</td>
          <td>${customer.name}</td>
          <td class="text-right">¥${salesData.totalAmount.toLocaleString()}</td>
          <td class="text-right">¥${salesData.monthlyAverage.toLocaleString()}</td>
          <td class="text-center">${salesData.categoryCounts.QS || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.L || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.P || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.ES || '-'}</td>
          ${FISCAL_MONTHS.map(month =>
            `<td class="text-center" style="font-size:7pt;">${salesData.monthlyPurchases[month]?.join(',') || '-'}</td>`
          ).join('')}
        </tr>
      `;
    }).join('');

    const content = `
      <div class="print-header">
        <h1>お客様分布リスト（書類2）</h1>
        <div class="subtitle">${selectedYear}年度（${selectedYear}年3月〜${selectedYear + 1}年2月）　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th style="width:35px;">ランク</th>
            <th style="min-width:80px;">お客様名</th>
            <th style="width:80px;">年間購入</th>
            <th style="width:65px;">月平均</th>
            <th style="width:30px;">QS</th>
            <th style="width:30px;">L</th>
            <th style="width:30px;">P</th>
            <th style="width:30px;">ES</th>
            ${FISCAL_MONTHS.map(m => `<th style="width:45px;">${m}月</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    printDocument(content, 'お客様分布リスト', 'landscape');
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>お客様分布リスト（書類2）</h1>

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
          <input
            type="text"
            placeholder="顧客名・ランクで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <button onClick={handlePrint} style={styles.printButton}>
          📄 PDF出力（横）
        </button>
      </div>

      <div style={{
        ...styles.wideTableContainer,
        maxHeight: 'calc(100vh - 250px)',
        overflowY: 'auto',
        overflowX: 'auto'
      }}>
        <table style={{...styles.table, borderCollapse: 'separate', borderSpacing: 0}}>
          <thead>
            <tr>
              <th style={{
                ...styles.th,
                position: 'sticky',
                top: 0,
                left: 0,
                backgroundColor: '#f8f9fa',
                zIndex: 3,
                width: 40
              }}>No</th>
              <th style={{
                ...styles.th,
                position: 'sticky',
                top: 0,
                left: 40,
                backgroundColor: '#f8f9fa',
                zIndex: 3,
                width: 50
              }}>ランク</th>
              <th style={{
                ...styles.th,
                position: 'sticky',
                top: 0,
                left: 90,
                backgroundColor: '#f8f9fa',
                zIndex: 3,
                minWidth: 100
              }}>お客様名</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 100}}>年間購入</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 80}}>月平均</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>QS</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>L</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>P</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>ES</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 50}}>other</th>
              {FISCAL_MONTHS.map(month => (
                <th key={month} style={{
                  ...styles.th,
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#f8f9fa',
                  zIndex: 2,
                  width: 60,
                  minWidth: 60
                }}>{month}月</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => {
              const salesData = getCustomerSales(customer.name);
              return (
                <tr key={customer.id}>
                  <td style={{
                    ...styles.td,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    width: 40
                  }}>{index + 1}</td>
                  <td style={{
                    ...styles.td,
                    position: 'sticky',
                    left: 40,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    width: 50
                  }}>
                    <select
                      value={customer.rank}
                      onChange={(e) => updateCustomer(customer.id, { rank: e.target.value })}
                      style={styles.inlineSelect}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </td>
                  <td style={{
                    ...styles.td,
                    position: 'sticky',
                    left: 90,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    minWidth: 100
                  }}>{customer.name}</td>
                  <td style={{...styles.td, width: 100, textAlign: 'right'}}>¥{salesData.totalAmount.toLocaleString()}</td>
                  <td style={{...styles.td, width: 80, textAlign: 'right'}}>¥{salesData.monthlyAverage.toLocaleString()}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.QS || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.L || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.P || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.ES || '-'}</td>
                  <td style={{...styles.td, width: 50, textAlign: 'center'}}>{salesData.categoryCounts.other || '-'}</td>
                  {FISCAL_MONTHS.map(month => (
                    <td key={month} style={{
                      ...styles.td,
                      fontSize: 11,
                      width: 60,
                      minWidth: 60,
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      verticalAlign: 'top',
                      padding: '8px 4px'
                    }}>
                      {salesData.monthlyPurchases[month]?.join(', ') || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerList;
