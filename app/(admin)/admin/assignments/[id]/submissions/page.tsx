"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminSubmissionsTable } from "@/components/assignments/admin-submissions-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { kk } from "@/lib/locale/kk";
import {
  getAdminAssignmentSubmissions,
  type AdminAssignmentSubmission,
} from "@/lib/supabase/queries/assignment-submissions";
import {
  getAdminAssignmentById,
  type AdminAssignmentWithQuestions,
} from "@/lib/supabase/queries/assignments";
import { cn } from "@/lib/utils";

function getStatusLabel(status: NonNullable<AdminAssignmentWithQuestions>["status"]) {
  if (status === "draft") return kk.assignments.draft;
  if (status === "published") return kk.assignments.published;
  return kk.assignments.archived;
}

export default function AdminAssignmentSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<AdminAssignmentWithQuestions | null>(null);
  const [submissions, setSubmissions] = useState<AdminAssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [assignmentData, submissionData] = await Promise.all([
          getAdminAssignmentById(id),
          getAdminAssignmentSubmissions(id),
        ]);

        if (!active) return;
        setAssignment(assignmentData);
        setSubmissions(submissionData as AdminAssignmentSubmission[]);
      } catch (error) {
        console.error("[admin/assignment/submissions]", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href={`/admin/assignments/${id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {kk.assignments.backToAssignment}
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">
            {kk.assignments.submissions}
          </h1>
          {assignment ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{assignment.title}</Badge>
              <Badge variant="outline">{assignment.target_class_name}</Badge>
              <Badge variant="outline">{getStatusLabel(assignment.status)}</Badge>
            </div>
          ) : null}
        </div>
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
      ) : assignment ? (
        <AdminSubmissionsTable
          submissions={submissions}
          onSubmissionUpdated={(submissionId, updates) =>
            setSubmissions((current) =>
              current.map((submission) =>
                submission.id === submissionId
                  ? {
                      ...submission,
                      final_score: updates.finalScore,
                      admin_feedback: updates.adminFeedback,
                      reviewed_at: updates.reviewedAt,
                      status: updates.status,
                    }
                  : submission
              )
            )
          }
        />
      ) : (
        <div className="card-duo py-12 text-center text-sm text-[var(--duo-text-secondary)]">
          {kk.errors.notFound}
        </div>
      )}
    </div>
  );
}
