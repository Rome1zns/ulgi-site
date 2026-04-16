"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
} from "@/lib/supabase/queries/announcements";
import type { Announcement } from "@/types/db";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { Badge } from "@/components/ui/badge";
import { kk } from "@/lib/locale/kk";
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from "@/lib/constants";
import { Plus, Trash2, Pin, X, ImagePlus } from "lucide-react";

interface Props {
  initialAnnouncements: Announcement[];
  onChanged?: (items: Announcement[]) => void;
}

export function AnnouncementsAdmin({ initialAnnouncements, onChanged }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("general");
  const [isPinned, setIsPinned] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setTitle(""); setContent(""); setCategory("general"); setIsPinned(false);
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    setEventDate(""); setEventTime(""); setEventLocation("");
    setError(""); setShowForm(false);
  }

  async function refresh() {
    const data = await getAllAnnouncements(100);
    setItems(data as Announcement[]);
    onChanged?.(data as Announcement[]);
  }

  async function handleCreate() {
    if (!user || !title.trim() || !content.trim()) { setError(kk.auth.requiredField); return; }
    setSaving(true); setError("");

    try {
      let mediaUrl: string | null = null;
      let mediaPublicId: string | null = null;
      let uploadedType: "image" | "video" | null = null;

      if (mediaFile) {
        setUploading(true); setUploadProgress(0);
        const result = await uploadToCloudinary(mediaFile, "ulgi/announcements", (pct) => setUploadProgress(pct));
        mediaUrl = result.url;
        mediaPublicId = result.publicId;
        uploadedType = result.type;
        setUploading(false);
      }

      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        is_pinned: isPinned,
        author_id: user.id,
        media_url: mediaUrl,
        media_type: uploadedType,
        media_public_id: mediaPublicId,
        event_date: eventDate || null,
        event_time: eventTime || null,
        event_location: eventLocation.trim() || null,
      });

      resetForm();
      await refresh();
    } catch (err) {
      console.error("Create announcement error:", err);
      setError("Жасау қатесі");
    } finally {
      setSaving(false); setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Хабарландыруды жоюға сенімдісіз бе?")) return;
    try {
      await deleteAnnouncement(id);
      const next = items.filter((a) => a.id !== id);
      setItems(next);
      onChanged?.(next);
    } catch (err) {
      console.error("Delete announcement:", err);
      alert("Жою қатесі");
    }
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-duo btn-duo-green gap-2">
          <Plus className="h-4 w-4" /> {kk.admin.createAnnouncement}
        </button>
      ) : (
        <div className="card-duo space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--duo-text)]">{kk.admin.createAnnouncement}</h3>
            <button onClick={resetForm} className="rounded-full p-1 hover:bg-[var(--duo-bg)]"><X className="h-5 w-5 text-[var(--duo-text-secondary)]" /></button>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">{kk.admin.titleField}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-duo" />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">{kk.admin.bodyField}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="input-duo resize-none" />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">{kk.admin.category}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as AnnouncementCategory)} className="input-duo">
              {ANNOUNCEMENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">📷 Фото / видео</label>
            {!mediaPreview ? (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--duo-border)] py-4 text-sm font-semibold text-[var(--duo-text-secondary)] transition-all hover:border-[var(--duo-blue)]">
                <ImagePlus className="h-5 w-5" /> Файл таңдау
                <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setMediaFile(f); setMediaPreview(URL.createObjectURL(f));
                  setMediaType(f.type.startsWith("video/") ? "video" : "image");
                }} />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-[var(--radius-md)] border-2 border-[var(--duo-border)]">
                {mediaType === "video" ? <video src={mediaPreview} controls className="w-full max-h-[200px]" /> : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={mediaPreview} alt="" className="w-full max-h-[200px] object-cover" />
                )}
                <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"><X className="h-4 w-4" /></button>
              </div>
            )}
            {uploading && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-[var(--duo-text-secondary)]"><span>{kk.feed.loading}</span><span>{uploadProgress}%</span></div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--duo-border)]">
                  <div className="h-full rounded-full bg-[var(--duo-green)] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-[var(--radius-md)] bg-[var(--duo-bg)] p-4">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">📅 Іс-шара деталдары</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--duo-text-secondary)]">Күні</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input-duo !text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--duo-text-secondary)]">Уақыты</label>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="input-duo !text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--duo-text-secondary)]">Орны</label>
              <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Мысалы: Актовый зал" className="input-duo !text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-[var(--duo-text)]">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
            {kk.admin.pinToFeed}
          </label>

          {error && <p className="text-sm font-bold text-[var(--duo-red)]">{error}</p>}

          <button onClick={handleCreate} disabled={saving || !title.trim() || !content.trim()} className="btn-duo btn-duo-green w-full">
            {saving ? kk.create.publishing : kk.admin.publish}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border-2 border-[var(--duo-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--duo-bg)]">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-[var(--duo-text-secondary)]">{kk.admin.titleField}</th>
              <th className="px-4 py-3 text-left font-bold text-[var(--duo-text-secondary)]">{kk.admin.category}</th>
              <th className="px-4 py-3 text-left font-bold text-[var(--duo-text-secondary)]">📷</th>
              <th className="px-4 py-3 text-left font-bold text-[var(--duo-text-secondary)]">📅</th>
              <th className="px-4 py-3 text-right font-bold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--duo-border)]">
            {items.map((a) => (
              <tr key={a.id} className="bg-white">
                <td className="px-4 py-3 font-bold text-[var(--duo-text)]">
                  {a.is_pinned && <Pin className="mr-1 inline h-3 w-3 text-[var(--duo-yellow)]" />}
                  {a.title}
                </td>
                <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{a.category}</Badge></td>
                <td className="px-4 py-3 text-[var(--duo-text-secondary)]">{a.media_url ? (a.media_type === "video" ? "🎬" : "📷") : "—"}</td>
                <td className="px-4 py-3 text-xs text-[var(--duo-text-secondary)]">{a.event_date || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(a.id)} className="rounded-[var(--radius-sm)] p-2 hover:bg-[var(--duo-red-bg)]">
                    <Trash2 className="h-4 w-4 text-[var(--duo-red)]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
