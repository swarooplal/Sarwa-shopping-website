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
  register: (data: { firstName: string; lastName?: string; email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ devResetToken?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  checkEmail: (email: string) => Promise<boolean>;
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
        try {
          const data: any = await apiPost('/auth/register', body);
          setAccessToken(data.accessToken);
          if (typeof window !== 'undefined') localStorage.setItem('sarwa_refresh', data.refreshToken);
          set({ user: data.user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },
      forgotPassword: async (email) => {
        const data: any = await apiPost('/auth/forgot-password', { email });
        return { devResetToken: data.devResetToken };
      },
      resetPassword: async (token, password) => {
        await apiPost('/auth/reset-password', { token, password });
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
      checkEmail: async (email) => {
        const data: any = await apiGet(`/auth/check-email?email=${encodeURIComponent(email)}`);
        return !!data?.exists;
      },
    }),
    {
      name: 'sarwa-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
);