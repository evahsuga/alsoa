/**
 * マスタ管理コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 顧客マスタ・製品マスタの管理
 */

import React, { useState, useRef } from 'react';
import { styles } from '../styles/styles';
import { PRODUCT_MASTER, CATEGORY_ABBREV } from '../data/productMaster';

function MasterManagement({
  customers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  importCustomersFile,
  customProducts,
  addCustomProduct,
  deleteCustomProduct
}) {
  const [activeTab, setActiveTab] = useState('customers');
  const [newCustomer, setNewCustomer] = useState({ name: '', rank: 'C' });
  const [newProduct, setNewProduct] = useState({
    categoryKey: 'skincare',
    code: '',
    name: '',
    price: '',
    category: 'other'
  });
  const fileInputRef = useRef(null);

  // カテゴリ別の略称選択肢
  const categoryAbbrevOptions = {
    skincare: ['QS', 'L', 'P', 'ES', 'other'],
    baseMakeup: ['SP', 'MO', 'other'],
    hairBodyCare: ['other'],
    healthcare: ['酵素', 'other'],
    pointMakeup: ['色', 'MO', 'other'],
    other: ['other']
  };

  /**
   * 顧客追加
   */
  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      alert('顧客名を入力してください');
      return;
    }
    addCustomer(newCustomer);
    setNewCustomer({ name: '', rank: 'C' });
  };

  /**
   * ファイルアップロード（顧客インポート）
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      importCustomersFile(file);
    }
  };

  /**
   * 製品追加
   */
  const handleAddProduct = () => {
    if (!newProduct.code) {
      alert('商品コードを入力してください');
      return;
    }
    if (!newProduct.name) {
      alert('商品名を入力してください');
      return;
    }
    if (!newProduct.price || isNaN(parseInt(newProduct.price))) {
      alert('価格を正しく入力してください');
      return;
    }

    const success = addCustomProduct(newProduct.categoryKey, {
      code: newProduct.code,
      name: newProduct.name,
      price: parseInt(newProduct.price),
      category: newProduct.category
    });

    if (success) {
      setNewProduct({
        categoryKey: newProduct.categoryKey,
        code: '',
        name: '',
        price: '',
        category: 'other'
      });
    }
  };

  /**
   * カテゴリ変更時の処理
   */
  const handleCategoryKeyChange = (categoryKey) => {
    const options = categoryAbbrevOptions[categoryKey] || ['other'];
    const defaultCategory = options[options.length - 1];
    setNewProduct({
      ...newProduct,
      categoryKey,
      category: defaultCategory
    });
  };

  /**
   * 組み込み製品とカスタム製品を統合
   */
  const getCombinedProducts = (categoryKey) => {
    const builtIn = PRODUCT_MASTER[categoryKey]?.products.map(p => ({ ...p, isCustom: false })) || [];
    const custom = customProducts[categoryKey]?.map(p => ({ ...p, isCustom: true })) || [];
    return [...builtIn, ...custom];
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>マスタ管理</h1>

      {/* タブ */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'customers' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('customers')}
        >
          顧客マスタ
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'products' ? styles.tabActive : {})}}
          onClick={() => setActiveTab('products')}
        >
          製品マスタ
        </button>
      </div>

      {/* 顧客マスタ */}
      {activeTab === 'customers' && (
        <div>
          <div style={styles.addForm}>
            <h3>顧客追加</h3>
            <div style={styles.addFormRow}>
              <input
                type="text"
                placeholder="顧客名"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                style={styles.input}
              />
              <select
                value={newCustomer.rank}
                onChange={(e) => setNewCustomer({...newCustomer, rank: e.target.value})}
                style={styles.rankSelect}
              >
                <option value="A">Aランク</option>
                <option value="B">Bランク</option>
                <option value="C">Cランク</option>
                <option value="D">Dランク</option>
              </select>
              <button onClick={handleAddCustomer} style={styles.addButton}>追加</button>
            </div>
            <div style={styles.csvImport}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.importButton}
              >
                Excel/CSVインポート
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <span style={styles.csvNote}>形式: 1列目=顧客名, 2列目=ランク（A/B/C/D）</span>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>顧客名</th>
                  <th style={styles.th}>ランク</th>
                  <th style={styles.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{customer.name}</td>
                    <td style={styles.td}>
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
                    <td style={styles.td}>
                      <button
                        onClick={() => deleteCustomer(customer.id)}
                        style={styles.deleteButton}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 製品マスタ */}
      {activeTab === 'products' && (
        <div>
          <div style={styles.addForm}>
            <h3>製品追加</h3>
            <div style={styles.productAddFormRow}>
              <div style={styles.productFormGroup}>
                <label style={styles.smallLabel}>カテゴリ</label>
                <select
                  value={newProduct.categoryKey}
                  onChange={(e) => handleCategoryKeyChange(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="skincare">スキンケア</option>
                  <option value="baseMakeup">ベースメイクアップ</option>
                  <option value="hairBodyCare">ヘアケア&ボディケア</option>
                  <option value="healthcare">ヘルスケア</option>
                  <option value="pointMakeup">ポイントメイクアップ</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div style={styles.productFormGroup}>
                <label style={styles.smallLabel}>商品コード</label>
                <input
                  type="text"
                  placeholder="例: 999001"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                  style={{...styles.input, width: 120}}
                />
              </div>
              <div style={styles.productFormGroup}>
                <label style={styles.smallLabel}>価格（税抜）</label>
                <input
                  type="number"
                  placeholder="例: 5000"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  style={{...styles.input, width: 100}}
                />
              </div>
            </div>
            <div style={{...styles.productAddFormRow, marginTop: 10}}>
              <div style={{...styles.productFormGroup, flex: 1}}>
                <label style={styles.smallLabel}>商品名</label>
                <input
                  type="text"
                  placeholder="商品名を入力"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.productFormGroup}>
                <label style={styles.smallLabel}>略称</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  style={styles.filterSelect}
                >
                  {categoryAbbrevOptions[newProduct.categoryKey]?.map(abbrev => (
                    <option key={abbrev} value={abbrev}>
                      {CATEGORY_ABBREV[abbrev] || abbrev}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{...styles.productFormGroup, alignSelf: 'flex-end'}}>
                <button onClick={handleAddProduct} style={styles.addButton}>追加</button>
              </div>
            </div>
          </div>

          {/* カテゴリ別製品一覧 */}
          {Object.entries(PRODUCT_MASTER).map(([key, category]) => {
            const combinedProducts = getCombinedProducts(key);
            const customCount = customProducts[key]?.length || 0;

            return (
              <div key={key} style={styles.productCategory}>
                <h3 style={styles.productCategoryTitle}>
                  {category.name}（税率{category.taxRate}%）
                  {customCount > 0 && (
                    <span style={styles.customCountBadge}>+{customCount}件追加</span>
                  )}
                </h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>商品コード</th>
                        <th style={styles.th}>商品名</th>
                        <th style={styles.th}>価格</th>
                        <th style={styles.th}>略称</th>
                        <th style={{...styles.th, width: 60}}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedProducts.map(product => (
                        <tr key={product.code + (product.isCustom ? '_custom' : '')}>
                          <td style={styles.td}>{product.code}</td>
                          <td style={styles.td}>
                            {product.isCustom && <span style={styles.customBadge}>★</span>}
                            {product.name}
                          </td>
                          <td style={styles.td}>¥{product.price.toLocaleString()}</td>
                          <td style={styles.td}>{CATEGORY_ABBREV[product.category] || product.category}</td>
                          <td style={styles.td}>
                            {product.isCustom ? (
                              <button
                                onClick={() => deleteCustomProduct(key, product.id)}
                                style={styles.deleteButton}
                              >
                                削除
                              </button>
                            ) : (
                              <span style={styles.builtInLabel}>組込</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MasterManagement;
