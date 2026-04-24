"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { kk } from "@/lib/locale/kk";
import type { AssignmentWithQuestionCount } from "@/lib/supabase/queries/assignments";
import type { SubmissionWithAssignment } from "@/lib/supabase/queries/assignment-submissions";

interface AssignmentCardProps {
  assignment: AssignmentWithQuestionCount;
  submission?: SubmissionWithAssignment | null;
  role?: string | null;
}

function getSubmissionLabel(status?: string) {
  if (status === "reviewed") return kk.assignments.reviewed;
  if (status === "auto_checked") return kk.assignments.autoChecked;
  if (status === "submitted") return kk.assignments.submitted;
  return kk.assignments.notStarted;
}

function getStatusBadge(status: string) {
  if (status === "published") return "bg-[var(--duo-green-bg)] text-[var(--duo-green)]";
  if (status === "draft") return "bg-[var(--duo-orange-bg)] text-[var(--duo-orange)]";
  return "bg-[var(--duo-border)] text-[var(--duo-text-secondary)]";
}

export function AssignmentCard({ assignment, submission, role }: AssignmentCardProps) {
  const questionCount = assignment.assignment_questions?.length ?? 0;
  const isStudent = role === "student";
  const assignmentId = assignment.id;

  const actionLabel = submission
    ? kk.assignments.viewResult
    : isStudent
    ? kk.assignments.start
    : kk.assignments.view;

  const actionHref = submission
    ? `/assignments/${assignmentId}/result`
    : `/assignments/${assignmentId}`;

  return (
    <Card className="space-y-4">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <Badge className={getStatusBadge(assignment.status)}>{kk.assignments.published}</Badge>
          </div>
          {assignment.description ? (
            <p className="text-sm text-[var(--duo-text-secondary)] line-clamp-3">{assignment.description}</p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">
              {kk.assignments.category}
            </p>
            <p className="font-semibold">{assignment.category}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">
              {kk.assignments.class}
            </p>
            <p className="font-semibold">{assignment.target_class_name}</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.questions}</p>
            <p className="font-semibold">{questionCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.status}</p>
            <p className="font-semibold">{getSubmissionLabel(submission?.status)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[var(--duo-text-secondary)]">
          {submission ? kk.assignments.alreadySubmitted : kk.assignments.notStarted}
        </div>
        <Link
          href={actionHref}
          className="inline-flex rounded-lg bg-[var(--duo-green)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--duo-green-dark)]"
        >
          {actionLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}