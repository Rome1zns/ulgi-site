"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble } from "./message-bubble";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import {
  getChatMessages,
  addMessage,
  updateChatTitle,
  subscribeToChat,
} from "@/lib/supabase/queries/ai-chats";
import type { AiMessage } from "@/types/db";
import { kk } from "@/lib/locale/kk";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let mounted = true;
    seenIds.current.clear();

    (async () => {
      try {
        const rows = await getChatMessages(chatId);
        if (!mounted) return;
        rows.forEach((m) => seenIds.current.add(m.id));
        setMessages(rows);
      } catch (err) {
        console.error("[chat-window] load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Realtime — pick up messages from other tabs / server-side inserts.
    const unsubscribe = subscribeToChat(chatId, (msg) => {
      if (seenIds.current.has(msg.id)) return;
      seenIds.current.add(msg.id);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [chatId]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !user) return;
    setInput("");
    setSending(true);

    const isFirstMessage = messages.length === 0;

    try {
      // 1. Persist user message (RLS lets the author insert via auth.uid()).
      const userMsg = await addMessage(chatId, "user", text);
      seenIds.current.add(userMsg.id);
      setMessages((prev) => (prev.some((m) => m.id === userMsg.id) ? prev : [...prev, userMsg]));

      // 2. Update chat title on the first message.
      if (isFirstMessage) {
        const title = text.length > 40 ? text.slice(0, 40) + "..." : text;
        updateChatTitle(chatId, title).catch(console.warn);
      }

      // 3. Grab the Supabase access token for the API route.
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Сессия табылмады");

      // 4. Call the OpenAI route — it writes the assistant reply and returns it.
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "AI қате");
      }

      const data = await res.json();
      const assistantMsg = data.message as AiMessage | null;
      if (assistantMsg && !seenIds.current.has(assistantMsg.id)) {
        seenIds.current.add(assistantMsg.id);
        setMessages((prev) =>
          prev.some((m) => m.id === assistantMsg.id) ? prev : [...prev, assistantMsg]
        );
      }
    } catch (err) {
      console.error("[chat-window] send error:", err);
      const errorMsg: AiMessage = {
        id: `error-${Date.now()}`,
        chat_id: chatId,
        role: "assistant",
        content: "⚠️ " + (err instanceof Error ? err.message : kk.errors.generic),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--duo-purple-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--duo-purple)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-[var(--duo-purple-bg)] p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">🤖</div>
            <p className="text-lg font-bold text-[var(--duo-text)]">{kk.assistant.greeting}</p>
            <p className="mt-1 text-sm text-[var(--duo-text-secondary)]">{kk.assistant.placeholder}</p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 pl-2 text-sm font-semibold text-[var(--duo-text-secondary)]">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--duo-purple)]" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--duo-purple)]" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--duo-purple)]" style={{ animationDelay: "300ms" }} />
            </div>
            <span>AI жауап жазуда...</span>
          </div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="border-t-2 border-[var(--duo-border)] bg-white p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={kk.assistant.placeholder}
            disabled={sending}
            className="input-duo"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="btn-duo btn-duo-green shrink-0 !rounded-full !p-3"
            aria-label={kk.assistant.send}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
