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
