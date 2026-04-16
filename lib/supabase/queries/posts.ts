import { supabase } from "@/lib/supabase/client";

const POST_AUTHOR_SELECT = `
  *,
  author:profiles (
    id, username, full_name, avatar_url, class_name, role
  )
`;

export async function getFeedPosts(limit = 20) {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_AUTHOR_SELECT)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_AUTHOR_SELECT)
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPostsByAuthor(authorId: string, limit = 20) {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_AUTHOR_SELECT)
    .eq("author_id", authorId)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getAllPostsForAdmin(limit = 100) {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_AUTHOR_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getPendingPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_AUTHOR_SELECT)
    .eq("moderation_status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export interface CreatePostInput {
  author_id: string;
  content: string;
  media_urls?: string[];
  media_type?: "none" | "image" | "video";
  media_public_id?: string | null;
  ai_caption?: string | null;
  moderation_status?: "approved" | "pending" | "rejected";
}

export async function createPost(input: CreatePostInput) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: input.author_id,
      content: input.content,
      media_urls: input.media_urls || [],
      media_type: input.media_type || "none",
      media_public_id: input.media_public_id || null,
      ai_caption: input.ai_caption || null,
      moderation_status: input.moderation_status || "approved",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function updatePostModerationStatus(
  postId: string,
  status: "approved" | "pending" | "rejected",
  reason?: string
) {
  const { data, error } = await supabase
    .from("posts")
    .update({
      moderation_status: status,
      moderation_reason: reason || null,
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
