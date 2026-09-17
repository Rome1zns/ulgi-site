import type { Profile } from "@/types/db";
import type { User } from "@supabase/supabase-js";

export const DEMO_PHONE = "7001112233";
export const DEMO_PASSWORD = "20002000";
export const DEMO_COOKIE_NAME = "ulgi_demo_auth";

export const DEMO_PROFILE: Profile = {
  id: "demo-admin-7001112233",
  phone: "+77001112233",
  username: "admin",
  full_name: "Бас әкімші (Úlgi)",
  class_name: "Мектеп әкімшілігі",
  role: "admin",
  avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=ulgi-admin",
  bio: "Úlgi мектеп әлеуметтік желісінің ресми әкімшісі",
  is_banned: false,
  followers_count: 142,
  following_count: 18,
  created_at: "2026-04-16T10:00:00Z",
};

export const DEMO_USER: User = {
  id: DEMO_PROFILE.id,
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {
    phone: DEMO_PROFILE.phone,
    full_name: DEMO_PROFILE.full_name,
    class_name: DEMO_PROFILE.class_name,
    role: DEMO_PROFILE.role,
  },
  aud: "authenticated",
  created_at: "2026-04-16T10:00:00Z",
  email: "77001112233@ulgi.app",
  phone: "+77001112233",
  role: "authenticated",
  updated_at: "2026-04-16T10:00:00Z",
};

export function isDemoPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits === DEMO_PHONE || digits === `7${DEMO_PHONE}` || digits === `8${DEMO_PHONE}`;
}

export function verifyDemoCredentials(phone: string, password: string): boolean {
  return isDemoPhone(phone) && password === DEMO_PASSWORD;
}

export function setDemoCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE_NAME}=admin; path=/; max-age=2592000; SameSite=Lax`;
  try {
    localStorage.setItem(DEMO_COOKIE_NAME, "admin");
  } catch {}
}

export function clearDemoCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  try {
    localStorage.removeItem(DEMO_COOKIE_NAME);
  } catch {}
}

export function isDemoSessionActive(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${DEMO_COOKIE_NAME}=([^;]+)`));
  if (match && match[2] === "admin") return true;
  try {
    return localStorage.getItem(DEMO_COOKIE_NAME) === "admin";
  } catch {
    return false;
  }
}
