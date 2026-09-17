import { supabase } from "@/lib/supabase/client";
import { MOCK_ANNOUNCEMENTS } from "@/lib/data/mock-data";

export async function getAllAnnouncements(limit = 50) {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (data && data.length > 0) return data;
    return MOCK_ANNOUNCEMENTS.slice(0, limit);
  } catch (err) {
    console.warn("[announcements] fallback to mock announcements:", err);
    return MOCK_ANNOUNCEMENTS.slice(0, limit);
  }
}

export async function getPinnedAnnouncements(limit = 5) {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_pinned", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (data && data.length > 0) return data;
    return MOCK_ANNOUNCEMENTS.filter((a) => a.is_pinned).slice(0, limit);
  } catch (err) {
    console.warn("[announcements] fallback to pinned mock announcements:", err);
    return MOCK_ANNOUNCEMENTS.filter((a) => a.is_pinned).slice(0, limit);
  }
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  category: "event" | "sport" | "academic" | "general";
  is_pinned: boolean;
  author_id: string;
  media_url?: string | null;
  media_type?: "image" | "video" | "none" | null;
  media_public_id?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
}

export async function createAnnouncement(input: CreateAnnouncementInput) {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      is_pinned: input.is_pinned,
      author_id: input.author_id,
      media_url: input.media_url || null,
      media_type: input.media_type || null,
      media_public_id: input.media_public_id || null,
      event_date: input.event_date || null,
      event_time: input.event_time || null,
      event_location: input.event_location?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id: string, mediaPublicId?: string | null) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // Чистим Cloudinary в фоне (не блокируем UI)
  if (mediaPublicId) {
    fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: mediaPublicId }),
    }).catch((e) => console.warn("[announcements] cloudinary cleanup:", e));
  }
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  category?: "event" | "sport" | "academic" | "general";
  is_pinned?: boolean;
  media_url?: string | null;
  media_type?: "image" | "video" | "none" | null;
  media_public_id?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
}

export async function updateAnnouncement(id: string, input: UpdateAnnouncementInput) {
  const { data, error } = await supabase
    .from("announcements")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function togglePinAnnouncement(id: string, isPinned: boolean) {
  const { data, error } = await supabase
    .from("announcements")
    .update({ is_pinned: !isPinned })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
