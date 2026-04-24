"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminAssignmentDetail } from "@/components/assignments/admin-assignment-detail";
import { buttonVariants } from "@/components/ui/button";
import { kk } from "@/lib/locale/kk";
import {
  archiveAssignment,
  getAdminAssignmentById,
  publishAssignment,
  type AdminAssignmentWithQuestions,
} from "@/lib/supabase/queries/assignments";
import { cn } from "@/lib/utils";

export default function AdminAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<AdminAssignmentWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"publish" | "archive" | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssignment() {
      try {
        const data = await getAdminAssignmentById(id);
        if (active) setAssignment(data);
      } catch (error) {
        console.error("[admin/assignment/detail]", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAssignment();

    return () => {
      active = false;
    };
  }, [id]);

  async function handlePublish() {
    if (!assignment) return;

    setBusyAction("publish");
    try {
      const updated = await publishAssignment(assignment.id);
      setAssignment((current) =>
        current ? { ...current, status: updated.status } : current
      );
      toast.success(kk.assignments.publishSuccess);
    } catch (error) {
      console.error("[admin/assignment/publish]", error);
      toast.error(kk.assignments.createError);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleArchive() {
    if (!assignment) return;

    setBusyAction("archive");
    try {
      const updated = await archiveAssignment(assignment.id);
      setAssignment((current) =>
        current ? { ...current, status: updated.status } : current
      );
      toast.success(kk.assignments.archiveSuccess);
    } catch (error) {
      console.error("[admin/assignment/archive]", error);
      toast.error(kk.assignments.createError);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/assignments"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {kk.assignments.backToList}
      </Link>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl bg-[var(--duo-white)] ring-1 ring-[var(--duo-border)]"
            />
          ))}
        </div>
      ) : assignment ? (
        <AdminAssignmentDetail
          assignment={assignment}
          busyAction={busyAction}
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      ) : (
        <div className="card-duo py-12 text-center text-sm text-[var(--duo-text-secondary)]">
          {kk.errors.notFound}
        </div>
      )}
    </div>
  );
}
