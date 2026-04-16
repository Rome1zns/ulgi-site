import { supabase } from "@/lib/supabase/client";

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error("Өзіңізге жазыла алмайсыз");

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });

  if (error && error.code !== "23505") throw error;
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) throw error;
}

export async function checkIsFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
