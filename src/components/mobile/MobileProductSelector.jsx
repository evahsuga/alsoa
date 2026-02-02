/**
 * モバイル用商品選択コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * カード形式のタッチフレンドリーなUI
 */

import React from 'react';
import { styles, COLORS } from '../../styles/styles';
import { PRODUCT_MASTER } from '../../data/productMaster';

function MobileProductSelector({
  items,
  customProducts,
  onProductSelect,
  onQuantityChange,
  onRemove,
  onAdd
}) {
  return (
    <div style={styles.cardTable}>
      {items.map((item, index) => (
        <div key={index} style={styles.productCard}>
          {/* 商品選択 */}
          <select
            value={item.code}
            onChange={(e) => onProductSelect(index, e.target.value)}
            style={styles.productSelectMobile}
          >
            <option value="">商品を選択...</option>
            {Object.entries(PRODUCT_MASTER).map(([key, category]) => {
              const builtInProducts = category.products;
              const customProds = customProducts[key] || [];
              const allProducts = [...builtInProducts, ...customProds];

              return (
                <optgroup key={key} label={category.name}>
                  {allProducts.map(product => (
                    <option
                      key={product.code + (product.isCustom ? '_c' : '')}
                      value={product.code}
                    >
                      {product.isCustom ? '★ ' : ''}{product.name} (¥{product.price.toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              );
            })}
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
      ))}

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
