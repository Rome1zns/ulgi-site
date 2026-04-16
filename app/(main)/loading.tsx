export default function MainLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-duo animate-pulse">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[var(--duo-border)]" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-[var(--duo-border)]" />
              <div className="h-3 w-20 rounded bg-[var(--duo-border)]" />
            </div>
          </div>
          <div className="h-4 w-full rounded bg-[var(--duo-border)]" />
          <div className="mt-2 h-4 w-3/4 rounded bg-[var(--duo-border)]" />
          <div className="mt-3 h-48 w-full rounded-[var(--radius-md)] bg-[var(--duo-border)]" />
        </div>
      ))}
    </div>
  );
}
