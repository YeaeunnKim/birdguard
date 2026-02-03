import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthCredentials, AuthUser } from '@/src/storage/auth-storage';
import { loadAuthCredentials, loadAuthUser, saveAuthCredentials, saveAuthUser } from '@/src/storage/auth-storage';

type AuthResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await loadAuthUser();
      setUser(stored);
      setIsLoading(false);
    };
    void load();
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const safeEmail = normalizeEmail(email);
    if (!name.trim() || !safeEmail || !password) {
      return { ok: false, message: '모든 항목을 채워주세요.' };
    }
    const id = `user_${Date.now()}`;
    const cred: AuthCredentials = {
      id,
      name: name.trim(),
      email: safeEmail,
      password,
    };
    const nextUser: AuthUser = { id, name: name.trim(), email: safeEmail };
    await saveAuthCredentials(cred);
    await saveAuthUser(nextUser);
    setUser(nextUser);
    return { ok: true };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const safeEmail = normalizeEmail(email);
    const stored = await loadAuthCredentials();
    if (!stored) {
      return { ok: false, message: '먼저 회원가입이 필요해요.' };
    }
    if (stored.email !== safeEmail || stored.password !== password) {
      return { ok: false, message: '이메일 또는 비밀번호가 맞지 않아요.' };
    }
    const nextUser: AuthUser = { id: stored.id, name: stored.name, email: stored.email };
    await saveAuthUser(nextUser);
    setUser(nextUser);
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await saveAuthUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
