/**
 * データ管理（バックアップ）コンポーネント
 * 化粧品販売管理アプリ - VSCode版
 *
 * JSONバックアップのエクスポート・インポート
 */

import React, { useRef } from 'react';
import { styles } from '../styles/styles';

function BackupManagement({ exportBackup, importBackup }) {
  const fileInputRef = useRef(null);

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
        <h4>💡 バックアップのヒント</h4>
        <ul>
          <li>月末作業後は必ずバックアップを取得してください</li>
          <li>バックアップファイルはクラウドストレージ（Google Drive等）に保存することをお勧めします</li>
          <li>PCの買い替え時は、バックアップファイルを新しいPCで復元できます</li>
        </ul>
      </div>
    </div>
  );
}

export default BackupManagement;
