import { AdminSidebar } from "./admin-sidebar";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { AdminGuard } from "@/components/auth/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>
        <div className="flex min-h-dvh">
          <AdminSidebar />
          <main className="flex-1 md:ml-60">
            <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
          </main>
        </div>
      </AdminGuard>
    </AuthProvider>
  );
}
