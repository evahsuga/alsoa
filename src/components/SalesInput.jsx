/**
 * 売上伝票入力コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * 書類5: 売上伝票の登録・編集・削除機能
 */

import React, { useState, useRef } from 'react';
import { styles, COLORS } from '../styles/styles';
import { PRODUCT_MASTER } from '../data/productMaster';
import { findProductByCode } from '../utils/productUtils';
import { useMediaQuery } from '../hooks/useMediaQuery';
import MobileProductSelector from './mobile/MobileProductSelector';
import MobileSalesHistory from './mobile/MobileSalesHistory';
import { processImageOCR, hasApiKey, getOCRErrorMessage } from '../services/ocrService';
import { parseSlipData } from '../services/slipParser';

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
  // モバイル検出
  const { isMobile } = useMediaQuery();

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

  // OCR関連ステート
  const [ocrError, setOcrError] = useState(null);
  const [ocrConfidence, setOcrConfidence] = useState(0);

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
    setOcrError(null);
    setOcrConfidence(0);

    // APIキーが設定されているか確認
    if (!hasApiKey()) {
      setIsProcessing(false);
      setOcrError('APIキーが設定されていません。データ管理画面でGoogle Vision APIキーを設定してください。');
      // 手動入力モードへ移行
      setStep(2);
      return;
    }

    try {
      // OCR処理
      const ocrResult = await processImageOCR(imageData);

      // 伝票データをパース
      const parsedSlip = parseSlipData(ocrResult, customProducts);
      setOcrConfidence(parsedSlip.confidence);

      // フォームに自動入力
      setFormData({
        date: parsedSlip.date || new Date().toISOString().split('T')[0],
        customerName: parsedSlip.customerName || '',
        items: parsedSlip.items.length > 0
          ? parsedSlip.items.map(item => ({
              name: item.name,
              code: item.code,
              price: item.price,
              quantity: item.quantity,
              category: item.category
            }))
          : [{ name: '', quantity: 1, price: 0, code: '', category: 'other' }]
      });

      // 新規顧客チェック
      if (parsedSlip.customerName) {
        const existingCustomer = customers.find(c => c.name === parsedSlip.customerName);
        setNewCustomerMode(!existingCustomer);
      }

      setStep(2);
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrError(getOCRErrorMessage(error));
      // エラー時も手動入力モードへ移行
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
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
    setOcrError(null);
    setOcrConfidence(0);
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

  /**
   * 数量変更（モバイル用）
   */
  const handleQuantityChange = (index, newQuantity) => {
    const newItems = [...formData.items];
    newItems[index].quantity = Math.max(1, newQuantity);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={isMobile ? styles.viewTitleMobile : styles.viewTitle}>
        売上伝票入力
        {editMode && <span style={styles.editModeBadge}>編集中</span>}
      </h1>

      {/* ステップインジケーター */}
      {isMobile ? (
        <div style={styles.stepIndicatorMobile}>
          <div style={{
            ...styles.stepMobile,
            ...(step >= 1 ? styles.stepActiveMobile : {})
          }}>1</div>
          <div style={styles.stepLineMobile}></div>
          <div style={{
            ...styles.stepMobile,
            ...(step >= 2 ? styles.stepActiveMobile : {})
          }}>2</div>
          <div style={styles.stepLineMobile}></div>
          <div style={{
            ...styles.stepMobile,
            ...(step >= 3 ? styles.stepActiveMobile : {})
          }}>3</div>
        </div>
      ) : (
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
      )}

      {/* ステップ1: アップロード */}
      {step === 1 && (
        <div style={styles.uploadSection}>
          <div
            style={isMobile ? styles.uploadAreaMobile : styles.uploadArea}
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <div style={styles.processing}>
                <div style={styles.spinner}></div>
                <p>画像を読み取り中...</p>
              </div>
            ) : (
              <>
                <div style={isMobile ? styles.uploadIconMobile : styles.uploadIcon}>📷</div>
                <p style={isMobile ? styles.uploadTextMobile : styles.uploadText}>
                  {isMobile ? 'タップして写真を撮影' : 'クリックして伝票画像をアップロード'}
                </p>
                <p style={styles.uploadSubtext}>
                  {isMobile ? 'または画像を選択' : 'または画像をドラッグ＆ドロップ'}
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture={isMobile ? "environment" : undefined}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <div style={styles.orDivider}>
            <span>または</span>
          </div>

          <button
            style={{
              ...styles.manualButton,
              ...(isMobile ? { width: '100%', padding: '16px 32px' } : {})
            }}
            onClick={() => setStep(2)}
          >
            手動入力で登録する
          </button>
        </div>
      )}

      {/* ステップ2: フォーム入力 */}
      {step === 2 && (
        <div style={isMobile ? styles.formSectionMobile : styles.formSection}>
          {editMode && (
            <div style={styles.editModeHeader}>
              <span>売上データを編集中</span>
            </div>
          )}

          {/* OCRエラー表示 */}
          {ocrError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              color: COLORS.danger,
              fontSize: 14
            }}>
              <strong>読み取りエラー:</strong> {ocrError}
            </div>
          )}

          {/* OCR精度表示 */}
          {ocrConfidence > 0 && !editMode && (
            <div style={styles.ocrConfidenceBar}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: COLORS.gray[700] }}>
                  読み取り精度: {Math.round(ocrConfidence * 100)}%
                </span>
                {ocrConfidence < 0.7 && (
                  <span style={{
                    fontSize: 12,
                    color: COLORS.warning,
                    backgroundColor: '#fef3c7',
                    padding: '2px 8px',
                    borderRadius: 4
                  }}>
                    要確認
                  </span>
                )}
              </div>
              <div style={styles.confidenceIndicator}>
                <div style={{
                  ...styles.confidenceFill,
                  width: `${ocrConfidence * 100}%`,
                  backgroundColor: ocrConfidence > 0.8 ? COLORS.success :
                                  ocrConfidence > 0.5 ? COLORS.warning : COLORS.danger
                }} />
              </div>
              {ocrConfidence < 0.7 && (
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginTop: 8, marginBottom: 0 }}>
                  読み取り精度が低いため、内容をご確認ください
                </p>
              )}
            </div>
          )}

          {/* 画像プレビュー（デスクトップのみ） */}
          {!isMobile && uploadedImage && (
            <div style={styles.imagePreview}>
              <h3 style={styles.previewTitle}>伝票画像</h3>
              <img src={uploadedImage} alt="伝票" style={styles.previewImage} />
            </div>
          )}

          <div style={isMobile ? {} : styles.formPanel}>
            <h3 style={styles.formTitle}>{editMode ? '売上データ編集' : '伝票内容'}</h3>

            {/* 日付 */}
            <div style={isMobile ? styles.formGroupMobile : styles.formGroup}>
              <label style={isMobile ? styles.labelMobile : styles.label}>日付</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={isMobile ? styles.inputMobile : styles.input}
              />
            </div>

            {/* 顧客名 */}
            <div style={isMobile ? styles.formGroupMobile : styles.formGroup}>
              <label style={isMobile ? styles.labelMobile : styles.label}>顧客名</label>
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
                style={isMobile ? styles.inputMobile : styles.input}
              />
              <datalist id="customer-list">
                {customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              {newCustomerMode && (
                <div style={{...styles.newCustomerNote, marginTop: 8}}>
                  <span style={styles.newBadge}>新規顧客</span>
                  <select
                    value={newCustomerRank}
                    onChange={(e) => setNewCustomerRank(e.target.value)}
                    style={isMobile ? styles.selectMobile : styles.rankSelect}
                  >
                    <option value="A">Aランク</option>
                    <option value="B">Bランク</option>
                    <option value="C">Cランク</option>
                    <option value="D">Dランク</option>
                  </select>
                </div>
              )}
            </div>

            {/* 商品明細 */}
            <div style={isMobile ? styles.formGroupMobile : styles.formGroup}>
              <label style={isMobile ? styles.labelMobile : styles.label}>商品明細</label>

              {isMobile ? (
                <MobileProductSelector
                  items={formData.items}
                  customProducts={customProducts}
                  onProductSelect={handleProductSelect}
                  onQuantityChange={handleQuantityChange}
                  onRemove={removeItem}
                  onAdd={addItem}
                />
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* 合計金額 */}
            <div style={isMobile ? styles.totalSectionMobile : styles.totalSection}>
              <span style={isMobile ? styles.totalLabelMobile : undefined}>合計金額（税抜）</span>
              <span style={isMobile ? styles.totalAmountMobile : styles.totalAmount}>
                ¥{calculateTotal().toLocaleString()}
              </span>
            </div>

            {/* ボタン */}
            <div style={isMobile ? styles.buttonGroupMobile : styles.buttonGroup}>
              {isMobile ? (
                <>
                  <button onClick={handleSubmit} style={styles.submitButtonMobile}>
                    {editMode ? '更新する' : '登録する'}
                  </button>
                  <button onClick={resetForm} style={styles.cancelButtonMobile}>
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button onClick={resetForm} style={styles.cancelButton}>
                    キャンセル
                  </button>
                  <button onClick={handleSubmit} style={styles.submitButton}>
                    {editMode ? '更新する' : '登録する'}
                  </button>
                </>
              )}
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
      <div style={{
        ...styles.historySection,
        ...(isMobile ? { marginTop: 24, padding: 16 } : {})
      }}>
        <div style={{
          ...styles.historyHeader,
          ...(isMobile ? { flexDirection: 'column', alignItems: 'flex-start', gap: 8 } : {})
        }}>
          <h2 style={{
            ...styles.historySectionTitle,
            ...(isMobile ? { fontSize: 16 } : {})
          }}>直近の売上履歴</h2>
          <span style={styles.historyCount}>
            {displaySales.length}件
            {displayCutoff && ` （${new Date(displayCutoff).toLocaleDateString('ja-JP')}〜）`}
          </span>
        </div>

        {/* モバイル: カード形式 / デスクトップ: テーブル形式 */}
        {isMobile ? (
          <MobileSalesHistory
            sales={displaySales}
            onEdit={handleEditSale}
            onDelete={deleteSale}
            editingSaleId={editingSaleId}
          />
        ) : (
          displaySales.length > 0 ? (
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
          )
        )}

        {/* 月末処理セクション */}
        <div style={{
          ...styles.monthEndSection,
          ...(isMobile ? { flexDirection: 'column', alignItems: 'stretch', textAlign: 'center' } : {})
        }}>
          <div style={styles.monthEndWarning}>
            <h4 style={{ margin: '0 0 8px 0' }}>月末処理</h4>
            <p style={{ margin: 0 }}>翌月の入力を始める前に「翌月更新」を押してください</p>
            <p style={{...styles.monthEndNote, margin: '4px 0 0 0'}}>※売上データは削除されません</p>
          </div>
          <button
            onClick={clearSalesHistory}
            style={{
              ...styles.clearHistoryButton,
              ...(isMobile ? { marginTop: 16, width: '100%' } : {})
            }}
          >
            翌月更新
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesInput;
