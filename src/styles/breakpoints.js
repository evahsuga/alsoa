/**
 * ブレークポイント定義
 * 化粧品販売管理アプリ - VSCode版
 */

// ブレークポイント値（px）
export const BREAKPOINTS = {
  mobile: 480,    // スマートフォン
  tablet: 768,    // タブレット
  desktop: 1024,  // デスクトップ
  wide: 1280      // ワイド画面
};

// 判定ヘルパー関数
export const isMobile = () => window.innerWidth <= BREAKPOINTS.tablet;
export const isTablet = () => window.innerWidth > BREAKPOINTS.mobile && window.innerWidth <= BREAKPOINTS.tablet;
export const isDesktop = () => window.innerWidth > BREAKPOINTS.tablet;
