/**
 * Nintendo DS inspired memory game theme
 * Retro, vibrant colors with a playful aesthetic
 */

import { Platform } from 'react-native';

// DS-inspired color palette
const DSPurple = '#9B59B6';
const DSOrange = '#FF6B35';
const DSGreen = '#00D95F';
const DSBlue = '#0099FF';
const DSPink = '#FF3B9A';
const DSYellow = '#FFD700';

export const Colors = {
  light: {
    text: '#1a1a1a',
    background: '#f5f5f5',
    tint: DSBlue,
    icon: '#666',
    tabIconDefault: '#999',
    tabIconSelected: DSBlue,
    cardBack: DSPurple,
    cardFront: '#fff',
    success: DSGreen,
    warning: DSOrange,
  },
  dark: {
    text: '#fff',
    background: '#1a1a1a',
    tint: DSBlue,
    icon: '#aaa',
    tabIconDefault: '#777',
    tabIconSelected: DSBlue,
    cardBack: DSPurple,
    cardFront: '#2a2a2a',
    success: DSGreen,
    warning: DSOrange,
  },
};

export const GameColors = {
  cardBg: DSPurple,
  cardHover: '#B776D1',
  matched: DSGreen,
  active: DSBlue,
  accent1: DSOrange,
  accent2: DSPink,
  accent3: DSYellow,
  bg: '#f0e6ff',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
