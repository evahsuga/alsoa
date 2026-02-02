/**
 * データ管理（バックアップ）コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * JSONバックアップのエクスポート・インポート
 */

import React, { useRef, useState, useEffect } from 'react';
import { styles, COLORS } from '../styles/styles';
import { getApiKey, setApiKey, clearApiKey, hasApiKey } from '../services/ocrService';

function BackupManagement({ exportBackup, importBackup }) {
  const fileInputRef = useRef(null);

  // OCR設定用ステート
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // 初期化時にAPIキーの状態を確認
  useEffect(() => {
    setIsApiKeySet(hasApiKey());
    const key = getApiKey();
    if (key) {
      setApiKeyInput(key);
    }
  }, []);

  /**
   * APIキーを保存
   */
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setIsApiKeySet(true);
      alert('APIキーを保存しました');
    } else {
      alert('APIキーを入力してください');
    }
  };

  /**
   * APIキーを削除
   */
  const handleClearApiKey = () => {
    if (window.confirm('APIキーを削除しますか？\n伝票の自動読み取り機能が使えなくなります。')) {
      clearApiKey();
      setApiKeyInput('');
      setIsApiKeySet(false);
    }
  };

  /**
   * ファイルアップロード（バックアップ復元）
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (window.confirm('現在のデータを上書きしてバックアップを復元しますか？')) {
        importBackup(file);
      }
    }
    // ファイル選択をリセット
    e.target.value = '';
  };

  return (
    <div style={styles.viewContainer}>
      <h1 style={styles.viewTitle}>データ管理</h1>

      <div style={styles.backupSection}>
        {/* バックアップ作成 */}
        <div style={styles.backupCard}>
          <div style={styles.backupIcon}>💾</div>
          <h3>バックアップ作成</h3>
          <p>現在のデータをJSONファイルとしてダウンロードします。</p>
          <button onClick={exportBackup} style={styles.submitButton}>
            バックアップをダウンロード
          </button>
        </div>

        {/* バックアップ復元 */}
        <div style={styles.backupCard}>
          <div style={styles.backupIcon}>📂</div>
          <h3>バックアップ復元</h3>
          <p>保存したJSONファイルからデータを復元します。</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={styles.importButton}
          >
            ファイルを選択して復元
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* バックアップのヒント */}
      <div style={styles.backupNote}>
        <h4>バックアップのヒント</h4>
        <ul>
          <li>月末作業後は必ずバックアップを取得してください</li>
          <li>バックアップファイルはクラウドストレージ（Google Drive等）に保存することをお勧めします</li>
          <li>PCの買い替え時は、バックアップファイルを新しいPCで復元できます</li>
        </ul>
      </div>

      {/* OCR設定セクション */}
      <div style={styles.ocrSettingSection}>
        <h3 style={styles.ocrSettingTitle}>
          伝票自動読み取り設定（OCR）
          {isApiKeySet && (
            <span style={{
              marginLeft: 12,
              fontSize: 12,
              backgroundColor: COLORS.success,
              color: COLORS.white,
              padding: '2px 8px',
              borderRadius: 4
            }}>
              設定済み
            </span>
          )}
        </h3>

        <p style={{ fontSize: 14, color: COLORS.gray[600], marginBottom: 16 }}>
          写真から伝票を自動読み取りするには、Google Cloud Vision APIキーが必要です。
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>APIキー</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIza..."
              style={{ ...styles.apiKeyInput, flex: 1 }}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: '12px',
                border: `1px solid ${COLORS.gray[300]}`,
                borderRadius: 8,
                backgroundColor: COLORS.white,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              {showApiKey ? '隠す' : '表示'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={handleSaveApiKey} style={styles.saveApiKeyButton}>
            APIキーを保存
          </button>
          {isApiKeySet && (
            <button
              onClick={handleClearApiKey}
              style={{
                padding: '10px 20px',
                backgroundColor: '#fee2e2',
                border: 'none',
                borderRadius: 8,
                color: COLORS.danger,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              APIキーを削除
            </button>
          )}
        </div>

        <div style={styles.apiKeyNote}>
          <p><strong>APIキーの取得方法:</strong></p>
          <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Google Cloud Consoleにアクセス</li>
            <li>プロジェクトを作成または選択</li>
            <li>「Cloud Vision API」を有効化</li>
            <li>「認証情報」からAPIキーを作成</li>
          </ol>
          <p style={{ marginTop: 8 }}>
            ※月間1,000回まで無料で使用できます
          </p>
        </div>
      </div>
    </div>
  );
}

export default BackupManagement;
