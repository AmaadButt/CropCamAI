export const lightTheme = {
  background: '#101418',
  surface: '#ffffff',
  textPrimary: '#0d0d0d',
  textSecondary: '#4a4a4a',
  accent: '#2f80ed',
  danger: '#eb5757',
  overlayDefault: '#2f80ed'
};

export const darkTheme = {
  background: '#020307',
  surface: '#1a1f24',
  textPrimary: '#f5f7fa',
  textSecondary: '#c1c7cd',
  accent: '#56ccf2',
  danger: '#f2994a',
  overlayDefault: '#56ccf2'
};

export type Theme = typeof lightTheme;

export const themes = {
  light: lightTheme,
  dark: darkTheme
};
