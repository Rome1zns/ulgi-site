"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  getPostComments,
  createComment,
  deleteComment,
  subscribeToPostComments,
} from "@/lib/supabase/queries/comments";
import { getProfileById } from "@/lib/supabase/queries/profiles";
import type { CommentWithAuthor, Profile } from "@/types/db";
import { Send, Trash2 } from "lucide-react";
import { kk } from "@/lib/locale/kk";
import { relativeTime } from "@/lib/utils/time";

interface CommentThreadProps {
  postId: string;
  initialComments?: CommentWithAuthor[];
}

export function CommentThread({ postId, initialComments = [] }: CommentThreadProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(initialComments.length === 0);

  // Track IDs we've already added to the UI so Realtime INSERT doesn't duplicate
  // an optimistic row we just rendered.
  const seenIds = useRef<Set<string>>(new Set(initialComments.map((c) => c.id)));

  useEffect(() => {
    let mounted = true;

    // Initial fetch (skipped if initialComments were passed — e.g. post detail page)
    if (initialComments.length === 0) {
      (async () => {
        try {
          const rows = await getPostComments(postId);
          if (!mounted) return;
          const typed = rows as CommentWithAuthor[];
          typed.forEach((c) => seenIds.current.add(c.id));
          setComments(typed);
        } catch (err) {
          console.error("[comments] fetch error:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }

    // Realtime subscription
    const unsubscribe = subscribeToPostComments(postId, {
      onInsert: async (row) => {
        if (seenIds.current.has(row.id)) return;
        seenIds.current.add(row.id);
        try {
          const author = await getProfileById(row.author_id);
          if (!mounted) return;
          setComments((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev;
            return [...prev, { ...row, author: (author as Profile) }];
          });
        } catch (err) {
          console.error("[comments] realtime author fetch error:", err);
        }
      },
      onDelete: (deletedId) => {
        if (!mounted) return;
        seenIds.current.delete(deletedId);
        setComments((prev) => prev.filter((c) => c.id !== deletedId));
      },
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [postId, initialComments.length]);

  async function handleSend() {
    if (!user || !text.trim()) return;
    const content = text.trim();
    setText("");
    setSending(true);
    setError("");
    try {
      const row = (await createComment(postId, user.id, content)) as CommentWithAuthor;
      seenIds.current.add(row.id);
      setComments((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]));
    } catch (err) {
      console.error("Comment send error:", err);
      setText(content);
      setError("Пікір жіберу қатесі");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Пікірді жоюға сенімдісіз бе?")) return;
    try {
      await deleteComment(commentId);
      // Realtime onDelete removes it from UI — but also drop locally in case
      // the event arrives late.
      seenIds.current.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Пікірді жою қатесі");
    }
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">
        {kk.feed.comments} ({comments.length})
      </h3>
      {loading && comments.length === 0 && (
        <p className="py-4 text-center text-sm font-semibold text-[var(--duo-text-secondary)]">{kk.feed.loading}</p>
      )}
      {!loading && comments.length === 0 && (
        <p className="py-4 text-center text-sm font-semibold text-[var(--duo-text-secondary)]">{kk.feed.firstComment}</p>
      )}
      <div className="space-y-3">
        {comments.map((c) => {
          const name = c.author?.full_name || "Белгісіз";
          const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const canDelete = user?.id === c.author_id || isAdmin;
          return (
            <div key={c.id} className="group flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--duo-border)] bg-[var(--duo-bg)] text-[10px] font-bold text-[var(--duo-text-secondary)]">
                {c.author?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={c.author.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--duo-text)]">{name}</span>
                  <span className="text-[10px] font-semibold text-[var(--duo-text-secondary)]">{relativeTime(c.created_at)}</span>
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="ml-auto rounded-[var(--radius-sm)] p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--duo-red-bg)]"
                      title="Пікірді жою"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[var(--duo-red)]" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[var(--duo-text)]">{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs font-bold text-[var(--duo-red)]">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={kk.feed.addComment} disabled={sending || !user} className="input-duo" maxLength={500} />
        <button type="submit" disabled={sending || !text.trim() || !user} className="btn-duo btn-duo-green shrink-0 !p-3" aria-label={kk.feed.send}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
