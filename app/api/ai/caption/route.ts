import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { CAPTION_PROMPT } from "@/lib/openai/prompts";
import { verifySupabaseAuth } from "@/lib/supabase/verify-request";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";

export async function POST(request: Request) {
  const auth = await verifySupabaseAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, imageUrl } = await request.json();

  if (!text && !imageUrl) {
    return NextResponse.json({ error: "text or imageUrl required" }, { status: 400 });
  }

  const userContent: ChatCompletionContentPart[] = [];
  if (text) userContent.push({ type: "text", text });
  if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CAPTION_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 200,
    });

    const caption = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ caption });
  } catch (err) {
    console.error("[ai/caption] error:", err);
    return NextResponse.json({ error: (err as Error).message || "AI қате" }, { status: 500 });
  }
}
