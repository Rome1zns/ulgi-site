"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Plus, Bot, Shield, ListChecks } from "lucide-react";
import { kk } from "@/lib/locale/kk";

const items = [
  { href: "/feed", icon: Home, label: kk.nav.feed },
  { href: "/announcements", icon: Bell, label: kk.nav.announcements },
  { href: "/assignments", icon: ListChecks, label: kk.nav.assignments },
  { href: "/create", icon: Plus, label: kk.nav.create, isCreate: true },
  { href: "/assistant", icon: Bot, label: kk.nav.assistant },
  { href: "/admin", icon: Shield, label: "Әкімші" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t-2 border-[var(--duo-border)] bg-[var(--duo-white)] md:hidden">
      {items.map(({ href, icon: Icon, label, isCreate }) => {
        const active = pathname.startsWith(href);
        if (isCreate) {
          return (
            <Link key={href} href={href}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--duo-green)] border-b-[3px] border-[var(--duo-green-dark)] text-white transition-all active:translate-y-[2px] active:border-b-[1px]"
              aria-label={label}>
              <Icon className="h-6 w-6" strokeWidth={3} />
            </Link>
          );
        }
        const isAdminLink = href === "/admin";
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5" aria-label={label}>
            <Icon className={`h-6 w-6 ${active ? (isAdminLink ? "text-[var(--duo-red)]" : "text-[var(--duo-blue)]") : "text-[var(--duo-text-secondary)]"}`} strokeWidth={active ? 2.5 : 2} />
            <span className={`text-[11px] font-bold ${active ? (isAdminLink ? "text-[var(--duo-red)]" : "text-[var(--duo-blue)]") : "text-[var(--duo-text-secondary)]"}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
