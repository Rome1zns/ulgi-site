"use client";

import { useEffect, useState } from "react";
import { getAllUsersForAdmin } from "@/lib/supabase/queries/profiles";
import type { Profile } from "@/types/db";
import { kk } from "@/lib/locale/kk";
import { UsersAdmin } from "./users-admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getAllUsersForAdmin(200);
        if (alive) setUsers(data as Profile[]);
      } catch (err) {
        console.error("[admin] users error:", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!loaded) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" /></div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-[var(--duo-text)]">{kk.admin.users}</h1>
      <UsersAdmin initialUsers={users} onChanged={setUsers} />
    </div>
  );
}
