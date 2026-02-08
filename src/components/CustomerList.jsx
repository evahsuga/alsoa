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
   * 略称を集計用グループにマッピング
   */
  const getCategoryGroup = (category) => {
    if (!category) return ['other'];
    // QSグループ
    if (category === 'QS' || category === 'QS(PF') return ['QS'];
    // Pグループ（パック）
    if (category === 'P') return ['P'];
    // Lグループ（ローション）
    if (category === 'LI' || category === 'LII' || category === 'Lｾﾙ' || category === 'L') return ['L'];
    // MOグループ（メイクオフ）
    if (category === 'MO') return ['MO'];
    // SPグループ（下地SP）
    if (category === '下地SP') return ['SP'];
    // MPグループ（下地MP）
    if (category === '下地MP') return ['MP'];
    // 酵素グループ
    if (category === '酵素' || category === '酵素+R' || category === '酵素+L' || category === '酵素G') return ['酵素'];
    // セット3（QS, P, L に各+1）
    if (category === 'set3Ⅰ' || category === 'set3Ⅱ' || category === 'set3ｾﾙ') return ['QS', 'P', 'L'];
    // ベスト4（QS, P, L, other に各+1）※ESはotherに計上
    if (category === 'B4Ⅰ' || category === 'B4Ⅱ' || category === 'B4ｾﾙ') return ['QS', 'P', 'L', 'other'];
    // その他は全てother（ES含む）
    return ['other'];
  };

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

    const categoryCounts = { QS: 0, P: 0, L: 0, MO: 0, SP: 0, MP: 0, 酵素: 0, other: 0 };
    let totalAmount = 0;

    customerSales.forEach(sale => {
      const month = new Date(sale.date).getMonth() + 1;
      sale.items.forEach(item => {
        if (monthlyPurchases[month]) {
          const abbrev = item.category || 'other';
          // 複数購入時は「略称×数量」形式で表示
          const display = item.quantity > 1 ? `${abbrev}×${item.quantity}` : abbrev;
          monthlyPurchases[month].push(display);
        }
        // 集計用グループにマッピングしてカウント（複数グループ対応）
        const groups = getCategoryGroup(item.category);
        groups.forEach(group => {
          categoryCounts[group] += item.quantity;
        });
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
   * 略称集計の合計を計算
   */
  const getTotals = () => {
    const totals = { QS: 0, P: 0, L: 0, MO: 0, SP: 0, MP: 0, 酵素: 0, other: 0 };
    filteredCustomers.forEach(customer => {
      const salesData = getCustomerSales(customer.name);
      Object.keys(totals).forEach(key => {
        totals[key] += salesData.categoryCounts[key] || 0;
      });
    });
    return totals;
  };

  const totals = getTotals();

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
          <td class="text-center">${salesData.categoryCounts.P || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.L || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.MO || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.SP || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.MP || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.酵素 || '-'}</td>
          <td class="text-center">${salesData.categoryCounts.other || '-'}</td>
          ${FISCAL_MONTHS.map(month => {
            const purchases = salesData.monthlyPurchases[month];
            const content = purchases?.length > 0
              ? purchases.map(abbrev => `<span style="white-space:nowrap;">${abbrev}</span>`).join(',')
              : '-';
            return `<td class="text-center" style="font-size:7pt;">${content}</td>`;
          }).join('')}
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
            <th style="width:30px;">P</th>
            <th style="width:30px;">L</th>
            <th style="width:30px;">MO</th>
            <th style="width:30px;">SP</th>
            <th style="width:30px;">MP</th>
            <th style="width:30px;">酵素</th>
            <th style="width:35px;">other</th>
            ${FISCAL_MONTHS.map(m => `<th style="width:45px;">${m}月</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="background-color:#f0f0f0;font-weight:bold;">
            <td colspan="5" class="text-center">合計</td>
            <td class="text-center">${totals.QS}</td>
            <td class="text-center">${totals.P}</td>
            <td class="text-center">${totals.L}</td>
            <td class="text-center">${totals.MO}</td>
            <td class="text-center">${totals.SP}</td>
            <td class="text-center">${totals.MP}</td>
            <td class="text-center">${totals.酵素}</td>
            <td class="text-center">${totals.other}</td>
            ${FISCAL_MONTHS.map(() => `<td></td>`).join('')}
          </tr>
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
        <table style={{...styles.table, borderCollapse: 'separate', borderSpacing: 0, minWidth: 1400, width: 'auto'}}>
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
                minWidth: 100,
                borderRight: '2px solid #dee2e6',
                boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
              }}>お客様名</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 100}}>年間購入</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 80}}>月平均</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>QS</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>P</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>L</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>MO</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>SP</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>MP</th>
              <th style={{...styles.th, position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 2, width: 35}}>酵素</th>
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
                    minWidth: 100,
                    borderRight: '2px solid #dee2e6',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                  }}>{customer.name}</td>
                  <td style={{...styles.td, width: 100, textAlign: 'right'}}>¥{salesData.totalAmount.toLocaleString()}</td>
                  <td style={{...styles.td, width: 80, textAlign: 'right'}}>¥{salesData.monthlyAverage.toLocaleString()}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.QS || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.P || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.L || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.MO || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.SP || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.MP || '-'}</td>
                  <td style={{...styles.td, width: 35, textAlign: 'center'}}>{salesData.categoryCounts.酵素 || '-'}</td>
                  <td style={{...styles.td, width: 50, textAlign: 'center'}}>{salesData.categoryCounts.other || '-'}</td>
                  {FISCAL_MONTHS.map(month => (
                    <td key={month} style={{
                      ...styles.td,
                      fontSize: 11,
                      width: 60,
                      minWidth: 60,
                      verticalAlign: 'top',
                      padding: '8px 4px',
                      lineHeight: 1.4
                    }}>
                      {salesData.monthlyPurchases[month]?.length > 0
                        ? salesData.monthlyPurchases[month].map((abbrev, i) => (
                            <span key={i} style={{
                              display: 'inline-block',
                              whiteSpace: 'nowrap',
                              marginRight: i < salesData.monthlyPurchases[month].length - 1 ? 4 : 0
                            }}>
                              {abbrev}{i < salesData.monthlyPurchases[month].length - 1 ? ',' : ''}
                            </span>
                          ))
                        : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
            {/* 集計行 */}
            <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
              <td style={{
                ...styles.td,
                position: 'sticky',
                left: 0,
                backgroundColor: '#e9ecef',
                zIndex: 1,
                width: 40
              }}></td>
              <td style={{
                ...styles.td,
                position: 'sticky',
                left: 40,
                backgroundColor: '#e9ecef',
                zIndex: 1,
                width: 50
              }}></td>
              <td style={{
                ...styles.td,
                position: 'sticky',
                left: 90,
                backgroundColor: '#e9ecef',
                zIndex: 1,
                minWidth: 100,
                borderRight: '2px solid #dee2e6',
                textAlign: 'center'
              }}>合計</td>
              <td style={{...styles.td, width: 100, backgroundColor: '#e9ecef'}}></td>
              <td style={{...styles.td, width: 80, backgroundColor: '#e9ecef'}}></td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.QS}</td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.P}</td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.L}</td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.MO}</td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.SP}</td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.MP}</td>
              <td style={{...styles.td, width: 35, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.酵素}</td>
              <td style={{...styles.td, width: 50, textAlign: 'center', backgroundColor: '#e9ecef'}}>{totals.other}</td>
              {FISCAL_MONTHS.map(month => (
                <td key={month} style={{...styles.td, backgroundColor: '#e9ecef'}}></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerList;
