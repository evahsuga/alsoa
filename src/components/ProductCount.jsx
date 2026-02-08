/**
 * 製品別販売積算表コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 書類4: QS・ローションの年間目標管理
 */

import React, { useState } from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { PRODUCT_TARGETS } from '../data/productMaster';
import { printDocument } from '../utils/printDocument';

function ProductCount({ sales }) {
  const [selectedYear, setSelectedYear] = useState(getFiscalYear(new Date()));
  const [selectedCategory, setSelectedCategory] = useState('QS');

  const categories = {
    QS: { name: 'クイーンシルバー（せっけん）', target: PRODUCT_TARGETS.QS },
    L: { name: 'ローション', target: PRODUCT_TARGETS.L }
  };

  /**
   * カテゴリをカウント対象グループにマッピング
   * set3/best4の内訳商品も対象に含める
   */
  const getCategoryCountGroups = (category) => {
    if (!category) return [];
    // QS直接購入
    if (category === 'QS' || category === 'QS(PF') return ['QS'];
    // L直接購入
    if (category === 'LI' || category === 'LII' || category === 'Lｾﾙ' || category === 'L') return ['L'];
    // セット3（QS, L に各+1）
    if (category === 'set3Ⅰ' || category === 'set3Ⅱ' || category === 'set3ｾﾙ') return ['QS', 'L'];
    // ベスト4（QS, L に各+1）
    if (category === 'B4Ⅰ' || category === 'B4Ⅱ' || category === 'B4ｾﾙ') return ['QS', 'L'];
    return [];
  };

  /**
   * カテゴリ別の購入者リストを取得
   */
  const getPurchasers = () => {
    const purchasers = [];
    const yearSales = sales.filter(s => getFiscalYear(new Date(s.date)) === selectedYear);

    yearSales.forEach(sale => {
      sale.items.forEach(item => {
        // 直接購入またはセット商品の内訳としてカウント
        const countGroups = getCategoryCountGroups(item.category);
        if (countGroups.includes(selectedCategory)) {
          for (let i = 0; i < item.quantity; i++) {
            purchasers.push({
              name: sale.customerName,
              date: sale.date,
              product: item.name
            });
          }
        }
      });
    });

    return purchasers;
  };

  const purchasers = getPurchasers();
  const target = categories[selectedCategory]?.target || 100;
  const progress = Math.min(100, (purchasers.length / target) * 100);

  const gridSize = target;
  const grid = Array.from({ length: gridSize }, (_, i) => purchasers[i] || null);

  /**
   * PDF出力
   */
  const handlePrint = () => {
    const gridCells = grid.map((purchaser, index) => `
      <div class="count-cell ${purchaser ? 'filled' : ''}">
        <div class="num">${index + 1}</div>
        ${purchaser ? `<div class="name">${purchaser.name}</div>` : ''}
      </div>
    `).join('');

    const content = `
      <div class="print-header">
        <h1>製品別販売積算表（書類4）</h1>
        <div class="subtitle">${selectedYear}年度（${selectedYear}年3月〜${selectedYear + 1}年2月）　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>
      <div class="section">
        <div class="section-title">${categories[selectedCategory]?.name}</div>
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
    printDocument(content, '製品別販売積算表', 'portrait');
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>製品別販売積算表（書類4）</h1>

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
          <label>製品:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="QS">クイーンシルバー（目標{PRODUCT_TARGETS.QS}個）</option>
            <option value="L">ローション（目標{PRODUCT_TARGETS.L}個）</option>
          </select>
        </div>
        <button onClick={handlePrint} style={styles.printButton}>
          📄 PDF出力（縦）
        </button>
      </div>

      {/* 進捗セクション */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressTitle}>{categories[selectedCategory]?.name}</span>
          <span style={styles.progressCount}>{purchasers.length} / {target}個</span>
        </div>
        <div style={styles.largeProgressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${progress}%`,
            backgroundColor: selectedCategory === 'QS' ? '#10b981' : '#3b82f6'
          }}></div>
        </div>
        <div style={styles.progressPercent}>達成率: {Math.round(progress)}%</div>
      </div>

      {/* カウントグリッド */}
      <div style={styles.countGrid}>
        {grid.map((purchaser, index) => (
          <div
            key={index}
            style={{
              ...styles.countCell,
              backgroundColor: purchaser ? (selectedCategory === 'QS' ? '#dcfce7' : '#dbeafe') : '#f9fafb',
              borderColor: purchaser ? (selectedCategory === 'QS' ? '#10b981' : '#3b82f6') : '#e5e7eb'
            }}
            title={purchaser ? `${purchaser.name} (${purchaser.date})` : ''}
          >
            <span style={styles.cellNumber}>{index + 1}</span>
            {purchaser && (
              <span style={styles.cellName}>{purchaser.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCount;
