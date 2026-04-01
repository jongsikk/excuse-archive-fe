import { ApiClient } from '@excuse-archive/shared';

const TOKEN_KEY = 'excuse_archive_token';

export const apiClient = new ApiClient({
  baseURL: '/api',
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  onUnauthorized: () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  },
});
