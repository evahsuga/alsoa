/**
 * 売上伝票入力コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 書類5: 売上伝票の登録・編集・削除機能
 */

import React, { useState, useRef } from 'react';
import { styles } from '../styles/styles';
import { PRODUCT_MASTER } from '../data/productMaster';
import { findProductByCode } from '../utils/productUtils';

function SalesInput({
  customers,
  sales,
  addSale,
  updateSale,
  deleteSale,
  addCustomer,
  customProducts,
  displayCutoff,
  clearSalesHistory
}) {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    items: [{ name: '', quantity: 1, price: 0, code: '', category: 'other' }]
  });
  const [newCustomerMode, setNewCustomerMode] = useState(false);
  const [newCustomerRank, setNewCustomerRank] = useState('C');

  const fileInputRef = useRef(null);

  // 表示対象の売上履歴を取得
  const getDisplaySales = () => {
    if (!displayCutoff) {
      return sales.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sales
      .filter(s => new Date(s.createdAt) >= new Date(displayCutoff))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const displaySales = getDisplaySales();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        processImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setIsProcessing(true);
    // OCR機能は未実装（UIのみ）
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1500);
  };

  const handleProductSelect = (index, productCode) => {
    const product = findProductByCode(productCode, customProducts);
    if (product) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        name: product.name,
        code: product.code,
        price: product.price,
        category: product.category
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0, code: '', category: 'other' }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems.length ? newItems : [{ name: '', quantity: 1, price: 0, code: '', category: 'other' }]
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = () => {
    if (!formData.customerName) {
      alert('顧客名を入力してください');
      return;
    }
    if (formData.items.every(item => !item.name)) {
      alert('商品を1つ以上入力してください');
      return;
    }

    if (newCustomerMode) {
      const existingCustomer = customers.find(c => c.name === formData.customerName);
      if (!existingCustomer) {
        addCustomer({ name: formData.customerName, rank: newCustomerRank });
      }
    }

    if (editMode && editingSaleId) {
      updateSale(editingSaleId, {
        date: formData.date,
        customerName: formData.customerName,
        items: formData.items.filter(item => item.name)
      });
    } else {
      addSale({
        date: formData.date,
        customerName: formData.customerName,
        items: formData.items.filter(item => item.name)
      });
    }

    setStep(3);
  };

  const resetForm = () => {
    setStep(1);
    setUploadedImage(null);
    setEditMode(false);
    setEditingSaleId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      items: [{ name: '', quantity: 1, price: 0, code: '', category: 'other' }]
    });
    setNewCustomerMode(false);
  };

  const handleEditSale = (sale) => {
    setEditMode(true);
    setEditingSaleId(sale.id);
    setFormData({
      date: sale.date,
      customerName: sale.customerName,
      items: sale.items.length > 0 ? sale.items : [{ name: '', quantity: 1, price: 0, code: '', category: 'other' }]
    });
    setNewCustomerMode(false);
    setStep(2);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>
        売上伝票入力
        {editMode && <span style={styles.editModeBadge}>編集モード</span>}
      </h1>

      {/* ステップインジケーター */}
      <div style={styles.stepIndicator}>
        <div style={{...styles.step, ...(step >= 1 ? styles.stepActive : {})}}>
          <span style={styles.stepNumber}>1</span>
          <span>伝票アップロード</span>
        </div>
        <div style={styles.stepLine}></div>
        <div style={{...styles.step, ...(step >= 2 ? styles.stepActive : {})}}>
          <span style={styles.stepNumber}>2</span>
          <span>確認・修正</span>
        </div>
        <div style={styles.stepLine}></div>
        <div style={{...styles.step, ...(step >= 3 ? styles.stepActive : {})}}>
          <span style={styles.stepNumber}>3</span>
          <span>完了</span>
        </div>
      </div>

      {/* ステップ1: アップロード */}
      {step === 1 && (
        <div style={styles.uploadSection}>
          <div
            style={styles.uploadArea}
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <div style={styles.processing}>
                <div style={styles.spinner}></div>
                <p>画像を読み取り中...</p>
              </div>
            ) : (
              <>
                <div style={styles.uploadIcon}>📷</div>
                <p style={styles.uploadText}>クリックして伝票画像をアップロード</p>
                <p style={styles.uploadSubtext}>または画像をドラッグ＆ドロップ</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <div style={styles.orDivider}>
            <span>または</span>
          </div>

          <button
            style={styles.manualButton}
            onClick={() => setStep(2)}
          >
            手動入力で登録する
          </button>
        </div>
      )}

      {/* ステップ2: フォーム入力 */}
      {step === 2 && (
        <div style={styles.formSection}>
          {editMode && (
            <div style={styles.editModeHeader}>
              <span>📝 売上データを編集中（ID: {editingSaleId}）</span>
            </div>
          )}
          <div style={{...styles.formGrid, gridTemplateColumns: uploadedImage ? '1fr 1fr' : '1fr'}}>
            {uploadedImage && (
              <div style={styles.imagePreview}>
                <h3 style={styles.previewTitle}>伝票画像</h3>
                <img src={uploadedImage} alt="伝票" style={styles.previewImage} />
              </div>
            )}

            <div style={styles.formPanel}>
              <h3 style={styles.formTitle}>{editMode ? '売上データ編集' : '伝票内容'}</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>日付</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>顧客名</label>
                <div style={styles.customerInputGroup}>
                  <input
                    type="text"
                    list="customer-list"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({...formData, customerName: e.target.value});
                      const existing = customers.find(c => c.name === e.target.value);
                      setNewCustomerMode(!existing && e.target.value.length > 0);
                    }}
                    placeholder="顧客名を入力"
                    style={styles.input}
                  />
                  <datalist id="customer-list">
                    {customers.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
                {newCustomerMode && (
                  <div style={styles.newCustomerNote}>
                    <span style={styles.newBadge}>新規顧客</span>
                    <select
                      value={newCustomerRank}
                      onChange={(e) => setNewCustomerRank(e.target.value)}
                      style={styles.rankSelect}
                    >
                      <option value="A">Aランク</option>
                      <option value="B">Bランク</option>
                      <option value="C">Cランク</option>
                      <option value="D">Dランク</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>商品明細</label>
                {formData.items.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <select
                      value={item.code}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      style={styles.productSelect}
                    >
                      <option value="">商品を選択...</option>
                      {Object.entries(PRODUCT_MASTER).map(([key, category]) => {
                        const builtInProducts = category.products;
                        const customProds = customProducts[key] || [];
                        const allProducts = [...builtInProducts, ...customProds];

                        return (
                          <optgroup key={key} label={category.name}>
                            {allProducts.map(product => (
                              <option key={product.code + (product.isCustom ? '_c' : '')} value={product.code}>
                                {product.isCustom ? '★ ' : ''}{product.name} (¥{product.price.toLocaleString()})
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = parseInt(e.target.value) || 1;
                        setFormData({...formData, items: newItems});
                      }}
                      style={styles.quantityInput}
                    />
                    <span style={styles.itemPrice}>
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      style={styles.removeButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={addItem} style={styles.addItemButton}>
                  ＋ 商品を追加
                </button>
              </div>

              <div style={styles.totalSection}>
                <span>合計金額（税抜）</span>
                <span style={styles.totalAmount}>¥{calculateTotal().toLocaleString()}</span>
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={resetForm} style={styles.cancelButton}>
                  キャンセル
                </button>
                <button onClick={handleSubmit} style={styles.submitButton}>
                  {editMode ? '更新する' : '登録する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ステップ3: 完了 */}
      {step === 3 && (
        <div style={styles.completionSection}>
          <div style={styles.completionIcon}>✅</div>
          <h2 style={styles.completionTitle}>{editMode ? '更新完了' : '登録完了'}</h2>
          <p style={styles.completionText}>
            {editMode ? '売上データが更新されました。' : '売上伝票が登録されました。'}<br />
            お客様分布リスト・製品別販売積算表に反映されています。
          </p>
          <button onClick={resetForm} style={styles.submitButton}>
            続けて入力する
          </button>
        </div>
      )}

      {/* 売上履歴セクション */}
      <div style={styles.historySection}>
        <div style={styles.historyHeader}>
          <h2 style={styles.historySectionTitle}>📋 直近の売上履歴</h2>
          <span style={styles.historyCount}>
            表示件数: {displaySales.length}件
            {displayCutoff && ` （${new Date(displayCutoff).toLocaleDateString('ja-JP')}以降）`}
          </span>
        </div>

        {displaySales.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>日付</th>
                  <th style={styles.th}>顧客名</th>
                  <th style={styles.th}>商品</th>
                  <th style={styles.th}>金額</th>
                  <th style={{...styles.th, width: 100}}>操作</th>
                </tr>
              </thead>
              <tbody>
                {displaySales.map(sale => (
                  <tr key={sale.id} style={editingSaleId === sale.id ? styles.editingRow : {}}>
                    <td style={styles.td}>{formatDate(sale.date)}</td>
                    <td style={styles.td}>{sale.customerName}</td>
                    <td style={{...styles.td, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {sale.items.map((item, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {item.name}{item.quantity > 1 ? `×${item.quantity}` : ''}
                        </span>
                      ))}
                    </td>
                    <td style={styles.td}>
                      ¥{sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleEditSale(sale)}
                          style={styles.editButton}
                          title="編集"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteSale(sale.id)}
                          style={styles.deleteButtonSmall}
                          title="削除"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.noHistory}>
            <p>履歴データがありません</p>
          </div>
        )}

        {/* 月末処理セクション */}
        <div style={styles.monthEndSection}>
          <div style={styles.monthEndWarning}>
            <h4>⚠️ 月末処理</h4>
            <p>翌月の入力を始める前に「翌月更新」を押してください</p>
            <p style={styles.monthEndNote}>※売上データは削除されません。履歴表示のみクリアされます</p>
          </div>
          <button onClick={clearSalesHistory} style={styles.clearHistoryButton}>
            🔄 翌月更新（履歴をクリア）
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesInput;
