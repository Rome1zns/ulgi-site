import { createClient } from "@supabase/supabase-js";

export interface VerifiedAuth {
  userId: string;
  role: string | null;
  isAdmin: boolean;
}

/**
 * Verify a Supabase JWT sent as `Authorization: Bearer <access_token>`.
 * Returns null if unauthorized or banned.
 * Uses the service-role key so it works inside API Routes.
 */
export async function verifySupabaseAuth(request: Request): Promise<VerifiedAuth | null> {
  const header = request.headers.get("Authorization") || request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.is_banned) return null;

  const role = profile?.role ?? null;
  return {
    userId: data.user.id,
    role,
    isAdmin: role === "admin",
  };
}
