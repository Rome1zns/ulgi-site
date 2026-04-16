import { supabase } from "@/lib/supabase/client";
import type { Comment } from "@/types/db";

const COMMENT_AUTHOR_SELECT = `
  *,
  author:profiles (
    id, username, full_name, avatar_url, role
  )
`;

export type CommentRow = Comment;

export async function getPostComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_AUTHOR_SELECT)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createComment(
  postId: string,
  authorId: string,
  content: string
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: authorId,
      content: content.trim(),
    })
    .select(COMMENT_AUTHOR_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
}

/**
 * Subscribe to INSERT / DELETE events on comments for a single post.
 * Returns an unsubscribe function. RLS is respected.
 */
export function subscribeToPostComments(
  postId: string,
  handlers: {
    onInsert?: (comment: CommentRow) => void;
    onDelete?: (commentId: string) => void;
  }
): () => void {
  const channel = supabase
    .channel(`comments-post-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload) => {
        handlers.onInsert?.(payload.new as CommentRow);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload) => {
        const old = payload.old as { id?: string };
        if (old?.id) handlers.onDelete?.(old.id);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
