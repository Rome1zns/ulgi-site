"use client";

import { ChatList } from "@/components/assistant/chat-list";
import { ChatWindow } from "@/components/assistant/chat-window";
import type { AiChat } from "@/types/db";
import { kk } from "@/lib/locale/kk";
import { Bot } from "lucide-react";

interface AssistantClientProps {
  chats: AiChat[];
  activeChatId: string | null;
  onChatsChange: (chats: AiChat[]) => void;
  onChatDeleted: (deletedId: string) => void;
}

export function AssistantClient({
  chats,
  activeChatId,
  onChatsChange,
  onChatDeleted,
}: AssistantClientProps) {
  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-5rem)] md:h-[calc(100dvh-3rem)]">
      {/* Chat list — desktop sidebar */}
      <div className="hidden w-72 shrink-0 border-r border-[var(--duo-border)] bg-[var(--duo-white)] dark:border-zinc-800 dark:bg-zinc-950 md:block">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onChatsChange={onChatsChange}
          onChatDeleted={onChatDeleted}
        />
      </div>

      {/* Chat window or empty state */}
      <div className="flex flex-1 flex-col">
        {activeChatId ? (
          <ChatWindow chatId={activeChatId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--duo-purple-bg)]">
              <Bot className="h-8 w-8 text-[var(--duo-purple)]" />
            </div>
            <div>
              <p className="text-lg font-medium">{kk.assistant.greeting}</p>
              <p className="mt-1 text-sm text-muted-foreground">{kk.assistant.placeholder}</p>
            </div>

            {/* Mobile: show chat list inline */}
            <div className="w-full max-w-sm md:hidden">
              <ChatList
                chats={chats}
                activeChatId={null}
                onChatsChange={onChatsChange}
                onChatDeleted={onChatDeleted}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
