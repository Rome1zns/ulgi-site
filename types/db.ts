import type { Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type AiChat = Database["public"]["Tables"]["ai_chats"]["Row"];
export type AiMessage = Database["public"]["Tables"]["ai_messages"]["Row"];

export type PostWithAuthor = Post & { author: Profile };
export type CommentWithAuthor = Comment & { author: Profile };
