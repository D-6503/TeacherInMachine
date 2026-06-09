import { create } from 'zustand';
import { Student } from '@/types';
import { getToken, getUser, setToken, setUser, clearAuth } from '@/lib/auth';

interface AuthState {
  user: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Student, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    setToken(token);
    setUser(user);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    clearAuth();
    set({ user: null, token: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = getToken();
    const user = getUser();
    if (token && user) set({ user, token, isAuthenticated: true });
  },
}));
