/**
 * 通知カスタムフック
 * 化粧品販売管理アプリ - VSCode版
 */

import { useState, useCallback } from 'react';

/**
 * 通知を管理するカスタムフック
 * @param {number} duration - 通知表示時間（ミリ秒）
 * @returns {Object} notification, showNotification, hideNotification
 */
export const useNotification = (duration = 3000) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, [duration]);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};

export default useNotification;
