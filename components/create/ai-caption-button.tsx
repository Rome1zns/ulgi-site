"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { kk } from "@/lib/locale/kk";

interface AiCaptionButtonProps {
  text: string;
  onCaption: (caption: string) => void;
  disabled?: boolean;
}

export function AiCaptionButton({ text, onCaption, disabled }: AiCaptionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.caption) onCaption(data.caption);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading || !text.trim()}
      className="badge-duo bg-[var(--duo-purple-bg)] text-[var(--duo-purple)] gap-1.5 cursor-pointer transition-all hover:opacity-80 disabled:opacity-40"
      style={{ padding: "6px 14px", fontSize: 12 }}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {kk.create.suggestCaption}
    </button>
  );
}
