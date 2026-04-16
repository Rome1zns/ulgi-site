"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { createPost } from "@/lib/supabase/queries/posts";
import { MediaUploader } from "./media-uploader";
import { AiCaptionButton } from "./ai-caption-button";
import { kk } from "@/lib/locale/kk";
import { MAX_POST_LENGTH } from "@/lib/constants";
import { toast } from "sonner";

export function PostComposer() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [mediaPublicId, setMediaPublicId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    if (!user) { toast.error("Алдымен кіріңіз"); return; }
    if (!content.trim() && !mediaUrl) { toast.error("Мәтін немесе медиа қосыңыз"); return; }

    setPublishing(true);
    try {
      let moderationStatus: "approved" | "pending" | "rejected" = "approved";

      if (content.trim()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          const modRes = await fetch("/api/ai/moderate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ text: content }),
          });
          if (modRes.ok) {
            const modData = await modRes.json();
            if (modData.severity === "high") { toast.error(kk.errors.moderation); return; }
            if (modData.severity === "medium") { moderationStatus = "pending"; }
          }
        } catch { /* skip moderation */ }
      }

      await createPost({
        author_id: user.id,
        content: content.trim(),
        media_urls: mediaUrl ? [mediaUrl] : [],
        media_type: mediaType,
        media_public_id: mediaPublicId,
        moderation_status: moderationStatus,
      });

      toast.success(moderationStatus === "pending" ? kk.create.sentToModeration : kk.create.published);
      router.push("/feed");
    } catch (err) {
      console.error("Publish error:", err);
      toast.error(kk.errors.generic);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="card-duo space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_POST_LENGTH))}
        placeholder={kk.create.placeholder}
        rows={5}
        disabled={publishing}
        className="input-duo resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--duo-text-secondary)]">{content.length}/{MAX_POST_LENGTH}</span>
        <AiCaptionButton text={content} onCaption={(c) => setContent(c)} disabled={publishing} />
      </div>
      <MediaUploader
        onUploaded={(url, type, publicId) => {
          setMediaUrl(url);
          setMediaType(type);
          setMediaPublicId(publicId ?? null);
        }}
        onClear={() => {
          setMediaUrl(null);
          setMediaType("none");
          setMediaPublicId(null);
        }}
        hasMedia={!!mediaUrl}
        disabled={publishing}
      />
      <button className="btn-duo btn-duo-green w-full" disabled={publishing || (!content.trim() && !mediaUrl)} onClick={handlePublish}>
        {publishing ? kk.create.publishing : kk.create.publish}
      </button>
    </div>
  );
}
