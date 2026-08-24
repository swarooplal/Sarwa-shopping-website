'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost, setAccessToken, apiGet } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  quickAuth: (identifier: string, firstName?: string, lastName?: string) => Promise<void>;
  requestOtp: (phone: string, channel?: 'sms' | 'whatsapp') => Promise<{ devCode?: string }>;
  verifyOtp: (phone: string, code: string, channel?: 'sms' | 'whatsapp') => Promise<void>;
  hydrateFromQuery: () => boolean;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data: any = await apiPost('/auth/login', { email, password });
          setAccessToken(data.accessToken);
          if (typeof window !== 'undefined') localStorage.setItem('sarwa_refresh', data.refreshToken);
          set({ user: data.user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },
      register: async (body) => {
        set({ isLoading: true });
        const data: any = await apiPost('/auth/register', body);
        set({ isLoading: false });
        return data;
      },
      quickAuth: async (identifier, firstName, lastName) => {
        set({ isLoading: true });
        try {
          const data: any = await apiPost('/auth/quick', { identifier, firstName, lastName });
          setAccessToken(data.accessToken);
          if (typeof window !== 'undefined') localStorage.setItem('sarwa_refresh', data.refreshToken);
          set({ user: data.user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },
      requestOtp: async (phone, channel = 'sms') => {
        set({ isLoading: true });
        try {
          const data: any = await apiPost('/auth/otp/request', { phone, channel });
          set({ isLoading: false });
          return { devCode: data.devCode };
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },
      verifyOtp: async (phone, code, channel = 'sms') => {
        set({ isLoading: true });
        try {
          const data: any = await apiPost('/auth/otp/verify', { phone, code, channel });
          setAccessToken(data.accessToken);
          if (typeof window !== 'undefined') localStorage.setItem('sarwa_refresh', data.refreshToken);
          set({ user: data.user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },
      hydrateFromQuery: () => {
        if (typeof window === 'undefined') return false;
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        if (!hash || !hash.includes('access_token=')) return false;
        const params = new URLSearchParams(hash);
        const access = params.get('access_token');
        const refresh = params.get('refresh_token');
        if (!access) return false;
        setAccessToken(access);
        if (refresh) localStorage.setItem('sarwa_refresh', refresh);
        get().fetchMe().catch(() => undefined);
        // Strip the fragment so the URL is clean
        const clean = window.location.pathname + window.location.search;
        window.history.replaceState({}, '', clean);
        return true;
      },
      logout: () => {
        setAccessToken(null);
        if (typeof window !== 'undefined') localStorage.removeItem('sarwa_refresh');
        set({ user: null });
      },
      fetchMe: async () => {
        try {
          const me: any = await apiGet('/auth/me');
          set({ user: me });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: 'sarwa-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
);
