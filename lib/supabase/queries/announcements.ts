import { supabase } from "@/lib/supabase/client";

export async function getAllAnnouncements(limit = 50) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getPinnedAnnouncements(limit = 5) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_pinned", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
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

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;
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
