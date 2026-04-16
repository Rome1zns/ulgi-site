"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/db";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[auth] profile fetch error:", error.message);
      return null;
    }
    return data as Profile | null;
  }

  async function refreshProfile() {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }

  useEffect(() => {
    let active = true;
    // last-known userId — чтобы не дёргать fetchProfile повторно если пользователь тот же.
    // onAuthStateChange срабатывает синхронно после getSession (TOKEN_REFRESHED, INITIAL_SESSION),
    // и без дедупа мы делали 2 одинаковых запроса в profiles.
    let lastUserId: string | null = null;

    async function syncFromSession(session: { user: { id: string } } | null) {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u as User | null);
      if (!u) {
        lastUserId = null;
        setProfile(null);
        setLoading(false);
        return;
      }
      if (u.id !== lastUserId) {
        lastUserId = u.id;
        const p = await fetchProfile(u.id);
        if (active) setProfile(p);
      }
      if (active) setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => syncFromSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      syncFromSession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
