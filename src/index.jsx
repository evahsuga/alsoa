/**
 * エントリーポイント
 * 化粧品販売管理アプリ
 *
 * LocalStorage版: import App from './App';
 * サーバー版:     import App from './App.server';
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
