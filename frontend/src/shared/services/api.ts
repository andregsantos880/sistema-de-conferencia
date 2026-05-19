import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@/modules/auth/infrastructure/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 30000);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Renovação automática quando o access expira (401). Um único refresh em voo
// por vez; demais requests aguardam o resultado.
let refreshPromise: Promise<string | null> | null = null;

async function tentarRefresh(): Promise<string | null> {
  const refreshToken = authStore.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const r = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: TIMEOUT });
    authStore.set(r.data);
    return r.data?.tokens?.accessToken ?? null;
  } catch {
    authStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      refreshPromise ??= tentarRefresh().finally(() => { refreshPromise = null; });
      const novo = await refreshPromise;
      if (novo) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>)['Authorization'] = `Bearer ${novo}`;
        return api.request(original);
      }
      // sem refresh válido → vai pro login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    if (status === 402) {
      // tenant suspenso — redireciona para tela de faturas
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/app/faturas')) {
        window.location.href = '/app/faturas';
      }
    }

    return Promise.reject(error);
  }
);
