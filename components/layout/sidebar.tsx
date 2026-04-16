"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, PlusCircle, Bot, User, Shield } from "lucide-react";
import { kk } from "@/lib/locale/kk";

const items = [
  { href: "/feed", icon: Home, label: kk.nav.feed },
  { href: "/announcements", icon: Bell, label: kk.nav.announcements },
  { href: "/create", icon: PlusCircle, label: kk.nav.create },
  { href: "/assistant", icon: Bot, label: kk.nav.assistant },
  { href: "/profile", icon: User, label: kk.nav.profile },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r-2 border-[var(--duo-border)] bg-white md:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/feed" className="text-2xl font-extrabold text-[var(--duo-green)]">Úlgi</Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-[15px] font-bold transition-all ${
                active ? "bg-[var(--duo-blue-bg)] text-[var(--duo-blue)]" : "text-[var(--duo-text-secondary)] hover:bg-[var(--duo-bg)]"
              }`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t-2 border-[var(--duo-border)] px-3 py-4">
        <Link href="/admin"
          className={`flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-[15px] font-bold transition-all ${
            pathname.startsWith("/admin") ? "bg-[var(--duo-red-bg)] text-[var(--duo-red)]" : "text-[var(--duo-text-secondary)] hover:bg-[var(--duo-red-bg)] hover:text-[var(--duo-red)]"
          }`}>
          <Shield className="h-5 w-5" />Әкімші
        </Link>
      </div>
    </aside>
  );
}
