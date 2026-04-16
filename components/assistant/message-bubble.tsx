"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps { role: "user" | "assistant"; content: string; }

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
        isUser ? "border-[var(--duo-green)] bg-[var(--duo-green-bg)]" : "border-[var(--duo-purple)] bg-[var(--duo-purple-bg)]"
      }`}>
        {isUser ? <User className="h-4 w-4 text-[var(--duo-green)]" /> : <Bot className="h-4 w-4 text-[var(--duo-purple)]" />}
      </div>

      <div className={`max-w-[80%] rounded-[var(--radius-lg)] px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-[var(--duo-green-bg)] border-2 border-[var(--duo-green-light)] text-[var(--duo-text)]"
          : "bg-white border-2 border-[var(--duo-border)] border-l-4 border-l-[var(--duo-purple)] text-[var(--duo-text)]"
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap font-semibold">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-headings:my-2 prose-headings:font-bold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
