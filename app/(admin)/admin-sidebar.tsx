"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, Users, ShieldCheck, FileText, ArrowLeft } from "lucide-react";
import { kk } from "@/lib/locale/kk";

const items = [
  { href: "/admin", icon: BarChart3, label: kk.admin.stats, exact: true },
  { href: "/admin/posts", icon: FileText, label: "Посттар" },
  { href: "/admin/announcements", icon: Bell, label: kk.nav.announcements },
  { href: "/admin/users", icon: Users, label: kk.admin.users },
  { href: "/admin/moderation", icon: ShieldCheck, label: kk.admin.moderation },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r-2 border-[var(--duo-border)] bg-white md:flex">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-extrabold text-[var(--duo-text)]">{kk.admin.dashboard}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-[15px] font-bold transition-all ${
              active ? "bg-[var(--duo-blue-bg)] text-[var(--duo-blue)]" : "text-[var(--duo-text-secondary)] hover:bg-[var(--duo-bg)]"
            }`}>
              <Icon className="h-5 w-5" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t-2 border-[var(--duo-border)] p-3">
        <Link href="/feed" className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-bold text-[var(--duo-text-secondary)] hover:text-[var(--duo-text)]">
          <ArrowLeft className="h-4 w-4" />{kk.nav.feed}
        </Link>
      </div>
    </aside>
  );
}
