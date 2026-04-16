"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { getUserChats } from "@/lib/supabase/queries/ai-chats";
import type { AiChat } from "@/types/db";
import { AssistantClient } from "./assistant-client";

function AssistantInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeChatId = searchParams.get("chat") ?? null;
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<AiChat[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoaded(true); return; }
    let alive = true;
    (async () => {
      try {
        const data = await getUserChats(user.id);
        if (alive) setChats(data);
      } catch (err) {
        console.error("[assistant]", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [user, authLoading]);

  function handleChatsChange(next: AiChat[]) {
    setChats(next);
  }

  function handleChatDeleted(deletedId: string) {
    const remaining = chats.filter((c) => c.id !== deletedId);
    setChats(remaining);
    if (activeChatId === deletedId) {
      router.replace(remaining.length > 0 ? `/assistant?chat=${remaining[0].id}` : "/assistant");
    }
  }

  if (!loaded) {
    return (
      <div className="space-y-3">
        <div className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--duo-border)] animate-pulse" />
        <div className="h-64 w-full rounded-[var(--radius-lg)] bg-[var(--duo-purple-bg)] animate-pulse" />
      </div>
    );
  }

  return (
    <AssistantClient
      chats={chats}
      activeChatId={activeChatId}
      onChatsChange={handleChatsChange}
      onChatDeleted={handleChatDeleted}
    />
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full rounded-[var(--radius-lg)] bg-[var(--duo-purple-bg)] animate-pulse" />}>
      <AssistantInner />
    </Suspense>
  );
}
