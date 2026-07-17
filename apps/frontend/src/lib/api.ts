import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let memToken: string | null = null;
export function setAccessToken(token: string | null) {
  memToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('sarwa_token', token);
    else localStorage.removeItem('sarwa_token');
  }
}
export function getAccessToken(): string | null {
  if (memToken) return memToken;
  if (typeof window !== 'undefined') return localStorage.getItem('sarwa_token');
  return null;
}

api.interceptors.request.use((cfg) => {
  const t = getAccessToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  if (typeof document !== 'undefined') {
    const m = document.cookie.match(/(?:^|;\s*)sarwa_csrf=([^;]+)/);
    if (m) (cfg.headers as any)['x-csrf-token'] = m[1];
  }
  return cfg;
});

let refreshInflight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    try {
      const refresh = typeof window !== 'undefined' ? localStorage.getItem('sarwa_refresh') : null;
      if (!refresh) return null;
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
      const t = data?.data?.accessToken ?? null;
      if (t) setAccessToken(t);
      return t;
    } catch {
      return null;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err?.response?.status === 401 && !original._retry && typeof window !== 'undefined') {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }
    return Promise.reject(err);
  }
);

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const res = await api.get(path, { params });
  return res.data?.data as T;
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await api.post(path, body);
  return res.data?.data as T;
}

export async function apiPut<T>(path: string, body?: any): Promise<T> {
  const res = await api.put(path, body);
  return res.data?.data as T;
}

export async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const res = await api.patch(path, body);
  return res.data?.data as T;
}

export async function apiDel<T = void>(path: string): Promise<T> {
  const res = await api.delete(path);
  return res.data?.data as T;
}

export function fileUrl(url: string) {
  if (!url) return '/placeholder.jpg';
  return url;
}
