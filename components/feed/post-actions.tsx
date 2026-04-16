"use client";

import { useState, useCallback } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { likePost, unlikePost } from "@/lib/supabase/queries/likes";
import Link from "next/link";

interface PostActionsProps {
  postId: string;
  initialLiked: boolean;
  likesCount: number;
  commentsCount: number;
}

export function PostActions({ postId, initialLiked, likesCount, commentsCount }: PostActionsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likesCount);
  const [animating, setAnimating] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLike = useCallback(async () => {
    if (!user || busy) return;
    const newLiked = !liked;
    setBusy(true);
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));
    if (newLiked) { setAnimating(true); setTimeout(() => setAnimating(false), 300); }

    try {
      if (newLiked) await likePost(postId, user.id);
      else await unlikePost(postId, user.id);
    } catch (err) {
      console.error("Like error:", err);
      // откат
      setLiked(!newLiked);
      setCount((c) => c + (newLiked ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }, [user, liked, postId, busy]);

  async function handleShare() {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      if (navigator.share) await navigator.share({ url });
      else await navigator.clipboard.writeText(url);
    } catch { /* cancelled */ }
  }

  return (
    <div className="flex items-center gap-1 border-t-2 border-[var(--duo-border)] pt-3">
      <button onClick={handleLike} disabled={busy} className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-bold transition-all hover:bg-[var(--duo-red-bg)] disabled:opacity-60">
        <Heart className={`h-5 w-5 ${liked ? "fill-[var(--duo-red)] text-[var(--duo-red)]" : "text-[var(--duo-text-secondary)]"} ${animating ? "like-active" : ""}`} />
        {count > 0 && <span className={liked ? "text-[var(--duo-red)]" : "text-[var(--duo-text-secondary)]"}>{count}</span>}
      </button>
      <Link href={`/post/${postId}`} className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-bold text-[var(--duo-text-secondary)] transition-all hover:bg-[var(--duo-blue-bg)] hover:text-[var(--duo-blue)]">
        <MessageCircle className="h-5 w-5" />
        {commentsCount > 0 && commentsCount}
      </Link>
      <button onClick={handleShare} className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-bold text-[var(--duo-text-secondary)] transition-all hover:bg-[var(--duo-green-bg)] hover:text-[var(--duo-green)]">
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  );
}
