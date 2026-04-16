"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { createChat, deleteChat } from "@/lib/supabase/queries/ai-chats";
import type { AiChat } from "@/types/db";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { kk } from "@/lib/locale/kk";

interface ChatListProps {
  chats: AiChat[];
  activeChatId: string | null;
  onChatsChange: (chats: AiChat[]) => void;
  onChatDeleted: (deletedId: string) => void;
}

export function ChatList({ chats, activeChatId, onChatsChange, onChatDeleted }: ChatListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  async function handleNewChat() {
    if (!user) return;
    setCreating(true);
    try {
      const chat = await createChat(user.id, kk.assistant.newChat);
      onChatsChange([chat, ...chats]);
      router.push(`/assistant?chat=${chat.id}`);
    } catch (err) {
      console.error("Create chat error:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(chatId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Чатты жоюға сенімдісіз бе?")) return;
    try {
      await deleteChat(chatId);
      onChatDeleted(chatId);
    } catch (err) {
      console.error("Delete chat error:", err);
      alert("Жою қатесі");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-[var(--duo-border)] p-3">
        <button onClick={handleNewChat} disabled={creating} className="btn-duo btn-duo-green w-full gap-2 !text-sm">
          <Plus className="h-4 w-4" />{kk.assistant.newChat}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 && (
          <p className="p-4 text-center text-sm font-semibold text-[var(--duo-text-secondary)]">{kk.assistant.myChats}</p>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 transition-all ${
              activeChatId === chat.id
                ? "bg-[var(--duo-purple-bg)] text-[var(--duo-purple)]"
                : "text-[var(--duo-text-secondary)] hover:bg-[var(--duo-bg)]"
            }`}
          >
            <button
              onClick={() => router.push(`/assistant?chat=${chat.id}`)}
              className="flex flex-1 items-center gap-3 px-4 py-3 text-left text-sm font-bold truncate"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{chat.title || kk.assistant.newChat}</span>
            </button>
            <button
              onClick={(e) => handleDelete(chat.id, e)}
              className="mr-2 rounded-[var(--radius-sm)] p-2 opacity-0 transition-all hover:bg-[var(--duo-red-bg)] group-hover:opacity-100"
              title="Жою"
            >
              <Trash2 className="h-3.5 w-3.5 text-[var(--duo-red)]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
