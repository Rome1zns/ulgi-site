import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { STUDY_HELPER_PROMPT } from "@/lib/openai/prompts";
import { verifySupabaseAuth } from "@/lib/supabase/verify-request";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const auth = await verifySupabaseAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { chatId?: string; message?: string; history?: HistoryMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chatId, message, history } = body;
  if (!chatId || !message) {
    return NextResponse.json({ error: "chatId and message required" }, { status: 400 });
  }

  // Ownership check
  const { data: chat, error: chatErr } = await supabaseAdmin
    .from("ai_chats")
    .select("user_id")
    .eq("id", chatId)
    .maybeSingle();

  if (chatErr || !chat || chat.user_id !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Trim history to last 10 exchanges for cost/latency
  const trimmedHistory = Array.isArray(history) ? history.slice(-10) : [];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: STUDY_HELPER_PROMPT },
        ...trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "Кешіріңіз, жауап бере алмадым";

    // Persist assistant reply so Realtime subscribers see it.
    const { data: savedMessage, error: saveErr } = await supabaseAdmin
      .from("ai_messages")
      .insert({
        chat_id: chatId,
        role: "assistant",
        content: reply,
      })
      .select()
      .single();

    if (saveErr) console.error("[ai/chat] save error:", saveErr);

    return NextResponse.json({ reply, message: savedMessage ?? null });
  } catch (err) {
    console.error("[ai/chat] error:", err);
    const msg = err instanceof Error ? err.message : "AI қате";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
