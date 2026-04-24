"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminAssignmentsTable } from "@/components/assignments/admin-assignments-table";
import { buttonVariants } from "@/components/ui/button";
import { kk } from "@/lib/locale/kk";
import {
  archiveAssignment,
  getAdminAssignments,
  publishAssignment,
} from "@/lib/supabase/queries/assignments";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/db";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssignments() {
      try {
        const data = await getAdminAssignments();
        if (active) setAssignments(data as Assignment[]);
      } catch (error) {
        console.error("[admin/assignments]", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAssignments();

    return () => {
      active = false;
    };
  }, []);

  async function handlePublish(id: string) {
    setBusyId(id);
    try {
      const updated = await publishAssignment(id);
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === id ? { ...assignment, status: updated.status } : assignment
        )
      );
      toast.success(kk.assignments.publishSuccess);
    } catch (error) {
      console.error("[admin/assignments/publish]", error);
      toast.error(kk.assignments.createError);
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(id: string) {
    setBusyId(id);
    try {
      const updated = await archiveAssignment(id);
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === id ? { ...assignment, status: updated.status } : assignment
        )
      );
      toast.success(kk.assignments.archiveSuccess);
    } catch (error) {
      console.error("[admin/assignments/archive]", error);
      toast.error(kk.assignments.createError);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">
            {kk.assignments.title}
          </h1>
        </div>
        <Link
          href="/admin/assignments/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Plus className="h-4 w-4" />
          {kk.assignments.new}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-[var(--duo-white)] ring-1 ring-[var(--duo-border)]"
            />
          ))}
        </div>
      ) : (
        <AdminAssignmentsTable
          assignments={assignments}
          busyId={busyId}
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
}
