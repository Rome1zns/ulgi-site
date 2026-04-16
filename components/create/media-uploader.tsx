"use client";

import { useState, useRef } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { ImagePlus, Video, X } from "lucide-react";
import { kk } from "@/lib/locale/kk";

interface MediaUploaderProps {
  onUploaded: (url: string, type: "image" | "video", publicId?: string) => void;
  onClear: () => void;
  hasMedia: boolean;
  disabled?: boolean;
}

export function MediaUploader({ onUploaded, onClear, hasMedia, disabled }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) { setError("Тек фото немесе видео"); return; }
    if (isImage && file.size > 10 * 1024 * 1024) { setError("Фото макс. 10MB"); return; }
    if (isVideo && file.size > 100 * 1024 * 1024) { setError("Видео макс. 100MB"); return; }

    setPreview(URL.createObjectURL(file));
    setFileType(isImage ? "image" : "video");
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadToCloudinary(file, "ulgi/posts", (pct) => setProgress(pct));
      onUploaded(result.url, result.type, result.publicId);
    } catch (err) {
      console.error("[upload]", err);
      setError((err as Error).message || "Жүктеу қатесі");
      setPreview(null);
      setFileType(null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setFileType(null);
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }

  if (preview && !uploading) {
    return (
      <div className="relative overflow-hidden rounded-[var(--radius-md)] border-2 border-[var(--duo-border)]">
        {fileType === "video" ? (
          <video src={preview} controls className="w-full max-h-[300px]" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="" className="w-full max-h-[300px] object-cover" />
        )}
        <button type="button" onClick={handleRemove} disabled={disabled}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="rounded-[var(--radius-md)] border-2 border-[var(--duo-border)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--duo-text-secondary)]">{kk.feed.loading}</span>
          <span className="text-sm font-bold text-[var(--duo-text)]">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--duo-border)]">
          <div className="h-full rounded-full bg-[var(--duo-green)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  if (hasMedia) return null;

  return (
    <div>
      {error && <p className="mb-2 text-xs font-bold text-[var(--duo-red)]">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={disabled} onClick={() => { if (inputRef.current) { inputRef.current.accept = "image/*"; inputRef.current.click(); } }}
          className="btn-duo btn-duo-white gap-1.5 !py-2 !px-4 !text-xs !normal-case">
          <ImagePlus className="h-4 w-4" />{kk.create.addPhoto}
        </button>
        <button type="button" disabled={disabled} onClick={() => { if (inputRef.current) { inputRef.current.accept = "video/mp4,video/webm,video/quicktime"; inputRef.current.click(); } }}
          className="btn-duo btn-duo-white gap-1.5 !py-2 !px-4 !text-xs !normal-case">
          <Video className="h-4 w-4" />{kk.create.addVideo}
        </button>
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}
