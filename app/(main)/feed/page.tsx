"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { getFeedPosts } from "@/lib/supabase/queries/posts";
import { getPinnedAnnouncements } from "@/lib/supabase/queries/announcements";
import { getUserLikedPostIds } from "@/lib/supabase/queries/likes";
import { PostCard } from "@/components/feed/post-card";
import { PinnedAnnouncement } from "@/components/feed/pinned-announcement";
import { kk } from "@/lib/locale/kk";
import type { PostWithAuthor, Announcement } from "@/types/db";

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [postsData, pinnedData, likedData] = await Promise.all([
          getFeedPosts(20),
          getPinnedAnnouncements(5),
          user ? getUserLikedPostIds(user.id) : Promise.resolve<string[]>([]),
        ]);
        if (!active) return;
        setPosts(postsData as PostWithAuthor[]);
        setAnnouncements(pinnedData as Announcement[]);
        setLikedIds(new Set(likedData));
      } catch (err) {
        console.error("[feed] error:", err);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [user]);

  if (!loaded) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-duo animate-pulse">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[var(--duo-border)]" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-[var(--duo-border)]" />
                <div className="h-3 w-20 rounded bg-[var(--duo-border)]" />
              </div>
            </div>
            <div className="h-4 w-full rounded bg-[var(--duo-border)]" />
            <div className="mt-2 h-4 w-3/4 rounded bg-[var(--duo-border)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((a) => (
        <PinnedAnnouncement key={a.id} item={a} />
      ))}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-5xl">📝</div>
          <p className="text-lg font-bold text-[var(--duo-text-secondary)]">{kk.feed.empty}</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            initialLiked={likedIds.has(post.id)}
            onDelete={(id) => setPosts((p) => p.filter((x) => x.id !== id))}
          />
        ))
      )}
    </div>
  );
}
