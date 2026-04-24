"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { kk } from "@/lib/locale/kk";
import type { AdminAssignmentSubmission } from "@/lib/supabase/queries/assignment-submissions";
import { AdminReviewDialog } from "@/components/assignments/admin-review-dialog";

interface AdminSubmissionsTableProps {
  submissions: AdminAssignmentSubmission[];
  onSubmissionUpdated: (
    submissionId: string,
    updates: {
      finalScore: number;
      adminFeedback: string | null;
      reviewedAt: string | null;
      status: "reviewed";
    }
  ) => void;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("kk-KZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusLabel(status: AdminAssignmentSubmission["status"]) {
  if (status === "reviewed") return kk.assignments.reviewed;
  if (status === "auto_checked") return kk.assignments.autoChecked;
  return kk.assignments.submitted;
}

function getStatusClassName(status: AdminAssignmentSubmission["status"]) {
  if (status === "reviewed") {
    return "bg-[var(--duo-green-bg)] text-[var(--duo-green)]";
  }
  if (status === "auto_checked") {
    return "bg-[var(--duo-blue-bg)] text-[var(--duo-blue)]";
  }

  return "bg-[var(--duo-bg)] text-[var(--duo-text-secondary)]";
}

function getStudentName(submission: AdminAssignmentSubmission) {
  if (submission.student?.full_name) return submission.student.full_name;
  if (submission.student?.username) return `@${submission.student.username}`;
  return "—";
}

export function AdminSubmissionsTable({
  submissions,
  onSubmissionUpdated,
}: AdminSubmissionsTableProps) {
  if (submissions.length === 0) {
    return (
      <Card className="border-2 border-[var(--duo-border)]">
        <CardContent className="py-12 text-center text-sm text-[var(--duo-text-secondary)]">
          {kk.assignments.noSubmissions}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {submissions.map((submission) => (
          <Card key={submission.id} className="border-2 border-[var(--duo-border)]">
            <CardContent className="space-y-4 !px-4 !py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--duo-text)]">
                    {getStudentName(submission)}
                  </p>
                  <p className="text-xs text-[var(--duo-text-secondary)]">
                    @{submission.student?.username ?? "—"}
                  </p>
                </div>
                <Badge className={getStatusClassName(submission.status)}>
                  {getStatusLabel(submission.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-[var(--duo-text-secondary)]">
                    {kk.assignments.autoScore}
                  </p>
                  <p className="font-medium text-[var(--duo-text)]">
                    {submission.auto_score}/{submission.total_questions}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--duo-text-secondary)]">
                    {kk.assignments.finalScore}
                  </p>
                  <p className="font-medium text-[var(--duo-text)]">
                    {submission.final_score ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--duo-text-secondary)]">
                    {kk.assignments.createdAt}
                  </p>
                  <p className="font-medium text-[var(--duo-text)]">
                    {formatDate(submission.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--duo-text-secondary)]">
                    {kk.assignments.reviewedAt}
                  </p>
                  <p className="font-medium text-[var(--duo-text)]">
                    {formatDate(submission.reviewed_at)}
                  </p>
                </div>
              </div>

              {submission.admin_feedback ? (
                <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3 text-sm text-[var(--duo-text)]">
                  <span className="font-semibold text-[var(--duo-text-secondary)]">
                    {kk.assignments.adminFeedback}:
                  </span>{" "}
                  {submission.admin_feedback}
                </div>
              ) : null}

              <AdminReviewDialog
                submissionId={submission.id}
                onReviewed={(result) =>
                  onSubmissionUpdated(submission.id, {
                    finalScore: result.finalScore,
                    adminFeedback: result.adminFeedback,
                    reviewedAt: result.reviewedAt,
                    status: result.status,
                  })
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border-2 border-[var(--duo-border)] bg-[var(--duo-white)] md:block">
        <table className="w-full text-sm">
          <thead className="bg-[var(--duo-bg)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.admin.users}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.autoScore}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.finalScore}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.status}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.feedback}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.createdAt}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.reviewedAt}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.review}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--duo-border)]">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[var(--duo-text)]">
                      {getStudentName(submission)}
                    </p>
                    <p className="text-xs text-[var(--duo-text-secondary)]">
                      @{submission.student?.username ?? "—"}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--duo-text)]">
                  {submission.auto_score}/{submission.total_questions}
                </td>
                <td className="px-4 py-3 text-[var(--duo-text)]">
                  {submission.final_score ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusClassName(submission.status)}>
                    {getStatusLabel(submission.status)}
                  </Badge>
                </td>
                <td className="max-w-[220px] px-4 py-3 text-[var(--duo-text-secondary)]">
                  <span className="line-clamp-2">{submission.admin_feedback || "—"}</span>
                </td>
                <td className="px-4 py-3 text-[var(--duo-text-secondary)]">
                  {formatDate(submission.created_at)}
                </td>
                <td className="px-4 py-3 text-[var(--duo-text-secondary)]">
                  {formatDate(submission.reviewed_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminReviewDialog
                    submissionId={submission.id}
                    onReviewed={(result) =>
                      onSubmissionUpdated(submission.id, {
                        finalScore: result.finalScore,
                        adminFeedback: result.adminFeedback,
                        reviewedAt: result.reviewedAt,
                        status: result.status,
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
