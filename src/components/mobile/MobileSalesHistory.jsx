/**
 * モバイル用売上履歴コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * カード形式の売上履歴表示
 */

import React from 'react';
import { styles, COLORS } from '../../styles/styles';

/**
 * 日付をフォーマット
 */
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 合計金額を計算
 */
const calculateTotal = (sale) => {
  return sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

function MobileSalesHistory({ sales, onEdit, onDelete, editingSaleId }) {
  if (sales.length === 0) {
    return (
      <div style={styles.noHistory}>
        <p>まだ売上履歴がありません</p>
      </div>
    );
  }

  return (
    <div style={styles.cardTable}>
      {sales.map(sale => (
        <div
          key={sale.id}
          style={{
            ...styles.cardTableItem,
            ...(editingSaleId === sale.id ? { backgroundColor: '#fef9c3', borderLeft: `4px solid ${COLORS.warning}` } : {})
          }}
        >
          {/* 日付と顧客名 */}
          <div style={{
            ...styles.cardTableRow,
            paddingBottom: 12,
            marginBottom: 8
          }}>
            <div>
              <span style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: COLORS.primary
              }}>
                {formatDate(sale.date)}
              </span>
              <span style={{
                marginLeft: 12,
                fontSize: 15,
                color: COLORS.gray[800]
              }}>
                {sale.customerName}
              </span>
            </div>
            {editingSaleId === sale.id && (
              <span style={{
                fontSize: 11,
                backgroundColor: COLORS.warning,
                color: COLORS.white,
                padding: '2px 8px',
                borderRadius: 4
              }}>
                編集中
              </span>
            )}
          </div>

          {/* 商品リスト */}
          <div style={{ marginBottom: 12 }}>
            {sale.items.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: COLORS.gray[600],
                padding: '4px 0'
              }}>
                <span style={{ flex: 1 }}>{item.name}</span>
                <span style={{ marginLeft: 8 }}>×{item.quantity}</span>
                <span style={{ marginLeft: 8, minWidth: 70, textAlign: 'right' }}>
                  ¥{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* 合計金額 */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingTop: 8,
            borderTop: `1px solid ${COLORS.gray[200]}`
          }}>
            <span style={{ fontSize: 13, color: COLORS.gray[500], marginRight: 8 }}>合計</span>
            <span style={styles.cardAmount}>
              ¥{calculateTotal(sale).toLocaleString()}
            </span>
          </div>

          {/* アクションボタン */}
          <div style={styles.cardActions}>
            <button
              type="button"
              onClick={() => onEdit(sale)}
              style={styles.editButtonMobile}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => onDelete(sale.id)}
              style={styles.deleteButtonMobile}
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MobileSalesHistory;
