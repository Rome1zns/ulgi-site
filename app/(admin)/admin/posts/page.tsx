"use client";

import { useEffect, useState } from "react";
import {
  getAllPostsForAdmin,
  deletePost,
  updatePostModerationStatus,
} from "@/lib/supabase/queries/posts";
import type { PostWithAuthor } from "@/types/db";
import { Trash2, Eye, EyeOff, Search } from "lucide-react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getAllPostsForAdmin(100);
        if (alive) setPosts(data as PostWithAuthor[]);
      } catch (err) {
        console.error("[admin/posts]", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function handleDelete(postId: string) {
    if (!confirm("Постты толығымен жоюға сенімдісіз бе?")) return;
    try {
      await deletePost(postId);
      setPosts((p) => p.filter((x) => x.id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Жою қатесі");
    }
  }

  async function toggleVisibility(postId: string, current: string) {
    const next: "approved" | "rejected" = current === "approved" ? "rejected" : "approved";
    try {
      await updatePostModerationStatus(postId, next);
      setPosts((p) => p.map((x) => (x.id === postId ? { ...x, moderation_status: next } : x)));
    } catch (err) {
      console.error("Update error:", err);
    }
  }

  const filtered = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      (p.author?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-[var(--radius-md)] bg-[var(--duo-border)] animate-pulse" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">📝 Барлық посттар</h1>
        <span className="badge-duo bg-[var(--duo-bg)] text-[var(--duo-text-secondary)]" style={{ padding: "4px 12px", fontSize: 12 }}>{posts.length} пост</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--duo-text-secondary)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Автор немесе мәтін бойынша іздеу..." className="input-duo pl-10" />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm font-bold text-[var(--duo-text-secondary)]">Пост табылмады</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => {
            const status = post.moderation_status;
            const authorName = post.author?.full_name || "Белгісіз";
            return (
              <div key={post.id} className="card-duo flex items-center gap-4 !p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--duo-border)] bg-[var(--duo-bg)]">
                  {post.author?.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--duo-text-secondary)]">{authorName[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-[var(--duo-text)]">{authorName}</span>
                    <span className={`badge-duo text-[10px] ${status === "approved" ? "bg-[var(--duo-green-bg)] text-[var(--duo-green)]" : status === "pending" ? "bg-[var(--duo-yellow-bg)] text-[var(--duo-orange)]" : "bg-[var(--duo-red-bg)] text-[var(--duo-red)]"}`} style={{ padding: "2px 8px" }}>
                      {status === "approved" ? "✅" : status === "pending" ? "⏳" : "❌"} {status}
                    </span>
                  </div>
                  <p className="truncate text-sm text-[var(--duo-text-secondary)]">{post.content || "(медиа)"}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => toggleVisibility(post.id, status)} className="rounded-[var(--radius-sm)] p-2 transition-all hover:bg-[var(--duo-bg)]"
                    title={status === "approved" ? "Жасыру" : "Көрсету"}>
                    {status === "approved" ? <EyeOff className="h-4 w-4 text-[var(--duo-text-secondary)]" /> : <Eye className="h-4 w-4 text-[var(--duo-green)]" />}
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="rounded-[var(--radius-sm)] p-2 transition-all hover:bg-[var(--duo-red-bg)]" title="Жою">
                    <Trash2 className="h-4 w-4 text-[var(--duo-red)]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
