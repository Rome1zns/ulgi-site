"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider, useAuth } from "@/lib/contexts/auth-context";

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Children рендерятся СРАЗУ — их useEffect запускается параллельно с auth
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1 pb-20 md:ml-60 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutShell>{children}</LayoutShell>
    </AuthProvider>
  );
}
