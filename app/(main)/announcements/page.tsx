"use client";

import { useEffect, useState } from "react";
import { getAllAnnouncements } from "@/lib/supabase/queries/announcements";
import type { Announcement } from "@/types/db";
import { kk } from "@/lib/locale/kk";
import { optimizeUrl } from "@/lib/cloudinary/upload";

const CATEGORIES = [
  { value: "all", label: "Барлығы", bg: "bg-[var(--duo-bg)]", text: "text-[var(--duo-text)]" },
  { value: "event", label: kk.announcements.events, bg: "bg-[var(--duo-orange-bg)]", text: "text-[var(--duo-orange)]" },
  { value: "sport", label: kk.announcements.sport, bg: "bg-[var(--duo-blue-bg)]", text: "text-[var(--duo-blue)]" },
  { value: "academic", label: kk.announcements.academic, bg: "bg-[var(--duo-green-bg)]", text: "text-[var(--duo-green)]" },
  { value: "general", label: kk.announcements.general, bg: "bg-[var(--duo-bg)]", text: "text-[var(--duo-text-secondary)]" },
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("kk-KZ", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getAllAnnouncements(50);
        if (alive) setItems(data as Announcement[]);
      } catch (err) {
        console.error("[announcements]", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = active === "all" ? items : items.filter((a) => a.category === active);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">{[1, 2, 3].map((i) => <div key={i} className="h-9 w-20 rounded-full bg-[var(--duo-border)] animate-pulse" />)}</div>
        {[1, 2].map((i) => (<div key={i} className="card-duo animate-pulse"><div className="h-5 w-48 rounded bg-[var(--duo-border)] mb-3" /><div className="h-4 w-full rounded bg-[var(--duo-border)] mb-2" /><div className="h-4 w-2/3 rounded bg-[var(--duo-border)]" /></div>))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-[var(--duo-text)]">{kk.announcements.title}</h1>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setActive(c.value)}
            className={`badge-duo cursor-pointer transition-all ${active === c.value ? "bg-[var(--duo-green)] text-white" : `${c.bg} ${c.text} hover:opacity-80`}`}
            style={{ padding: '6px 16px', fontSize: 12 }}>
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm font-bold text-[var(--duo-text-secondary)]">{kk.announcements.empty}</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const cat = CATEGORIES.find((c) => c.value === a.category) ?? CATEGORIES[4];

            return (
              <article key={a.id} className="card-duo !p-0 overflow-hidden">
                {a.media_url && a.media_type === "image" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={optimizeUrl(a.media_url)} alt="" className="w-full max-h-[280px] object-cover" loading="lazy" />
                )}
                {a.media_url && a.media_type === "video" && (
                  <video src={a.media_url} controls className="w-full max-h-[280px]" preload="metadata" />
                )}
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`badge-duo ${cat.bg} ${cat.text}`} style={{ fontSize: 10, padding: '2px 10px' }}>{cat.label}</span>
                    {a.is_pinned ? <span className="text-[10px] font-bold text-[var(--duo-orange)]">📌 {kk.announcements.pinned}</span> : null}
                  </div>
                  <h2 className="mb-2 text-lg font-bold text-[var(--duo-text)]">{a.title}</h2>
                  <p className="text-sm text-[var(--duo-text-secondary)] whitespace-pre-wrap leading-relaxed">{a.content}</p>

                  {(a.event_date || a.event_location) && (
                    <div className="mt-4 space-y-1.5 rounded-[var(--radius-sm)] bg-[var(--duo-bg)] p-3">
                      {a.event_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>📅</span>
                          <span className="font-semibold text-[var(--duo-text)]">
                            {formatDate(a.event_date)}{a.event_time ? ` • ${a.event_time}` : ""}
                          </span>
                        </div>
                      )}
                      {a.event_location && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>📍</span>
                          <span className="font-semibold text-[var(--duo-text)]">{a.event_location}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
