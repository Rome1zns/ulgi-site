// Auto-generated types will replace this after `npx supabase gen types typescript`
// For now — minimal hand-crafted types matching the schema

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          username: string;
          full_name: string;
          class_name: string | null;
          role: "student" | "teacher" | "admin";
          avatar_url: string | null;
          bio: string | null;
          is_banned: boolean;
          followers_count: number;
          following_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          username: string;
          full_name: string;
          class_name?: string | null;
          role?: "student" | "teacher" | "admin";
          avatar_url?: string | null;
          bio?: string | null;
          is_banned?: boolean;
          followers_count?: number;
          following_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          media_urls: string[];
          media_type: "none" | "image" | "video";
          media_public_id: string | null;
          ai_caption: string | null;
          likes_count: number;
          comments_count: number;
          moderation_status: "approved" | "pending" | "rejected";
          moderation_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          content: string;
          media_urls?: string[];
          media_type?: "none" | "image" | "video";
          media_public_id?: string | null;
          ai_caption?: string | null;
          likes_count?: number;
          comments_count?: number;
          moderation_status?: "approved" | "pending" | "rejected";
          moderation_reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["likes"]["Insert"]>;
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: "event" | "sport" | "academic" | "general";
          author_id: string | null;
          is_pinned: boolean;
          media_url: string | null;
          media_type: "none" | "image" | "video" | null;
          media_public_id: string | null;
          event_date: string | null;
          event_time: string | null;
          event_location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: "event" | "sport" | "academic" | "general";
          author_id?: string | null;
          is_pinned?: boolean;
          media_url?: string | null;
          media_type?: "none" | "image" | "video" | null;
          media_public_id?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          event_location?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
      };
      ai_chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_chats"]["Insert"]>;
      };
      ai_messages: {
        Row: {
          id: string;
          chat_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_messages"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_not_banned: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: "student" | "teacher" | "admin";
      media_type: "none" | "image" | "video";
      moderation_status: "approved" | "pending" | "rejected";
      announcement_category: "event" | "sport" | "academic" | "general";
      ai_role: "user" | "assistant";
    };
  };
};
