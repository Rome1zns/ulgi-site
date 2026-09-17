"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/db";

import {
  isDemoSessionActive,
  DEMO_USER,
  DEMO_PROFILE,
  clearDemoCookie,
} from "@/lib/auth/demo";

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
    if (isDemoSessionActive() && userId === DEMO_USER.id) {
      return DEMO_PROFILE;
    }
    try {
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
    } catch (err) {
      console.error("[auth] fetchProfile exception:", err);
      return null;
    }
  }

  async function refreshProfile() {
    if (!user) return;
    if (isDemoSessionActive() && user.id === DEMO_USER.id) {
      setProfile(DEMO_PROFILE);
      return;
    }
    const p = await fetchProfile(user.id);
    setProfile(p);
  }

  useEffect(() => {
    let active = true;

    if (isDemoSessionActive()) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return;
    }

    let lastUserId: string | null = null;

    async function syncFromSession(session: { user: { id: string } } | null) {
      if (!active) return;
      if (isDemoSessionActive()) {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setLoading(false);
        return;
      }
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

    try {
      supabase.auth.getSession().then(({ data }) => syncFromSession(data?.session ?? null)).catch(() => {
        if (active) setLoading(false);
      });
    } catch {
      if (active) setLoading(false);
    }

    let sub: { subscription: { unsubscribe: () => void } } | null = null;
    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        syncFromSession(session);
      });
      sub = res.data;
    } catch {}

    return () => {
      active = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    clearDemoCookie();
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
