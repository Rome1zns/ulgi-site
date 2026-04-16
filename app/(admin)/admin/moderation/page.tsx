"use client";

import { useEffect, useState } from "react";
import { getPendingPosts } from "@/lib/supabase/queries/posts";
import type { PostWithAuthor } from "@/types/db";
import { kk } from "@/lib/locale/kk";
import { ModerationAdmin } from "./moderation-admin";

export default function AdminModerationPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPendingPosts();
        if (alive) setPosts(data as PostWithAuthor[]);
      } catch (err) {
        console.error("[admin] moderation error:", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!loaded) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" /></div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-[var(--duo-text)]">{kk.admin.moderation}</h1>
      <ModerationAdmin initialPosts={posts} onChanged={setPosts} />
    </div>
  );
}
