import { kk } from "@/lib/locale/kk";

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" />
        <p className="text-sm font-bold text-[var(--duo-text-secondary)]">{kk.feed.loading}</p>
      </div>
    </div>
  );
}
