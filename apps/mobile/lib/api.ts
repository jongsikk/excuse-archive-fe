import { ApiClient } from '@excuse-archive/shared';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'excuse_archive_token';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

let tokenCache: string | null = null;

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  getToken: () => tokenCache,
  setToken: async (token) => {
    tokenCache = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  clearToken: async () => {
    tokenCache = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  onUnauthorized: () => {
    // 토큰 무효화 시 처리 (앱에서는 별도 네비게이션 처리 필요)
  },
});

export async function loadStoredToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    tokenCache = token;
    return token;
  } catch {
    return null;
  }
}
