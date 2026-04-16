"use client";

import { kk } from "@/lib/locale/kk";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-5xl">😥</div>
        <h1 className="mb-2 text-2xl font-extrabold text-[var(--duo-text)]">{kk.errors.generic}</h1>
        <p className="mb-6 text-sm font-semibold text-[var(--duo-text-secondary)]">
          Ой, бірдеңе сынды. Қайта көріңіз.
        </p>
        <button onClick={reset} className="btn-duo btn-duo-green">
          {kk.errors.retry}
        </button>
      </div>
    </div>
  );
}
