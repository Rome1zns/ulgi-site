import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="rounded-2xl border-2 border-[var(--duo-border)] bg-[var(--duo-white)] p-6 shadow-sm dark:bg-zinc-900">
      <Skeleton className="mb-4 h-7 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
