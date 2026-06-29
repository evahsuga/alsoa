/**
 * モバイル用商品選択コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * カード形式のタッチフレンドリーなUI
 */

import React from 'react';
import { styles, COLORS } from '../../styles/styles';
import { PRODUCT_MASTER } from '../../data/productMaster';
import { findProductByCode } from '../../utils/productUtils';

// カテゴリ一覧（製品マスタの大分類）
const categoryOptions = Object.entries(PRODUCT_MASTER).map(
  ([key, category]) => ({ key, name: category.name })
);

function MobileProductSelector({
  items,
  customProducts,
  onProductSelect,
  onCategorySelect,
  onQuantityChange,
  onRemove,
  onAdd
}) {
  // 指定カテゴリの商品一覧（組み込み＋カスタム）
  const getProductsForCategory = (categoryKey) => {
    if (!categoryKey) return [];
    const builtIn = PRODUCT_MASTER[categoryKey]?.products || [];
    const custom = customProducts[categoryKey] || [];
    return [...builtIn, ...custom];
  };

  // アイテムの現在のカテゴリキーを取得（明示選択優先・なければ商品コードから逆引き）
  const getItemCategoryKey = (item) => {
    if (item.categoryKey) return item.categoryKey;
    if (item.code) {
      const found = findProductByCode(item.code, customProducts);
      if (found) return found.categoryKey;
    }
    return '';
  };

  return (
    <div style={styles.cardTable}>
      {items.map((item, index) => {
        const itemCategoryKey = getItemCategoryKey(item);
        return (
        <div key={index} style={styles.productCard}>
          {/* カテゴリ選択 */}
          <select
            value={itemCategoryKey}
            onChange={(e) => onCategorySelect(index, e.target.value)}
            style={styles.productSelectMobile}
          >
            <option value="">カテゴリを選択...</option>
            {categoryOptions.map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>

          {/* 商品選択（選択中カテゴリのみ表示） */}
          <select
            value={item.code}
            onChange={(e) => onProductSelect(index, e.target.value)}
            style={styles.productSelectMobile}
            disabled={!itemCategoryKey}
          >
            <option value="">
              {itemCategoryKey ? '商品を選択...' : '先にカテゴリを選択'}
            </option>
            {getProductsForCategory(itemCategoryKey).map(product => (
              <option
                key={product.code + (product.isCustom ? '_c' : '')}
                value={product.code}
              >
                {product.isCustom ? '★ ' : ''}{product.name} (¥{product.price.toLocaleString()})
              </option>
            ))}
          </select>

          {/* 数量と金額 */}
          {item.name && (
            <>
              <div style={styles.quantityRow}>
                <button
                  type="button"
                  onClick={() => onQuantityChange(index, Math.max(1, item.quantity - 1))}
                  style={styles.quantityButton}
                >
                  −
                </button>
                <span style={styles.quantityDisplay}>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(index, item.quantity + 1)}
                  style={styles.quantityButton}
                >
                  +
                </button>
                <span style={styles.itemPriceMobile}>
                  ¥{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>

              {/* 削除ボタン */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                style={styles.removeButtonMobile}
              >
                この商品を削除
              </button>
            </>
          )}
        </div>
        );
      })}

      {/* 商品追加ボタン */}
      <button
        type="button"
        onClick={onAdd}
        style={styles.addItemButtonMobile}
      >
        + 商品を追加
      </button>
    </div>
  );
}

export default MobileProductSelector;
