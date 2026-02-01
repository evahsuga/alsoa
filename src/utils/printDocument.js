/**
 * PDF出力ユーティリティ
 * 化粧品販売管理アプリ - VSCode版
 * 
 * ブラウザの印刷機能を使用してPDF出力を行う
 */

/**
 * 印刷用のスタイル定義
 */
const PRINT_STYLES = `
  @page {
    margin: 15mm;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #333;
  }
  .print-header {
    text-align: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #333;
  }
  .print-header h1 {
    font-size: 16pt;
    margin-bottom: 5px;
  }
  .print-header .subtitle {
    font-size: 10pt;
    color: #666;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
  }
  th, td {
    border: 1px solid #333;
    padding: 4px 6px;
    text-align: left;
  }
  th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  thead {
    display: table-header-group;
  }
  tbody {
    display: table-row-group;
  }
  tr {
    page-break-inside: avoid;
  }
  .section {
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    margin-bottom: 10px;
    padding: 5px;
    background-color: #f5f5f5;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .summary-item {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
  }
  .summary-item .label {
    font-size: 9pt;
    color: #666;
  }
  .summary-item .value {
    font-size: 14pt;
    font-weight: bold;
  }
  .count-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 3px;
  }
  .count-cell {
    border: 1px solid #ccc;
    padding: 3px;
    text-align: center;
    font-size: 7pt;
    min-height: 40px;
  }
  .count-cell.filled {
    background-color: #e8f5e9;
  }
  .count-cell .num {
    font-weight: bold;
    color: #888;
  }
  .count-cell .name {
    font-size: 6pt;
    overflow: hidden;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  @media print {
    body { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    }
  }
`;

/**
 * ドキュメントを印刷用ウィンドウで開いて印刷
 * @param {string} content - HTML内容
 * @param {string} title - ドキュメントタイトル
 * @param {string} orientation - 'portrait' | 'landscape'
 */
export const printDocument = (content, title, orientation = 'portrait') => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('ポップアップがブロックされました。ポップアップを許可してください。');
    return;
  }

  const pageStyle = orientation === 'landscape' 
    ? '@page { size: A4 landscape; margin: 15mm; }'
    : '@page { size: A4 portrait; margin: 15mm; }';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        ${pageStyle}
        ${PRINT_STYLES}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
  };
};

/**
 * 顧客分布リストの印刷用HTMLを生成
 * @param {Object} params - パラメータ
 * @returns {string} HTML文字列
 */
export const generateCustomerListHTML = ({ 
  selectedYear, 
  customers, 
  getCustomerSales, 
  fiscalMonths 
}) => {
  const rows = customers.map((customer, index) => {
    const salesData = getCustomerSales(customer.name);
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${customer.rank}</td>
        <td>${customer.name}</td>
        <td class="text-right">¥${salesData.totalAmount.toLocaleString()}</td>
        <td class="text-right">¥${salesData.monthlyAverage.toLocaleString()}</td>
        <td class="text-center">${salesData.categoryCounts.QS || '-'}</td>
        <td class="text-center">${salesData.categoryCounts.L || '-'}</td>
        <td class="text-center">${salesData.categoryCounts.P || '-'}</td>
        <td class="text-center">${salesData.categoryCounts.ES || '-'}</td>
        ${fiscalMonths.map(m => `<td>${salesData.monthlyPurchases[m]?.join(',') || '-'}</td>`).join('')}
      </tr>
    `;
  }).join('');

  return `
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
          ${fiscalMonths.map(m => `<th style="width:45px;">${m}月</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

/**
 * 製品別販売積算表の印刷用HTMLを生成
 * @param {Object} params - パラメータ
 * @returns {string} HTML文字列
 */
export const generateProductCountHTML = ({ 
  selectedYear, 
  categoryName, 
  target, 
  purchasers, 
  progress 
}) => {
  const gridCells = Array.from({ length: target }, (_, i) => {
    const purchaser = purchasers[i];
    return `
      <div class="count-cell ${purchaser ? 'filled' : ''}">
        <div class="num">${i + 1}</div>
        ${purchaser ? `<div class="name">${purchaser.name}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="print-header">
      <h1>製品別販売積算表（書類4）</h1>
      <div class="subtitle">${selectedYear}年度（${selectedYear}年3月〜${selectedYear + 1}年2月）　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
    </div>
    <div class="section">
      <div class="section-title">${categoryName}</div>
      <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="summary-item">
          <div class="label">目標</div>
          <div class="value">${target}個</div>
        </div>
        <div class="summary-item">
          <div class="label">実績</div>
          <div class="value">${purchasers.length}個</div>
        </div>
        <div class="summary-item">
          <div class="label">達成率</div>
          <div class="value">${Math.round(progress)}%</div>
        </div>
      </div>
    </div>
    <div class="count-grid">
      ${gridCells}
    </div>
  `;
};

/**
 * 年間ABC報告の印刷用HTMLを生成
 * @param {Object} params - パラメータ
 * @returns {string} HTML文字列
 */
export const generateYearlyReportHTML = ({ selectedYear, yearlyData }) => {
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

  return `
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
};
