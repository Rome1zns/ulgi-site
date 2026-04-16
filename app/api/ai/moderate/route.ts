import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { MODERATION_PROMPT } from "@/lib/openai/prompts";
import { verifySupabaseAuth } from "@/lib/supabase/verify-request";

export async function POST(request: Request) {
  const auth = await verifySupabaseAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MODERATION_PROMPT },
        { role: "user", content: text },
      ],
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({
        safe: parsed.safe ?? true,
        severity: parsed.severity ?? "none",
        reason: parsed.reason ?? null,
        categories: parsed.categories ?? [],
      });
    } catch {
      return NextResponse.json({ safe: true, severity: "none", reason: null, categories: [] });
    }
  } catch (err) {
    console.error("[ai/moderate] error:", err);
    // Fallback — don't block posts if AI fails.
    return NextResponse.json({ safe: true, severity: "none", reason: null, categories: [] });
  }
}
