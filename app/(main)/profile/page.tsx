"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }

    // Подожди пока profile загрузится (может быть null на первом рендере)
    if (!profile) return; // ещё грузится из Supabase

    if (profile.username) {
      router.replace(`/profile/${profile.username}`);
    } else {
      router.replace("/complete-profile");
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" />
    </div>
  );
}
