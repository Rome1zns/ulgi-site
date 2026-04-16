import { supabase } from "@/lib/supabase/client";
import type { AiChat, AiMessage } from "@/types/db";

export async function getUserChats(userId: string) {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as AiChat[];
}

export async function getChatMessages(chatId: string) {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as AiMessage[];
}

export async function createChat(userId: string, title?: string) {
  const { data, error } = await supabase
    .from("ai_chats")
    .insert({
      user_id: userId,
      title: title || "Жаңа чат",
    })
    .select()
    .single();

  if (error) throw error;
  return data as AiChat;
}

export async function updateChatTitle(chatId: string, title: string) {
  const { error } = await supabase
    .from("ai_chats")
    .update({ title })
    .eq("id", chatId);

  if (error) throw error;
}

export async function deleteChat(chatId: string) {
  // CASCADE automatically removes all ai_messages rows.
  const { error } = await supabase
    .from("ai_chats")
    .delete()
    .eq("id", chatId);

  if (error) throw error;
}

export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
) {
  const { data, error } = await supabase
    .from("ai_messages")
    .insert({ chat_id: chatId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data as AiMessage;
}

/**
 * Subscribe to new assistant/user messages for one chat.
 * Returns an unsubscribe function.
 */
export function subscribeToChat(
  chatId: string,
  onMessage: (message: AiMessage) => void
): () => void {
  const channel = supabase
    .channel(`ai-chat-${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ai_messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => onMessage(payload.new as AiMessage)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
