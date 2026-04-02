import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'excuse_archive_theme';

interface ThemeState {
  isDark: boolean;
  initialized: boolean;
  initializeTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,
  initialized: false,

  initializeTheme: async () => {
    const saved = await SecureStore.getItemAsync(THEME_KEY);
    set({ isDark: saved !== 'light', initialized: true });
  },

  toggleTheme: async () => {
    const next = !get().isDark;
    set({ isDark: next });
    await SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
  },
}));
