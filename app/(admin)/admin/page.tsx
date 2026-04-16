"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { kk } from "@/lib/locale/kk";
import { Users, FileText, ShieldAlert, Bell } from "lucide-react";
import Link from "next/link";

interface Stats {
  users: number;
  posts: number;
  pending: number;
  announcements: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, p, m, a] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
          supabase.from("announcements").select("*", { count: "exact", head: true }),
        ]);
        if (!alive) return;
        setStats({
          users: u.count ?? 0,
          posts: p.count ?? 0,
          pending: m.count ?? 0,
          announcements: a.count ?? 0,
        });
      } catch (err) {
        console.error("[admin dashboard]", err);
      }
    })();
    return () => { alive = false; };
  }, []);

  const cards = [
    { label: kk.admin.users, count: stats?.users, icon: Users, color: "var(--duo-green)", bg: "var(--duo-green-bg)", href: "/admin/users" },
    { label: "Посттар", count: stats?.posts, icon: FileText, color: "var(--duo-blue)", bg: "var(--duo-blue-bg)", href: "/admin/posts" },
    { label: kk.admin.moderation, count: stats?.pending, icon: ShieldAlert, color: "var(--duo-orange)", bg: "var(--duo-orange-bg)", href: "/admin/moderation" },
    { label: kk.nav.announcements, count: stats?.announcements, icon: Bell, color: "var(--duo-purple)", bg: "var(--duo-purple-bg)", href: "/admin/announcements" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-[var(--duo-text)]">{kk.admin.dashboard}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((s) => (
          <Link key={s.href} href={s.href} className="card-duo flex items-center gap-4 border-l-4 transition-all hover:opacity-80" style={{ borderLeftColor: s.color }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-sm)]" style={{ background: s.bg }}>
              <s.icon className="h-6 w-6" style={{ color: s.color }} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-[var(--duo-text)]">{s.label}</p>
              <p className="text-xs text-[var(--duo-text-secondary)]">Басқару →</p>
            </div>
            {s.count !== undefined ? (
              <span className="text-2xl font-extrabold" style={{ color: s.color }}>{s.count}</span>
            ) : (
              <span className="h-6 w-8 animate-pulse rounded bg-[var(--duo-border)]" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
