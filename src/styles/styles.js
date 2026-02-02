/**
 * 共通スタイル定義
 * 化粧品販売管理アプリ - VSCode版
 * 
 * CSS-in-JS形式のスタイルオブジェクト
 */

// カラーパレット
export const COLORS = {
  primary: '#1a1a2e',      // ダークネイビー
  accent: '#e94560',       // ピンク
  success: '#10b981',      // グリーン
  info: '#3b82f6',         // ブルー
  warning: '#f59e0b',      // オレンジ
  danger: '#dc2626',       // レッド
  background: '#f5f5f5',
  white: '#fff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// スタイル定義
export const styles = {
  // レイアウト
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: COLORS.background,
    fontFamily: '"Noto Sans JP", "Hiragino Sans", "Meiryo", sans-serif',
  },

  // サイドバー
  sidebar: {
    width: 220,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px 20px',
    borderBottom: '1px solid #333',
    marginBottom: 20,
  },
  logoIcon: { fontSize: 28, marginRight: 10 },
  logoText: { fontSize: 18, fontWeight: 'bold' },
  nav: { flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: 14,
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: '#16213e',
    color: COLORS.white,
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  navIcon: { marginRight: 10, fontSize: 16 },
  navLabel: { flex: 1 },
  fiscalYear: {
    padding: '15px 20px',
    fontSize: 12,
    color: '#888',
    borderTop: '1px solid #333',
  },

  // メインエリア
  main: { flex: 1, marginLeft: 220, padding: 30 },
  
  // 通知
  notification: {
    position: 'fixed',
    top: 20,
    right: 20,
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 'bold',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },

  // ビューコンテナ
  viewContainer: { maxWidth: 1400, margin: '0 auto' },
  viewTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: COLORS.primary },

  // カードグリッド
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: COLORS.gray[500], marginBottom: 12 },
  cardIcon: { fontSize: 20 },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  cardSub: { fontSize: 13, color: COLORS.gray[400], marginTop: 8 },

  // プログレスバー
  progressBar: { height: 8, backgroundColor: COLORS.gray[200], borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 4, transition: 'width 0.3s ease' },

  // セクション
  section: { backgroundColor: COLORS.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.primary },

  // テーブル
  tableContainer: { overflowX: 'auto' },
  wideTableContainer: { overflowX: 'auto', maxWidth: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { backgroundColor: COLORS.gray[50], padding: '12px 8px', textAlign: 'left', fontWeight: 'bold', borderBottom: `2px solid ${COLORS.gray[200]}`, whiteSpace: 'nowrap' },
  thSub: { backgroundColor: COLORS.gray[50], padding: '8px', textAlign: 'left', fontSize: 11, borderBottom: `2px solid ${COLORS.gray[200]}` },
  td: { padding: '10px 8px', borderBottom: `1px solid ${COLORS.gray[200]}` },
  inlineSelect: { padding: '4px 8px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 4, backgroundColor: COLORS.white, cursor: 'pointer' },

  // ステップインジケーター
  stepIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  step: { display: 'flex', alignItems: 'center', gap: 8, color: '#aaa' },
  stepActive: { color: COLORS.accent, fontWeight: 'bold' },
  stepNumber: { width: 28, height: 28, borderRadius: '50%', backgroundColor: COLORS.gray[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },
  stepLine: { width: 60, height: 2, backgroundColor: COLORS.gray[200], margin: '0 10px' },

  // アップロードセクション
  uploadSection: { textAlign: 'center', maxWidth: 500, margin: '0 auto' },
  uploadArea: { border: `3px dashed ${COLORS.gray[300]}`, borderRadius: 16, padding: 60, cursor: 'pointer', backgroundColor: COLORS.gray[50], transition: 'all 0.2s' },
  uploadIcon: { fontSize: 64, marginBottom: 16 },
  uploadText: { fontSize: 18, color: COLORS.gray[800], marginBottom: 8 },
  uploadSubtext: { fontSize: 14, color: COLORS.gray[400] },
  processing: { textAlign: 'center' },
  spinner: { width: 40, height: 40, border: `4px solid ${COLORS.gray[200]}`, borderTop: `4px solid ${COLORS.accent}`, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' },
  orDivider: { margin: '30px 0', color: COLORS.gray[400], position: 'relative' },
  manualButton: { padding: '12px 32px', backgroundColor: COLORS.white, border: `2px solid ${COLORS.primary}`, borderRadius: 8, color: COLORS.primary, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' },

  // フォーム
  formSection: { backgroundColor: COLORS.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formGrid: { display: 'grid', gap: 30 },
  imagePreview: { backgroundColor: COLORS.gray[50], borderRadius: 8, padding: 16 },
  previewTitle: { fontSize: 14, marginBottom: 12, color: COLORS.gray[500] },
  previewImage: { maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formPanel: { padding: '0 16px' },
  formTitle: { fontSize: 18, marginBottom: 20, color: COLORS.primary },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: COLORS.gray[800] },
  input: { width: '100%', padding: '10px 12px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
  customerInputGroup: { display: 'flex', gap: 10 },
  newCustomerNote: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 },
  newBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
  rankSelect: { padding: '6px 12px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14 },
  itemRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  productSelect: { flex: 1, padding: '10px 12px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14 },
  quantityInput: { width: 60, padding: '10px 8px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14, textAlign: 'center' },
  itemPrice: { width: 80, textAlign: 'right', fontWeight: 'bold' },
  removeButton: { width: 32, height: 32, border: 'none', backgroundColor: '#fee2e2', color: COLORS.danger, borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  addItemButton: { padding: '8px 16px', backgroundColor: '#f0f9ff', border: `1px dashed ${COLORS.info}`, borderRadius: 6, color: COLORS.info, cursor: 'pointer', fontSize: 14 },
  totalSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: `2px solid ${COLORS.gray[200]}`, marginTop: 20 },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  buttonGroup: { display: 'flex', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, padding: '12px 24px', backgroundColor: COLORS.gray[100], border: 'none', borderRadius: 8, color: COLORS.gray[500], fontSize: 16, cursor: 'pointer' },
  submitButton: { flex: 1, padding: '12px 24px', backgroundColor: COLORS.accent, border: 'none', borderRadius: 8, color: COLORS.white, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },

  // 完了セクション
  completionSection: { textAlign: 'center', padding: 60 },
  completionIcon: { fontSize: 64, marginBottom: 20 },
  completionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: COLORS.primary },
  completionText: { color: COLORS.gray[500], marginBottom: 30, lineHeight: 1.8 },

  // フィルターバー
  filterBar: { display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 8 },
  filterSelect: { padding: '8px 12px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14 },
  searchInput: { padding: '8px 12px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14, width: 200 },
  autoCalcButton: { padding: '8px 16px', backgroundColor: COLORS.info, border: 'none', borderRadius: 6, color: COLORS.white, fontSize: 14, cursor: 'pointer' },
  printButton: { padding: '8px 16px', backgroundColor: COLORS.success, border: 'none', borderRadius: 6, color: COLORS.white, fontSize: 14, cursor: 'pointer', marginLeft: 'auto' },

  // プログレスセクション
  progressSection: { backgroundColor: COLORS.white, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 18, fontWeight: 'bold' },
  progressCount: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  largeProgressBar: { height: 20, backgroundColor: COLORS.gray[200], borderRadius: 10, overflow: 'hidden' },
  progressPercent: { textAlign: 'right', marginTop: 8, color: COLORS.gray[500], fontSize: 14 },

  // カウントグリッド
  countGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, backgroundColor: COLORS.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  countCell: { aspectRatio: '1', border: `1px solid ${COLORS.gray[200]}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 10, padding: 4, textAlign: 'center' },
  cellNumber: { fontWeight: 'bold', color: COLORS.gray[400] },
  cellName: { fontSize: 9, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' },

  // レポートフォーム
  reportForm: { backgroundColor: COLORS.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  reportSection: { marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${COLORS.gray[200]}` },
  reportSectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: COLORS.primary },
  reportRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  reportInput: { width: 120, padding: '8px 12px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 6, fontSize: 14 },
  smallInput: { width: 60, padding: '6px 8px', border: `1px solid ${COLORS.gray[300]}`, borderRadius: 4, fontSize: 14, textAlign: 'center' },

  // タブ
  tabs: { display: 'flex', gap: 4, marginBottom: 24 },
  tab: { padding: '12px 24px', border: 'none', backgroundColor: COLORS.gray[200], borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: 14, color: COLORS.gray[500] },
  tabActive: { backgroundColor: COLORS.white, color: COLORS.primary, fontWeight: 'bold' },

  // 追加フォーム
  addForm: { backgroundColor: COLORS.gray[50], borderRadius: 8, padding: 20, marginBottom: 24 },
  addFormRow: { display: 'flex', gap: 12, marginTop: 12 },
  addButton: { padding: '10px 24px', backgroundColor: COLORS.success, border: 'none', borderRadius: 6, color: COLORS.white, fontSize: 14, cursor: 'pointer' },
  csvImport: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 },
  importButton: { padding: '10px 20px', backgroundColor: COLORS.info, border: 'none', borderRadius: 6, color: COLORS.white, fontSize: 14, cursor: 'pointer' },
  csvNote: { fontSize: 12, color: COLORS.gray[400] },
  deleteButton: { padding: '4px 12px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: 4, color: COLORS.danger, fontSize: 12, cursor: 'pointer' },
  note: { color: COLORS.gray[500], marginBottom: 20 },

  // 製品カテゴリ
  productCategory: { marginBottom: 30 },
  productCategoryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: COLORS.primary },

  // バックアップセクション
  backupSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 30 },
  backupCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 30, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  backupIcon: { fontSize: 48, marginBottom: 16 },
  backupNote: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 24 },

  // 製品追加機能用スタイル
  productAddFormRow: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' },
  productFormGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  smallLabel: { fontSize: 12, color: COLORS.gray[500], fontWeight: '500' },
  customCountBadge: { marginLeft: 10, fontSize: 12, backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 10, fontWeight: 'normal' },
  customBadge: { color: COLORS.warning, marginRight: 4 },
  builtInLabel: { fontSize: 11, color: COLORS.gray[400], padding: '2px 6px', backgroundColor: COLORS.gray[100], borderRadius: 3 },

  // 売上履歴機能用スタイル
  editModeBadge: { marginLeft: 12, fontSize: 14, backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 6, fontWeight: 'normal' },
  editModeHeader: { backgroundColor: '#fef3c7', color: '#92400e', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 },
  historySection: { marginTop: 40, backgroundColor: COLORS.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  historySectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, margin: 0 },
  historyCount: { fontSize: 13, color: COLORS.gray[500] },
  actionButtons: { display: 'flex', gap: 8 },
  editButton: { padding: '6px 10px', backgroundColor: '#dbeafe', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  deleteButtonSmall: { padding: '6px 10px', backgroundColor: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  editingRow: { backgroundColor: '#fef9c3' },
  noHistory: { textAlign: 'center', padding: '40px 20px', color: COLORS.gray[400] },
  monthEndSection: { marginTop: 24, padding: 20, backgroundColor: '#fef3c7', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  monthEndWarning: { flex: 1 },
  monthEndNote: { fontSize: 12, color: '#92400e', marginTop: 4 },
  clearHistoryButton: { padding: '12px 24px', backgroundColor: COLORS.warning, border: 'none', borderRadius: 8, color: COLORS.white, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' },

  // ========================================
  // モバイル用スタイル
  // ========================================

  // ハンバーガーボタン
  hamburgerButton: {
    position: 'fixed',
    top: 12,
    left: 12,
    zIndex: 1001,
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    border: 'none',
    borderRadius: 8,
    color: COLORS.white,
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },

  // モバイル用サイドバー（スライドイン）
  sidebarMobile: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '85%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
  },
  sidebarMobileOpen: {
    transform: 'translateX(0)',
  },

  // オーバーレイ
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },

  // モバイル用メインエリア
  mainMobile: {
    flex: 1,
    marginLeft: 0,
    paddingTop: 70,
    padding: '70px 16px 16px 16px',
    minHeight: '100vh',
  },

  // モバイル用ナビアイテム（タッチフレンドリー）
  navItemMobile: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '16px 20px',
    minHeight: 48,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: 16,
    textAlign: 'left',
    transition: 'all 0.2s',
  },

  // モバイル用カードグリッド（1列）
  cardGridMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12,
    marginBottom: 20,
  },

  // モバイル用入力（iOS自動ズーム防止）
  inputMobile: {
    width: '100%',
    padding: '14px 12px',
    border: `1px solid ${COLORS.gray[300]}`,
    borderRadius: 8,
    fontSize: 16,
    boxSizing: 'border-box',
  },

  // モバイル用セレクト
  selectMobile: {
    width: '100%',
    padding: '14px 12px',
    border: `1px solid ${COLORS.gray[300]}`,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: COLORS.white,
    boxSizing: 'border-box',
  },

  // モバイル用ボタン（タッチフレンドリー）
  buttonMobile: {
    minHeight: 48,
    minWidth: 48,
    padding: '14px 20px',
    fontSize: 16,
    borderRadius: 8,
  },

  // カード形式テーブル（モバイル用）
  cardTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardTableItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${COLORS.gray[100]}`,
  },
  cardTableRowLast: {
    borderBottom: 'none',
  },
  cardLabel: {
    fontSize: 13,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 15,
    color: COLORS.gray[800],
    fontWeight: '500',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${COLORS.gray[200]}`,
  },

  // モバイル用商品カード
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  productSelectMobile: {
    width: '100%',
    padding: '14px 12px',
    border: `1px solid ${COLORS.gray[300]}`,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    border: `1px solid ${COLORS.gray[300]}`,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  itemPriceMobile: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  removeButtonMobile: {
    width: '100%',
    padding: '10px',
    marginTop: 12,
    backgroundColor: '#fee2e2',
    border: 'none',
    borderRadius: 8,
    color: COLORS.danger,
    fontSize: 14,
    cursor: 'pointer',
  },
  addItemButtonMobile: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#f0f9ff',
    border: `2px dashed ${COLORS.info}`,
    borderRadius: 12,
    color: COLORS.info,
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: '500',
  },

  // モバイル用アクションボタン
  editButtonMobile: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    border: 'none',
    borderRadius: 8,
    color: COLORS.info,
    fontSize: 14,
    fontWeight: '500',
    cursor: 'pointer',
  },
  deleteButtonMobile: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    border: 'none',
    borderRadius: 8,
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '500',
    cursor: 'pointer',
  },

  // モバイル用ステップインジケーター
  stepIndicatorMobile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  stepMobile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: COLORS.gray[200],
    color: COLORS.gray[500],
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepActiveMobile: {
    backgroundColor: COLORS.accent,
    color: COLORS.white,
  },
  stepLineMobile: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.gray[200],
  },

  // モバイル用フォームセクション
  formSectionMobile: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formGroupMobile: {
    marginBottom: 16,
  },
  labelMobile: {
    display: 'block',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.gray[700],
  },

  // モバイル用合計セクション
  totalSectionMobile: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderTop: `2px solid ${COLORS.gray[200]}`,
    marginTop: 16,
  },
  totalLabelMobile: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  totalAmountMobile: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // モバイル用ボタングループ
  buttonGroupMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
  },
  submitButtonMobile: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: COLORS.accent,
    border: 'none',
    borderRadius: 12,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelButtonMobile: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: COLORS.gray[100],
    border: 'none',
    borderRadius: 12,
    color: COLORS.gray[600],
    fontSize: 16,
    cursor: 'pointer',
  },

  // モバイル用ビュータイトル
  viewTitleMobile: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },

  // モバイル用アップロードエリア
  uploadAreaMobile: {
    border: `3px dashed ${COLORS.gray[300]}`,
    borderRadius: 16,
    padding: 40,
    cursor: 'pointer',
    backgroundColor: COLORS.gray[50],
    textAlign: 'center',
  },
  uploadIconMobile: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadTextMobile: {
    fontSize: 16,
    color: COLORS.gray[800],
    marginBottom: 8,
  },

  // OCR関連スタイル
  ocrConfidenceBar: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  confidenceIndicator: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  confidenceWarning: {
    display: 'block',
    marginTop: 8,
    fontSize: 12,
    color: COLORS.warning,
  },

  // OCR設定セクション
  ocrSettingSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
  },
  ocrSettingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary,
  },
  apiKeyInput: {
    width: '100%',
    padding: '12px',
    border: `1px solid ${COLORS.gray[300]}`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'monospace',
    boxSizing: 'border-box',
  },
  apiKeyNote: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 8,
    lineHeight: 1.5,
  },
  saveApiKeyButton: {
    marginTop: 12,
    padding: '10px 20px',
    backgroundColor: COLORS.success,
    border: 'none',
    borderRadius: 8,
    color: COLORS.white,
    fontSize: 14,
    cursor: 'pointer',
  },
};

export default styles;
