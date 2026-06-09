import { config as defaultConfig } from '@gluestack-ui/config';
import { createConfig } from '@gluestack-ui/themed';

// DS-inspired color palette
const colors = {
  primary: '#0099FF',
  secondary: '#9B59B6',
  success: '#00D95F',
  warning: '#FF6B35',
  danger: '#FF3B9A',
  accent: '#FFD700',
  light: '#f0e6ff',
  dark: '#1a1a1a',
};

export const config = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      danger: colors.danger,
      accent: colors.accent,
    },
  },
  components: {
    ...defaultConfig.components,
  },
});

export type Config = typeof config;

declare module '@gluestack-ui/themed' {
  interface UIConfig extends Config {}
}
