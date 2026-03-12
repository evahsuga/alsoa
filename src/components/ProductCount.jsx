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
    QS: { name: 'クイーンシルバー（せっけん）', target: PRODUCT_TARGETS.QS, color: '#10b981' },
    P: { name: 'パック', target: PRODUCT_TARGETS.P, color: '#8b5cf6' },
    L: { name: 'ローション', target: PRODUCT_TARGETS.L, color: '#3b82f6' },
    MO: { name: 'メイクオフ', target: PRODUCT_TARGETS.MO, color: '#f59e0b' },
    SP: { name: '下地SP', target: PRODUCT_TARGETS.SP, color: '#ec4899' },
    MP: { name: '下地MP', target: PRODUCT_TARGETS.MP, color: '#06b6d4' }
  };

  /**
   * カテゴリをカウント対象グループにマッピング
   * set3/best4の内訳商品も対象に含める
   *
   * 計上ルール:
   * - QS: 'QS', 'QS(PF' で始まるカテゴリ + セット商品
   * - P: 'P' + セット商品
   * - L: 'LI', 'LII', 'Lｾﾙ' + セット商品
   * - MO: 'MO' + B4系セット商品
   * - SP: '下地SP'
   * - MP: '下地MP'
   */
  const getCategoryCountGroups = (category) => {
    if (!category) return [];
    // QS直接購入（'QS' または 'QS(' で始まるカテゴリ）
    if (category === 'QS' || category.startsWith('QS(')) return ['QS'];
    // P直接購入（パック）
    if (category === 'P') return ['P'];
    // L直接購入（ローション: LI, LII, Lｾﾙ）
    if (category === 'LI' || category === 'LII' || category === 'Lｾﾙ') return ['L'];
    // MO直接購入（メイクオフ）
    if (category === 'MO') return ['MO'];
    // SP直接購入（下地SP）
    if (category === '下地SP') return ['SP'];
    // MP直接購入（下地MP）
    if (category === '下地MP') return ['MP'];
    // セット3（QS, P, L に各+1）
    if (category === 'set3Ⅰ' || category === 'set3Ⅱ' || category === 'set3ｾﾙ') return ['QS', 'P', 'L'];
    // ベスト4（QS, P, L, MO に各+1）
    if (category === 'B4Ⅰ' || category === 'B4Ⅱ' || category === 'B4ｾﾙ') return ['QS', 'P', 'L', 'MO'];
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
  const progress = (purchasers.length / target) * 100;
  const isCompleted = purchasers.length >= target;

  // 目標超過時は実績数分のグリッドを表示
  const gridSize = Math.max(target, purchasers.length);
  const grid = Array.from({ length: gridSize }, (_, i) => purchasers[i] || null);

  /**
   * PDF出力
   */
  const handlePrint = () => {
    const gridCells = grid.map((purchaser, index) => {
      const isOverTarget = index >= target;
      return `
        <div class="count-cell ${purchaser ? 'filled' : ''}" style="${isOverTarget && purchaser ? 'background-color:#fef3c7;border:2px solid #f59e0b;' : ''}">
          <div class="num">${index + 1}</div>
          ${purchaser ? `<div class="name">${purchaser.name}</div>` : ''}
        </div>
      `;
    }).join('');

    const content = `
      <div class="print-header">
        <h1>製品別販売積算表（書類4）</h1>
        <div class="subtitle">${selectedYear}年度（${selectedYear}年3月〜${selectedYear + 1}年2月）　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>
      <div class="section">
        <div class="section-title">${categories[selectedCategory]?.name}${isCompleted ? ' 🎉 目標達成！' : ''}</div>
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
            <div class="value" style="${isCompleted ? 'color:#10b981;' : ''}">${Math.round(progress)}%</div>
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
            <option value="P">パック（目標{PRODUCT_TARGETS.P}個）</option>
            <option value="L">ローション（目標{PRODUCT_TARGETS.L}個）</option>
            <option value="MO">メイクオフ（目標{PRODUCT_TARGETS.MO}個）</option>
            <option value="SP">下地SP（目標{PRODUCT_TARGETS.SP}個）</option>
            <option value="MP">下地MP（目標{PRODUCT_TARGETS.MP}個）</option>
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
            width: `${Math.min(100, progress)}%`,
            backgroundColor: categories[selectedCategory]?.color || '#3b82f6'
          }}></div>
        </div>
        <div style={{
          ...styles.progressPercent,
          color: isCompleted ? '#10b981' : undefined,
          fontWeight: isCompleted ? 'bold' : undefined
        }}>
          達成率: {Math.round(progress)}%{isCompleted && ' 🎉 目標達成！'}
        </div>
      </div>

      {/* カウントグリッド */}
      <div style={styles.countGrid}>
        {grid.map((purchaser, index) => {
          const categoryColor = categories[selectedCategory]?.color || '#3b82f6';
          const isOverTarget = index >= target;
          return (
            <div
              key={index}
              style={{
                ...styles.countCell,
                backgroundColor: purchaser
                  ? (isOverTarget ? '#fef3c7' : `${categoryColor}20`)
                  : '#f9fafb',
                borderColor: purchaser
                  ? (isOverTarget ? '#f59e0b' : categoryColor)
                  : '#e5e7eb',
                borderWidth: isOverTarget && purchaser ? 2 : 1
              }}
              title={purchaser ? `${purchaser.name} (${purchaser.date})` : ''}
            >
              <span style={styles.cellNumber}>{index + 1}</span>
              {purchaser && (
                <span style={styles.cellName}>{purchaser.name}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductCount;
