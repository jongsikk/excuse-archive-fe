import type { ViewStyle } from 'react-native';
import { useThemeStore } from '../store/themeStore';

// MD3 "Reflective Editorial" — sage/muted organic palette
const LIGHT = {
  // Surface layers (no-line rule: depth via background tiers)
  bg: '#f7f9fe',               // surface / background
  card: '#ffffff',             // surface-container-lowest (cards float here)
  section: '#f0f4fa',          // surface-container-low
  container: '#e9eef6',        // surface-container
  containerHigh: '#e3e9f1',    // surface-container-high

  // Primary (Sage Green)
  accent: '#2e6863',           // primary
  accentFill: '#b3eee7',       // primary-container
  accentMuted: '#cce8e4',      // secondary-container
  onAccent: '#e1fffb',         // on-primary

  // Text
  textPrimary: '#2c333a',      // on-surface
  textSecondary: '#586068',    // on-surface-variant
  textMuted: '#747b84',        // outline

  // Outline / dividers (use sparingly — ghost only)
  outline: '#747b84',
  outlineVariant: '#abb3bc',

  // Semantic
  error: '#a83836',
  heatmapEmpty: '#dce3ed',     // surface-container-highest

  // Gradient stops for CTA
  gradientStart: '#2e6863',
  gradientEnd: '#76AFA9',

  // Streak banner (warm peach)
  streakBg1: '#fdf2e9',
  streakBg2: '#fae5d3',
  streakLabel: '#935b3e',
  streakNumber: '#784628',
} as const;

// MD3 Dark — tonal inverses
const DARK = {
  bg: '#0e1514',
  card: '#192120',
  section: '#1e2726',
  container: '#242e2c',
  containerHigh: '#2a3432',

  accent: '#76AFA9',
  accentFill: '#004039',
  accentMuted: '#1a3d3a',
  onAccent: '#003732',

  textPrimary: '#dce4e2',
  textSecondary: '#a0afac',
  textMuted: '#6a8480',

  outline: '#6a8480',
  outlineVariant: '#3a4745',

  error: '#ffb4ab',
  heatmapEmpty: '#1e2726',

  gradientStart: '#004039',
  gradientEnd: '#76AFA9',

  streakBg1: '#2a1f14',
  streakBg2: '#3a2418',
  streakLabel: '#c8956b',
  streakNumber: '#e8a870',
} as const;

export type ThemeColors = {
  bg: string; card: string; section: string; container: string; containerHigh: string;
  accent: string; accentFill: string; accentMuted: string; onAccent: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  outline: string; outlineVariant: string;
  error: string; heatmapEmpty: string;
  gradientStart: string; gradientEnd: string;
  streakBg1: string; streakBg2: string; streakLabel: string; streakNumber: string;
  // 그림자 — ambient shadow: on_surface(#2c333a) 6% opacity
  shadowSm: ViewStyle;
  shadowMd: ViewStyle;
};

export function useTheme(): ThemeColors & { isDark: boolean; toggleTheme: () => Promise<void> } {
  const { isDark, toggleTheme } = useThemeStore();
  const palette = isDark ? DARK : LIGHT;

  const shadowSm: ViewStyle = isDark
    ? { elevation: 2 }
    : {
        shadowColor: '#2c333a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      };

  const shadowMd: ViewStyle = isDark
    ? { elevation: 3 }
    : {
        shadowColor: '#2c333a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 3,
      };

  return { ...palette, shadowSm, shadowMd, isDark, toggleTheme };
}
