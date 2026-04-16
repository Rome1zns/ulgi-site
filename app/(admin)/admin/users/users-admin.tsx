"use client";

import { useState } from "react";
import { toggleBanUser, updateUserRole } from "@/lib/supabase/queries/profiles";
import type { Profile } from "@/types/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { kk } from "@/lib/locale/kk";
import { Search, Ban, ShieldCheck } from "lucide-react";

interface Props {
  initialUsers: Profile[];
  onChanged?: (u: Profile[]) => void;
}

export function UsersAdmin({ initialUsers, onChanged }: Props) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleBan(userId: string, isBanned: boolean) {
    try {
      const updated = await toggleBanUser(userId, isBanned);
      const next = users.map((u) => (u.id === userId ? (updated as Profile) : u));
      setUsers(next);
      onChanged?.(next);
    } catch (err) {
      console.error("Ban toggle:", err);
    }
  }

  async function setRole(userId: string, role: "student" | "teacher" | "admin") {
    try {
      const updated = await updateUserRole(userId, role);
      const next = users.map((u) => (u.id === userId ? (updated as Profile) : u));
      setUsers(next);
      onChanged?.(next);
    } catch (err) {
      console.error("Role update:", err);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Іздеу..."
          className="rounded-xl pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{kk.auth.fullName}</th>
              <th className="px-4 py-3 text-left font-medium">Username</th>
              <th className="px-4 py-3 text-left font-medium">{kk.auth.yourClass}</th>
              <th className="px-4 py-3 text-left font-medium">Рөлі</th>
              <th className="px-4 py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {filtered.map((u) => {
              const initials = u.full_name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <tr key={u.id} className="bg-white dark:bg-zinc-950">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.full_name}</span>
                      {u.is_banned && (
                        <Badge variant="destructive" className="text-[10px]">Banned</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">@{u.username}</td>
                  <td className="px-4 py-3">{u.class_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={u.is_banned ? kk.admin.unban : kk.admin.ban}
                        onClick={() => toggleBan(u.id, u.is_banned)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      {u.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Admin"
                          onClick={() => setRole(u.id, "admin")}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
