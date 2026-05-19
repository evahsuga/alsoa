/**
 * ブレークポイント定義
 * 化粧品販売管理アプリ - VSCode版
 */

// ブレークポイント値（px）
export const BREAKPOINTS = {
  mobile: 480,    // スマートフォン
  tablet: 1024,   // タブレット（iPad横持ち1024pxを含む）
  desktop: 1280,  // デスクトップ
  wide: 1440      // ワイド画面
};

// 判定ヘルパー関数
export const isMobile = () => window.innerWidth <= BREAKPOINTS.tablet;
export const isTablet = () => window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
export const isDesktop = () => window.innerWidth > BREAKPOINTS.tablet;
