"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== "admin") {
      router.replace("/feed");
    }
  }, [loading, user, profile, router]);

  if (loading || !user || !profile || profile.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" />
      </div>
    );
  }

  return <>{children}</>;
}
