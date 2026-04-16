import { supabase } from "@/lib/supabase/client";

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function isUsernameTaken(
  username: string,
  exceptUserId?: string
): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username);

  if (exceptUserId) query = query.neq("id", exceptUserId);

  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return !!data;
}

export interface ProfileUpdates {
  full_name?: string;
  username?: string;
  class_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export async function updateProfile(id: string, updates: ProfileUpdates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllUsersForAdmin(limit = 100) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function toggleBanUser(userId: string, isBanned: boolean) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_banned: !isBanned })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserRole(
  userId: string,
  role: "student" | "teacher" | "admin"
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
