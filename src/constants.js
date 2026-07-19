export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const ADMIN_API = `${API_BASE}/api/admin`;
export const TOKEN_KEY = 'billing_admin_token';

export const SYSTEM_LABEL = { SBP: 'СБП (USDT)', PROMPTPAY: 'PromptPay (Тай QR)', ESIM: 'eSIM', VPN: 'VPN', AML: 'AML' };
export const SYSTEM_COLOR = { SBP: 'geekblue', PROMPTPAY: 'green', ESIM: 'purple', VPN: 'volcano' };

export const TX_STATUS_COLOR = {
  PENDING: 'default', PROCESSING: 'processing', COMPLETED: 'success',
  FAILED: 'error', REFUNDED: 'warning',
};
export const CLIENT_STATUS_COLOR = { ACTIVE: 'success', SUSPENDED: 'error', PENDING: 'warning' };

export const usdt = (n) => `${Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} USDT`;
