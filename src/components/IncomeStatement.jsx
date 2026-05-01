import React, { useState } from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { FISCAL_MONTHS } from '../data/productMaster';
import { printDocument } from '../utils/printDocument';

function IncomeStatement({ monthlyReports, saveMonthlyReport }) {
  const [selectedYear, setSelectedYear] = useState(getFiscalYear(new Date()));

  const getReport = (month) => {
    const year = month >= 3 ? selectedYear : selectedYear + 1;
    return monthlyReports.find(r => r.year === year && r.month === month) || {};
  };

  const calc = (month) => {
    const r = getReport(month);
    const sales      = r.resultSales     || 0;  // ①
    const selfUse    = r.selfUse         || 0;  // ②
    const totalSales = sales + selfUse;          // ③
    const purchase   = r.purchaseInvoice || 0;  // ④
    const grossProfit = totalSales - purchase;   // ⑤
    const bonus      = r.salesBonus      || 0;  // ⑥
    const totalProfit = grossProfit + bonus;     // ⑦
    const expenses   = r.expenses        || 0;  // ⑧
    const netIncome  = totalProfit - expenses;  // ⑨
    const inventory  = r.inventory       || 0;  // 在庫
    return { sales, selfUse, totalSales, purchase, grossProfit, bonus, totalProfit, expenses, netIncome, inventory };
  };

  const handleFieldChange = (month, field, rawValue) => {
    const year = month >= 3 ? selectedYear : selectedYear + 1;
    const existing = monthlyReports.find(r => r.year === year && r.month === month) || {
      year, month,
      targetSales: 0, resultSales: 0,
      actions: {
        newCustomer: { target: 0, result: 0, amount: 0 },
        priceUp:     { target: 0, result: 0, amount: 0 },
        jp:          { target: 0, result: 0, amount: 0 },
        sample:      { target: 0, result: 0 },
        monitor:     { target: 0, result: 0 },
        expansion:   { target: 0, result: 0 },
        repeat:      { target: 0, result: 0 },
      },
      afterFollow: { total: 0, done: 0 },
      metCount: 0,
      threeStepSales: { qs: 0, pack: 0, lotion: 0, mo: 0, sp: 0 },
      purchase: 0, purchaseInvoice: 0, salesBonus: 0, selfUse: 0,
      expenses: 0, inventory: 0,
    };
    saveMonthlyReport({ ...existing, [field]: parseInt(rawValue) || 0 });
  };

  const totals = FISCAL_MONTHS.reduce((acc, month) => {
    const c = calc(month);
    return {
      sales:       acc.sales       + c.sales,
      selfUse:     acc.selfUse     + c.selfUse,
      totalSales:  acc.totalSales  + c.totalSales,
      purchase:    acc.purchase    + c.purchase,
      grossProfit: acc.grossProfit + c.grossProfit,
      bonus:       acc.bonus       + c.bonus,
      totalProfit: acc.totalProfit + c.totalProfit,
      expenses:    acc.expenses    + c.expenses,
      netIncome:   acc.netIncome   + c.netIncome,
    };
  }, { sales:0, selfUse:0, totalSales:0, purchase:0, grossProfit:0, bonus:0, totalProfit:0, expenses:0, netIncome:0 });

  const fmt = (v) => (v ? v.toLocaleString() : '');

  const rows = [
    { num: '①', label: '売上高',                        key: 'sales' },
    { num: '②', label: '自家消費',                       key: 'selfUse' },
    { num: '③', label: '売上合計金額\n①+②',              key: 'totalSales',  highlight: true },
    { num: '④', label: '仕入金額\n(商品お買上高)',          key: 'purchase' },
    { num: '⑤', label: '売上利益\n③-④',                  key: 'grossProfit', highlight: true },
    { num: '⑥', label: '販売奨励金',                      key: 'bonus' },
    { num: '⑦', label: '売上総利益\n⑤+⑥',                key: 'totalProfit', highlight: true },
    { num: '⑧', label: '経費合計\n(販促品+現金購入)',       key: 'expenses',    editable: true, dbKey: 'expenses' },
    { num: '⑨', label: '所得金額\n⑦-⑧',                  key: 'netIncome',   highlight: true },
    { num: '',  label: '在庫金額',                        key: 'inventory',   editable: true, dbKey: 'inventory', noTotal: true },
  ];

  const handlePrint = () => {
    const headerCells = FISCAL_MONTHS.map(m => `<th>${m}月</th>`).join('');
    const bodyRows = rows.map(row => {
      const cells = FISCAL_MONTHS.map(month => {
        const val = calc(month)[row.key];
        return `<td class="text-right">${fmt(val)}</td>`;
      }).join('');
      const total = row.noTotal ? '' : fmt(totals[row.key]);
      const labelHtml = row.label.replace('\n', '<br>');
      return `
        <tr style="${row.highlight ? 'background:#f0fdf4;font-weight:bold;' : ''}">
          <td class="text-center" style="color:#6b7280;font-size:11px;">${row.num}</td>
          <td style="font-size:12px;">${labelHtml}</td>
          ${cells}
          <td class="text-right" style="background:#bfdbfe;font-weight:bold;">${total}</td>
        </tr>`;
    }).join('');

    const content = `
      <div class="print-header">
        <h1>収支計算書（書類6）</h1>
        <div class="subtitle">${selectedYear}年度（${selectedYear}年3月〜${selectedYear + 1}年2月）　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>
      <div class="section">
        <table>
          <thead>
            <tr>
              <th style="width:28px;"></th>
              <th style="width:120px;text-align:left;">項目</th>
              ${headerCells}
              <th style="background:#bfdbfe;">年間合計</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
    printDocument(content, '収支計算書', 'landscape');
  };

  const thSt = (extra = {}) => ({
    border: '1px solid #d1d5db',
    padding: '8px 6px',
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontSize: 13,
    ...extra,
  });

  const tdSt = (extra = {}) => ({
    border: '1px solid #d1d5db',
    padding: '4px 8px',
    fontSize: 13,
    ...extra,
  });

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>収支計算書（書類6）</h1>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label>年度:</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            style={styles.filterSelect}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
        </div>
        <button onClick={handlePrint} style={styles.printButton}>
          📄 PDF出力（横）
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={thSt({ width: 32 })}></th>
              <th style={thSt({ width: 130, textAlign: 'left' })}>項目</th>
              {FISCAL_MONTHS.map(m => (
                <th key={m} style={thSt({ minWidth: 76 })}>{m}月</th>
              ))}
              <th style={thSt({ minWidth: 90, backgroundColor: '#bfdbfe' })}>年間合計</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} style={{ backgroundColor: row.highlight ? '#f0fdf4' : undefined }}>
                <td style={tdSt({ textAlign: 'center', color: '#6b7280', fontSize: 12 })}>{row.num}</td>
                <td style={tdSt({ whiteSpace: 'pre-line', fontWeight: row.highlight ? 'bold' : 'normal', lineHeight: 1.5 })}>
                  {row.label}
                </td>
                {FISCAL_MONTHS.map(month => {
                  const val = calc(month)[row.key];
                  if (row.editable) {
                    return (
                      <td key={month} style={tdSt({ padding: '2px 4px' })}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={val ? val.toLocaleString() : ''}
                          placeholder=""
                          onChange={e => handleFieldChange(month, row.dbKey, e.target.value.replace(/,/g, ''))}
                          style={{
                            width: '100%',
                            border: '1px solid #d1d5db',
                            borderRadius: 3,
                            padding: '2px 4px',
                            textAlign: 'right',
                            fontSize: 13,
                            boxSizing: 'border-box',
                            backgroundColor: '#fffbeb',
                          }}
                        />
                      </td>
                    );
                  }
                  return (
                    <td key={month} style={tdSt({
                      textAlign: 'right',
                      fontWeight: row.highlight ? 'bold' : 'normal',
                      color: row.key === 'netIncome' && val < 0 ? '#ef4444' : undefined,
                    })}>
                      {fmt(val)}
                    </td>
                  );
                })}
                <td style={tdSt({
                  textAlign: 'right',
                  backgroundColor: '#bfdbfe',
                  fontWeight: 'bold',
                  color: row.key === 'netIncome' && totals[row.key] < 0 ? '#ef4444' : undefined,
                })}>
                  {row.noTotal ? '' : fmt(totals[row.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncomeStatement;
