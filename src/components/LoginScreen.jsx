/**
 * ログイン画面コンポーネント
 * 化粧品販売管理アプリ - サーバー版
 */

import React, { useState } from 'react';
import { styles } from '../styles/styles';

function LoginScreen({ onLogin, api }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitMode, setIsInitMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // ログイン処理
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.login(password);
      onLogin();
    } catch (err) {
      if (err.message.includes('初期設定')) {
        setIsInitMode(true);
        setError('');
      } else {
        setError(err.message || 'ログインに失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 初期パスワード設定
  const handleInitPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('パスワードは4文字以上にしてください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);

    try {
      await api.initPassword(password);
      onLogin();
    } catch (err) {
      setError(err.message || '初期設定に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.header}>
          <h1 style={loginStyles.title}>化粧品販売管理</h1>
          <p style={loginStyles.subtitle}>
            {isInitMode ? '初期パスワードを設定してください' : 'ログイン'}
          </p>
        </div>

        <form onSubmit={isInitMode ? handleInitPassword : handleLogin} style={loginStyles.form}>
          <div style={loginStyles.inputGroup}>
            <label style={loginStyles.label}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              style={loginStyles.input}
              autoFocus
              disabled={isLoading}
            />
          </div>

          {isInitMode && (
            <div style={loginStyles.inputGroup}>
              <label style={loginStyles.label}>パスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力"
                style={loginStyles.input}
                disabled={isLoading}
              />
            </div>
          )}

          {error && (
            <div style={loginStyles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...loginStyles.button,
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : (isInitMode ? '設定して開始' : 'ログイン')}
          </button>
        </form>

        {isInitMode && (
          <button
            onClick={() => {
              setIsInitMode(false);
              setPassword('');
              setConfirmPassword('');
              setError('');
            }}
            style={loginStyles.backButton}
          >
            戻る
          </button>
        )}

        <div style={loginStyles.footer}>
          <p style={loginStyles.footerText}>
            化粧品販売管理アプリ v3.0
          </p>
        </div>
      </div>
    </div>
  );
}

// ログイン画面専用スタイル
const loginStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#4a90a4'
    }
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center'
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4a90a4',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  backButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '12px',
    color: '#999',
    margin: 0
  }
};

export default LoginScreen;
