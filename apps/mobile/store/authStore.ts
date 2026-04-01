import { create } from 'zustand';
import { apiClient, loadStoredToken } from '../lib/api';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'excuse_archive_token';
const EXTERNAL_ID_KEY = 'excuse_archive_external_id';

interface AuthState {
  token: string | null;
  externalId: string | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  externalId: null,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    const savedToken = await loadStoredToken();
    const savedExternalId = await SecureStore.getItemAsync(EXTERNAL_ID_KEY);
    if (savedToken) {
      set({ token: savedToken, externalId: savedExternalId });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login({ email, password });
      await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
      await SecureStore.setItemAsync(EXTERNAL_ID_KEY, response.externalId);
      set({ token: response.accessToken, externalId: response.externalId, isLoading: false });
    } catch {
      set({ error: '이메일 또는 비밀번호가 올바르지 않습니다.', isLoading: false });
      throw new Error('로그인 실패');
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.register({ email, password, displayName });
      await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
      await SecureStore.setItemAsync(EXTERNAL_ID_KEY, response.externalId);
      set({ token: response.accessToken, externalId: response.externalId, isLoading: false });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        '회원가입에 실패했습니다.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(EXTERNAL_ID_KEY);
    set({ token: null, externalId: null });
  },
}));
