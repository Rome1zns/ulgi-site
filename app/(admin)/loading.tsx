import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border p-6 dark:border-zinc-800"
          >
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-9 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
