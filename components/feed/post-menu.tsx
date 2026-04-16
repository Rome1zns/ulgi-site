"use client";

import { useState } from "react";
import { deletePost } from "@/lib/supabase/queries/posts";
import { useAuth } from "@/lib/contexts/auth-context";
import { MoreHorizontal, Trash2, Flag } from "lucide-react";
import { kk } from "@/lib/locale/kk";

interface PostMenuProps {
  postId: string;
  authorId: string;
  mediaPublicId?: string | null;
  mediaType?: string | null;
  onDeleted: () => void;
}

export function PostMenu({ postId, authorId, mediaPublicId, mediaType, onDeleted }: PostMenuProps) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = user?.id === authorId;
  const isAdmin = profile?.role === "admin";
  const canDelete = isAuthor || isAdmin;

  if (!user) return null;

  async function handleDelete() {
    if (!confirm("Постты жоюға сенімдісіз бе?")) return;
    setOpen(false);
    setDeleting(true);
    try {
      await deletePost(postId);

      if (mediaPublicId) {
        fetch("/api/media/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: mediaPublicId,
            resourceType: mediaType === "video" ? "video" : "image",
          }),
        }).catch(console.warn);
      }

      onDeleted();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Жою қатесі");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="rounded-full p-2 transition-all hover:bg-[var(--duo-bg)]" aria-label="Мәзір">
        <MoreHorizontal className="h-5 w-5 text-[var(--duo-text-secondary)]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 min-w-[180px] overflow-hidden rounded-[var(--radius-md)] border-2 border-[var(--duo-border)] bg-white py-1">
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[var(--duo-red)] transition-all hover:bg-[var(--duo-red-bg)] disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
                {deleting ? "Жойылуда..." : kk.feed.delete}
                {isAdmin && !isAuthor && (
                  <span className="ml-auto rounded-full bg-[var(--duo-red-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--duo-red)]">Әкімші</span>
                )}
              </button>
            )}
            {!isAuthor && (
              <button onClick={() => { setOpen(false); alert("Шағым жіберілді"); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[var(--duo-text-secondary)] transition-all hover:bg-[var(--duo-bg)]">
                <Flag className="h-4 w-4" />
                {kk.feed.report}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
