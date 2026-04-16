"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { getPostById } from "@/lib/supabase/queries/posts";
import { getPostComments } from "@/lib/supabase/queries/comments";
import { checkUserLiked } from "@/lib/supabase/queries/likes";
import { PostCard } from "@/components/feed/post-card";
import { CommentThread } from "@/components/feed/comment-thread";
import type { PostWithAuthor, CommentWithAuthor } from "@/types/db";
import { kk } from "@/lib/locale/kk";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [liked, setLiked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const [postRow, cmts, likedFlag] = await Promise.all([
          getPostById(id).catch(() => null),
          getPostComments(id).catch(() => []),
          user ? checkUserLiked(id, user.id) : Promise.resolve(false),
        ]);
        if (!alive) return;
        if (!postRow) { setNotFound(true); setLoaded(true); return; }
        setPost(postRow as PostWithAuthor);
        setComments(cmts as CommentWithAuthor[]);
        setLiked(likedFlag);
      } catch (err) {
        console.error("[post detail]", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [id, user]);

  if (!loaded) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" /></div>;
  if (notFound) return <p className="py-20 text-center text-lg font-bold text-[var(--duo-text-secondary)]">{kk.errors.notFound}</p>;
  if (!post) return null;

  return (
    <div className="space-y-6">
      <PostCard post={post} initialLiked={liked} />
      <div className="card-duo">
        <CommentThread postId={id} initialComments={comments} />
      </div>
    </div>
  );
}
