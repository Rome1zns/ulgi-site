import { supabase } from "@/lib/supabase/client";

export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function likePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("likes")
    .insert({ post_id: postId, user_id: userId });

  // 23505 = unique_violation (уже лайкнул — игнорируем)
  if (error && error.code !== "23505") throw error;
}

export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getUserLikedPostIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", userId);

  if (error) return [];
  return (data || []).map((l) => l.post_id);
}
