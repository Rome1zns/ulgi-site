import Link from "next/link";
import { kk } from "@/lib/locale/kk";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-5xl">🔍</div>
        <h1 className="mb-1 text-6xl font-extrabold text-[var(--duo-text)]">404</h1>
        <p className="mb-6 text-lg font-bold text-[var(--duo-text-secondary)]">{kk.errors.notFound}</p>
        <Link href="/feed" className="btn-duo btn-duo-green">
          {kk.nav.feed}
        </Link>
      </div>
    </div>
  );
}
