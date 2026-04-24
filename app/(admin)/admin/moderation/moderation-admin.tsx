"use client";

import { useState } from "react";
import { updatePostModerationStatus } from "@/lib/supabase/queries/posts";
import type { PostWithAuthor } from "@/types/db";
import { Button } from "@/components/ui/button";
import { kk } from "@/lib/locale/kk";
import { relativeTime } from "@/lib/utils/time";
import { Check, X, AlertTriangle } from "lucide-react";

interface Props {
  initialPosts: PostWithAuthor[];
  onChanged?: (posts: PostWithAuthor[]) => void;
}

export function ModerationAdmin({ initialPosts, onChanged }: Props) {
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);

  function removeFromList(postId: string) {
    const next = posts.filter((p) => p.id !== postId);
    setPosts(next);
    onChanged?.(next);
  }

  async function handleApprove(postId: string) {
    try {
      await updatePostModerationStatus(postId, "approved");
      removeFromList(postId);
    } catch (err) {
      console.error("Approve error:", err);
    }
  }

  async function handleReject(postId: string) {
    try {
      await updatePostModerationStatus(postId, "rejected");
      removeFromList(postId);
    } catch (err) {
      console.error("Reject error:", err);
    }
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {kk.announcements.empty}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="rounded-2xl border-2 border-[var(--duo-border)] bg-[var(--duo-white)] p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold">{post.author?.full_name || "Белгісіз"}</span>
              {post.author?.class_name && (
                <span className="ml-2 text-xs text-muted-foreground">{post.author.class_name}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{relativeTime(post.created_at)}</span>
          </div>

          <p className="mb-3 whitespace-pre-wrap text-sm">{post.content}</p>

          {post.moderation_reason && (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>AI: {post.moderation_reason}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => handleApprove(post.id)}>
              <Check className="h-4 w-4" />
              {kk.admin.approve}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-xl text-red-600 hover:text-red-700"
              onClick={() => handleReject(post.id)}
            >
              <X className="h-4 w-4" />
              {kk.admin.reject}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
