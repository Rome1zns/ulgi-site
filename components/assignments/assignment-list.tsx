"use client";

import { AssignmentCard } from "@/components/assignments/assignment-card";
import { kk } from "@/lib/locale/kk";
import type { AssignmentWithQuestionCount } from "@/lib/supabase/queries/assignments";
import type { SubmissionWithAssignment } from "@/lib/supabase/queries/assignment-submissions";

interface AssignmentListProps {
  assignments: AssignmentWithQuestionCount[];
  submissions: SubmissionWithAssignment[];
  role?: string | null;
}

export function AssignmentList({ assignments, submissions, role }: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <p className="py-12 text-center text-sm font-bold text-[var(--duo-text-secondary)]">
        {kk.assignments.noAssignments}
      </p>
    );
  }

  const submissionMap = new Map(submissions.map((submission) => [submission.assignment?.id, submission]));

  return (
    <div className="grid gap-4">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          submission={submissionMap.get(assignment.id)}
          role={role}
        />
      ))}
    </div>
  );
}