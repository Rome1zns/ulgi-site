"use client";

import { useEffect, useState } from "react";
import { getAllAnnouncements } from "@/lib/supabase/queries/announcements";
import type { Announcement } from "@/types/db";
import { kk } from "@/lib/locale/kk";
import { AnnouncementsAdmin } from "./announcements-admin";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getAllAnnouncements(100);
        if (alive) setItems(data as Announcement[]);
      } catch (err) {
        console.error("[admin] announcements error:", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!loaded) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" /></div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-[var(--duo-text)]">{kk.announcements.title}</h1>
      <AnnouncementsAdmin initialAnnouncements={items} onChanged={setItems} />
    </div>
  );
}
