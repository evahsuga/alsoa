import React from 'react';
import ReactDOM from 'react-dom/client';

// REACT_APP_USE_SERVER=true のビルドはサーバー版（エックスサーバー用）
const App = process.env.REACT_APP_USE_SERVER === 'true'
  ? require('./App.server').default
  : require('./App').default;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
