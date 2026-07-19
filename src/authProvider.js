import { ADMIN_API, TOKEN_KEY } from './constants.js';
import { httpClient } from './httpClient.js';

export const authProvider = {
  login: async ({ email, password, totp }) => {
    try {
      const { data } = await httpClient.post(`${ADMIN_API}/auth/login`, { email, password, totp });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem('billing_admin', JSON.stringify(data.admin));
      return { success: true, redirectTo: '/' };
    } catch (e) {
      const code = e.response?.data?.code;
      if (code === 'TOTP_REQUIRED' || code === 'TOTP_INVALID') {
        return { success: false, error: { name: '2fa', code, message: code === 'TOTP_INVALID' ? 'Неверный код 2FA' : 'Введите код из приложения' } };
      }
      return { success: false, error: { name: 'Ошибка входа', message: e.response?.data?.error || 'Неверный email или пароль' } };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('billing_admin');
    return { success: true, redirectTo: '/login' };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return { authenticated: true };
    return { authenticated: false, redirectTo: '/login' };
  },
  onError: async (error) => {
    if (error?.response?.status === 401) return { logout: true, redirectTo: '/login' };
    return {};
  },
  getIdentity: async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('billing_admin') || 'null');
      if (stored) return { id: stored.id, name: stored.name || stored.email, email: stored.email, role: stored.role, avatar: stored.avatarUrl || undefined };
    } catch { /* ignore */ }
    return null;
  },
  getPermissions: async () => {
    try { return JSON.parse(localStorage.getItem('billing_admin') || 'null')?.role || null; }
    catch { return null; }
  },
};
