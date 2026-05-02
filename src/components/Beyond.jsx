import React, { useState } from 'react';
import { styles } from '../styles/styles';
import { getFiscalYear } from '../utils/productUtils';
import { FISCAL_MONTHS } from '../data/productMaster';
import { printDocument } from '../utils/printDocument';

// 月別カラーマップ（会計年度: 3月〜2月）
const MONTH_COLORS = {
  3:  '#86efac', // 3月  萌黄
  4:  '#34d399', // 4月  エメラルド
  5:  '#67e8f9', // 5月  水色
  6:  '#60a5fa', // 6月  ブルー
  7:  '#a78bfa', // 7月  ラベンダー
  8:  '#f472b6', // 8月  ピンク
  9:  '#fb923c', // 9月  オレンジ
  10: '#fbbf24', // 10月 アンバー
  11: '#e879f9', // 11月 パープル
  12: '#f87171', // 12月 レッド
  1:  '#94a3b8', // 1月  スレート
  2:  '#fde68a', // 2月  イエロー
};

const BEYOND_TARGETS = {
  QS: 120,
  P:  60,
  L:  210,
  MO: 90,
  SP: 60,
};

function Beyond({ monthlyReports }) {
  const [selectedYear, setSelectedYear] = useState(getFiscalYear(new Date()));
  const [selectedCategory, setSelectedCategory] = useState('QS');

  const categories = {
    QS: { name: 'クイーンシルバー（せっけん）', target: BEYOND_TARGETS.QS, color: '#10b981', key: 'qs' },
    P:  { name: 'パック',                       target: BEYOND_TARGETS.P,  color: '#8b5cf6', key: 'pack' },
    L:  { name: 'ローション',                   target: BEYOND_TARGETS.L,  color: '#3b82f6', key: 'lotion' },
    MO: { name: 'メイクオフ',                   target: BEYOND_TARGETS.MO, color: '#f59e0b', key: 'mo' },
    SP: { name: '下地SP',                       target: BEYOND_TARGETS.SP, color: '#ec4899', key: 'sp' },
  };

  /**
   * 選択カテゴリの仕入れ実績ユニット一覧を生成
   * 月次レポートの purchaseCount から集計し、月名付きで返す
   */
  const getPurchaseUnits = () => {
    const units = [];
    const catKey = categories[selectedCategory].key;

    FISCAL_MONTHS.forEach(month => {
      const year = month >= 3 ? selectedYear : selectedYear + 1;
      const report = monthlyReports.find(r => r.year === year && r.month === month);
      const count = report?.purchaseCount?.[catKey] || 0;
      for (let i = 0; i < count; i++) {
        units.push({ month });
      }
    });

    return units;
  };

  const units = getPurchaseUnits();
  const target = categories[selectedCategory].target;
  const progress = (units.length / target) * 100;
  const isCompleted = units.length >= target;

  const gridSize = Math.max(target, units.length);
  const grid = Array.from({ length: gridSize }, (_, i) => units[i] || null);

  const handlePrint = () => {
    const gridCells = grid.map((unit, index) => {
      const isOverTarget = index >= target;
      const monthColor = unit ? MONTH_COLORS[unit.month] : '';
      const cellStyle = unit
        ? (isOverTarget
          ? 'background-color:#fef3c7;border:2px solid #f59e0b;'
          : `background-color:${monthColor}60;border:2px solid ${monthColor};`)
        : '';
      return `
        <div class="count-cell ${unit ? 'filled' : ''}" style="${cellStyle}">
          <div class="num">${index + 1}</div>
          ${unit ? `<div class="name">${unit.month}月</div>` : ''}
        </div>
      `;
    }).join('');

    const content = `
      <div class="print-header">
        <h1>Beyond（書類7）</h1>
        <div class="subtitle">${selectedYear}年度（${selectedYear}年3月〜${selectedYear + 1}年2月）　出力日: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>
      <div class="section">
        <div class="section-title">${categories[selectedCategory].name}${isCompleted ? ' 🎉 目標達成！' : ''}</div>
        <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="summary-item"><div class="label">目標</div><div class="value">${target}個</div></div>
          <div class="summary-item"><div class="label">実績</div><div class="value">${units.length}個</div></div>
          <div class="summary-item">
            <div class="label">達成率</div>
            <div class="value" style="${isCompleted ? 'color:#10b981;' : ''}">${Math.round(progress)}%</div>
          </div>
        </div>
      </div>
      <div class="count-grid">${gridCells}</div>
    `;
    printDocument(content, 'Beyond', 'portrait');
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>Beyond（書類7）</h1>

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
            <option value="QS">クイーンシルバー（目標{BEYOND_TARGETS.QS}個）</option>
            <option value="P">パック（目標{BEYOND_TARGETS.P}個）</option>
            <option value="L">ローション（目標{BEYOND_TARGETS.L}個）</option>
            <option value="MO">メイクオフ（目標{BEYOND_TARGETS.MO}個）</option>
            <option value="SP">下地SP（目標{BEYOND_TARGETS.SP}個）</option>
          </select>
        </div>
        <button onClick={handlePrint} style={styles.printButton}>
          📄 PDF出力（縦）
        </button>
      </div>

      {/* 進捗セクション */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressTitle}>{categories[selectedCategory].name}</span>
          <span style={styles.progressCount}>{units.length} / {target}個</span>
        </div>
        <div style={styles.largeProgressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${Math.min(100, progress)}%`,
            backgroundColor: categories[selectedCategory].color
          }} />
        </div>
        <div style={{
          ...styles.progressPercent,
          color: isCompleted ? '#10b981' : undefined,
          fontWeight: isCompleted ? 'bold' : undefined
        }}>
          達成率: {Math.round(progress)}%{isCompleted && ' 🎉 目標達成！'}
        </div>
      </div>

      {/* 月別カラー凡例 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 4px' }}>
        {FISCAL_MONTHS.map(month => (
          <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3,
              backgroundColor: MONTH_COLORS[month],
              border: `1px solid ${MONTH_COLORS[month]}`
            }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{month}月</span>
          </div>
        ))}
      </div>

      {/* カウントグリッド */}
      <div style={styles.countGrid}>
        {grid.map((unit, index) => {
          const isOverTarget = index >= target;
          const monthColor = unit ? MONTH_COLORS[unit.month] : null;
          return (
            <div
              key={index}
              style={{
                ...styles.countCell,
                backgroundColor: unit
                  ? (isOverTarget ? '#fef3c7' : `${monthColor}60`)
                  : '#f9fafb',
                borderColor: unit
                  ? (isOverTarget ? '#f59e0b' : monthColor)
                  : '#e5e7eb',
                borderWidth: isOverTarget && unit ? 2 : 1,
              }}
            >
              <span style={styles.cellNumber}>{index + 1}</span>
              {unit && (
                <span style={styles.cellName}>{unit.month}月</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Beyond;
