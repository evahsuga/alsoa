/**
 * 画面サイズ検出カスタムフック
 * 化粧品販売管理アプリ - VSCode版
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../styles/breakpoints';

/**
 * 画面サイズに応じたモバイル判定を提供
 * @returns {{ isMobile: boolean, isTablet: boolean, windowWidth: number }}
 */
export const useMediaQuery = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // リサイズイベントを監視
    window.addEventListener('resize', handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile: windowWidth <= BREAKPOINTS.tablet,
    isTablet: windowWidth > BREAKPOINTS.mobile && windowWidth <= BREAKPOINTS.tablet,
    isDesktop: windowWidth > BREAKPOINTS.tablet,
    windowWidth
  };
};

export default useMediaQuery;
