import Link from "next/link";
import { kk } from "@/lib/locale/kk";
import { Camera, Bot, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Hero card */}
      <div className="w-full max-w-sm card-duo p-8 text-center">
        <div className="mb-4 text-6xl">🏫</div>
        <h1 className="mb-1 text-5xl font-extrabold text-[var(--duo-green)]">
          {kk.meta.siteName}
        </h1>
        <p className="mb-8 text-base font-semibold text-[var(--duo-text-secondary)]">
          {kk.meta.siteName}
        </p>
        <p className="mb-8 text-lg font-bold text-[var(--duo-text)]">
          {kk.home.subheading}
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/register" className="btn-duo btn-duo-green w-full">
            Бастау
          </Link>
          <Link href="/login" className="btn-duo btn-duo-white w-full">
            {kk.home.loginButton}
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-3">
        <div className="card-duo flex flex-col items-center gap-2 p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--duo-green-bg)]">
            <Camera className="h-6 w-6 text-[var(--duo-green)]" />
          </div>
          <span className="text-xs font-bold text-[var(--duo-text)]">
            {kk.nav.create}
          </span>
        </div>
        <div className="card-duo flex flex-col items-center gap-2 p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--duo-purple-bg)]">
            <Bot className="h-6 w-6 text-[var(--duo-purple)]" />
          </div>
          <span className="text-xs font-bold text-[var(--duo-text)]">
            {kk.nav.assistant}
          </span>
        </div>
        <div className="card-duo flex flex-col items-center gap-2 p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--duo-orange-bg)]">
            <Bell className="h-6 w-6 text-[var(--duo-orange)]" />
          </div>
          <span className="text-xs font-bold text-[var(--duo-text)]">
            {kk.nav.announcements}
          </span>
        </div>
      </div>
    </div>
  );
}
