/**
 * 月末レポートコンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 書類1: 月次実績入力・集計
 */

import React, { useState, useEffect } from 'react';
import { styles } from '../styles/styles';
import { FISCAL_MONTHS } from '../data/productMaster';
import { printDocument } from '../utils/printDocument';

function MonthlyReport({ customers, sales, monthlyReports, saveMonthlyReport }) {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const existingReport = monthlyReports.find(
    r => r.year === selectedYear && r.month === selectedMonth
  );

  const [report, setReport] = useState(existingReport || {
    year: selectedYear,
    month: selectedMonth,
    targetSales: 0,
    resultSales: 0,
    actions: {
      newCustomer: { target: 0, result: 0, amount: 0 },
      priceUp: { target: 0, result: 0, amount: 0 },
      jp: { target: 0, result: 0, amount: 0 },
      sample: { target: 0, result: 0 },
      monitor: { target: 0, result: 0 },
      expansion: { target: 0, result: 0 },
      repeat: { target: 0, result: 0 },
    },
    afterFollow: { total: 0, done: 0 },
    metCount: 0,
    threeStepSales: { qs: 0, pack: 0, lotion: 0, mo: 0, sp: 0 },
    purchase: 0,
    selfUse: 0
  });

  // 年月変更時にレポートを更新
  useEffect(() => {
    const existing = monthlyReports.find(
      r => r.year === selectedYear && r.month === selectedMonth
    );
    if (existing) {
      setReport(existing);
    } else {
      setReport({
        year: selectedYear,
        month: selectedMonth,
        targetSales: 0,
        resultSales: 0,
        actions: {
          newCustomer: { target: 0, result: 0, amount: 0 },
          priceUp: { target: 0, result: 0, amount: 0 },
          jp: { target: 0, result: 0, amount: 0 },
          sample: { target: 0, result: 0 },
          monitor: { target: 0, result: 0 },
          expansion: { target: 0, result: 0 },
          repeat: { target: 0, result: 0 },
        },
        afterFollow: { total: 0, done: 0 },
        metCount: 0,
        threeStepSales: { qs: 0, pack: 0, lotion: 0, mo: 0, sp: 0 },
        purchase: 0,
        selfUse: 0
      });
    }
  }, [selectedYear, selectedMonth, monthlyReports]);

  /**
   * 売上データから自動集計
   */
  const autoCalculate = () => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });

    let totalSales = 0;
    let qsCount = 0, packCount = 0, lotionCount = 0, moCount = 0, spCount = 0;

    monthSales.forEach(sale => {
      sale.items.forEach(item => {
        totalSales += item.price * item.quantity;
        if (item.category === 'QS') qsCount += item.quantity;
        if (item.category === 'P') packCount += item.quantity;
        if (item.category === 'L') lotionCount += item.quantity;
        if (item.category === 'MO') moCount += item.quantity;
        if (item.category === 'SP') spCount += item.quantity;
      });
    });

    setReport({
      ...report,
      resultSales: totalSales,
      threeStepSales: { qs: qsCount, pack: packCount, lotion: lotionCount, mo: moCount, sp: spCount }
    });
  };

  /**
   * ランク別集計を計算
   */
  const getRankSummary = () => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
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

    return rankData;
  };

  const rankSummary = getRankSummary();

  const handleSave = () => {
    saveMonthlyReport({
      ...report,
      year: selectedYear,
      month: selectedMonth
    });
  };

  /**
   * PDF出力
   */
  const handlePrint = () => {
    const content = `
      <div class="print-header">
        <h1>月末レポート・気づき（書類1）</h1>
        <div class="subtitle">${selectedYear}年${selectedMonth}月　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>

      <div class="section">
        <div class="section-title">☆今月の目標実売</div>
        <table>
          <tbody>
            <tr>
              <th style="width:80px;">目標</th>
              <td style="width:120px;">¥${(report.targetSales || 0).toLocaleString()}</td>
              <th style="width:80px;">結果</th>
              <td style="width:120px;">¥${(report.resultSales || 0).toLocaleString()}</td>
              <th style="width:80px;">達成率</th>
              <td style="width:80px;">${report.targetSales ? Math.round((report.resultSales / report.targetSales) * 100) : 0}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">☆顧客ランク別集計</div>
        <table>
          <thead>
            <tr>
              <th>総ユーザー数</th>
              <th>Aランク人数</th>
              <th>Aランク売上</th>
              <th>Bランク人数</th>
              <th>Bランク売上</th>
              <th>Cランク人数</th>
              <th>Cランク売上</th>
              <th>Dランク人数</th>
              <th>Dランク売上</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">${customers.length}名</td>
              <td class="text-center">${rankSummary.A.count}名</td>
              <td class="text-right">¥${rankSummary.A.amount.toLocaleString()}</td>
              <td class="text-center">${rankSummary.B.count}名</td>
              <td class="text-right">¥${rankSummary.B.amount.toLocaleString()}</td>
              <td class="text-center">${rankSummary.C.count}名</td>
              <td class="text-right">¥${rankSummary.C.amount.toLocaleString()}</td>
              <td class="text-center">${rankSummary.D.count}名</td>
              <td class="text-right">¥${rankSummary.D.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">※3ステップ実売数</div>
        <table>
          <tbody>
            <tr>
              <th style="width:100px;">QS（せっけん）</th>
              <td style="width:60px;" class="text-center">${report.threeStepSales?.qs || 0}個</td>
              <th style="width:60px;">パック</th>
              <td style="width:60px;" class="text-center">${report.threeStepSales?.pack || 0}本</td>
              <th style="width:80px;">ローション</th>
              <td style="width:60px;" class="text-center">${report.threeStepSales?.lotion || 0}本</td>
              <th style="width:40px;">MO</th>
              <td style="width:60px;" class="text-center">${report.threeStepSales?.mo || 0}本</td>
              <th style="width:40px;">SP</th>
              <td style="width:60px;" class="text-center">${report.threeStepSales?.sp || 0}本</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">☆仕入れ・使用金額</div>
        <table>
          <tbody>
            <tr>
              <th style="width:120px;">仕入れ</th>
              <td style="width:150px;" class="text-right">¥${(report.purchase || 0).toLocaleString()}</td>
              <th style="width:140px;">自分の使用金額</th>
              <td style="width:150px;" class="text-right">¥${(report.selfUse || 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    printDocument(content, '月末レポート', 'portrait');
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>月末レポート・気づき（書類1）</h1>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label>年:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={styles.filterSelect}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}年</option>
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
        <button onClick={autoCalculate} style={styles.autoCalcButton}>
          売上データから自動集計
        </button>
        <button onClick={handlePrint} style={styles.printButton}>
          📄 PDF出力（縦）
        </button>
      </div>

      <div style={styles.reportForm}>
        {/* 目標実売 */}
        <div style={styles.reportSection}>
          <h3 style={styles.reportSectionTitle}>☆今月の目標実売</h3>
          <div style={styles.reportRow}>
            <label>目標:</label>
            <input
              type="number"
              value={report.targetSales}
              onChange={(e) => setReport({...report, targetSales: parseInt(e.target.value) || 0})}
              style={styles.reportInput}
            />
            <span>円</span>
            <label style={{marginLeft: 20}}>結果:</label>
            <input
              type="number"
              value={report.resultSales}
              onChange={(e) => setReport({...report, resultSales: parseInt(e.target.value) || 0})}
              style={styles.reportInput}
            />
            <span>円</span>
          </div>
        </div>

        {/* 3ステップ実売数 */}
        <div style={styles.reportSection}>
          <h3 style={styles.reportSectionTitle}>※3ステップ実売数</h3>
          <div style={{...styles.reportRow, flexWrap: 'wrap', gap: '8px 4px'}}>
            <span>QS</span>
            <input
              type="number"
              value={report.threeStepSales?.qs || 0}
              onChange={(e) => setReport({
                ...report,
                threeStepSales: { ...report.threeStepSales, qs: parseInt(e.target.value) || 0 }
              })}
              style={styles.smallInput}
            />
            <span>個 ／ パック</span>
            <input
              type="number"
              value={report.threeStepSales?.pack || 0}
              onChange={(e) => setReport({
                ...report,
                threeStepSales: { ...report.threeStepSales, pack: parseInt(e.target.value) || 0 }
              })}
              style={styles.smallInput}
            />
            <span>本 ／ ローション</span>
            <input
              type="number"
              value={report.threeStepSales?.lotion || 0}
              onChange={(e) => setReport({
                ...report,
                threeStepSales: { ...report.threeStepSales, lotion: parseInt(e.target.value) || 0 }
              })}
              style={styles.smallInput}
            />
            <span>本 ／ MO</span>
            <input
              type="number"
              value={report.threeStepSales?.mo || 0}
              onChange={(e) => setReport({
                ...report,
                threeStepSales: { ...report.threeStepSales, mo: parseInt(e.target.value) || 0 }
              })}
              style={styles.smallInput}
            />
            <span>本 ／ SP</span>
            <input
              type="number"
              value={report.threeStepSales?.sp || 0}
              onChange={(e) => setReport({
                ...report,
                threeStepSales: { ...report.threeStepSales, sp: parseInt(e.target.value) || 0 }
              })}
              style={styles.smallInput}
            />
            <span>本</span>
          </div>
        </div>

        {/* 仕入れ・使用金額 */}
        <div style={styles.reportSection}>
          <div style={styles.reportRow}>
            <span>仕入れ:</span>
            <input
              type="number"
              value={report.purchase || 0}
              onChange={(e) => setReport({...report, purchase: parseInt(e.target.value) || 0})}
              style={styles.reportInput}
            />
            <span>円</span>
            <span style={{marginLeft: 20}}>自分の使用金額:</span>
            <input
              type="number"
              value={report.selfUse || 0}
              onChange={(e) => setReport({...report, selfUse: parseInt(e.target.value) || 0})}
              style={styles.reportInput}
            />
            <span>円</span>
          </div>
        </div>

        <button onClick={handleSave} style={styles.submitButton}>
          レポートを保存
        </button>
      </div>
    </div>
  );
}

export default MonthlyReport;
