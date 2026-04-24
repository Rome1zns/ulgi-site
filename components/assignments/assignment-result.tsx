"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssignmentWithQuestions } from "@/lib/supabase/queries/assignments";
import { getMyAssignmentSubmissionWithAnswers } from "@/lib/supabase/queries/assignment-submissions";
import { kk } from "@/lib/locale/kk";
import { Badge } from "@/components/ui/badge";

function getStatusLabel(status?: string) {
  if (status === "reviewed") return kk.assignments.reviewed;
  if (status === "auto_checked") return kk.assignments.autoChecked;
  if (status === "submitted") return kk.assignments.submitted;
  return kk.assignments.notStarted;
}

export function AssignmentResult() {
  const params = useParams();
  const assignmentId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [assignment, setAssignment] = useState<Awaited<ReturnType<typeof getAssignmentWithQuestions>> | null>(null);
  const [submission, setSubmission] = useState<Awaited<ReturnType<typeof getMyAssignmentSubmissionWithAnswers>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assignmentId) return;

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const [assignmentData, submissionData] = await Promise.all([
          getAssignmentWithQuestions(assignmentId),
          getMyAssignmentSubmissionWithAnswers(assignmentId),
        ]);

        if (!active) return;
        setAssignment(assignmentData);
        setSubmission(submissionData);
      } catch (err) {
        console.error("[assignment-result] error:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-xl bg-[var(--duo-border)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!assignment || !submission) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm font-semibold text-[var(--duo-text-secondary)]">
          {submission ? kk.assignments.createError : kk.assignments.noSubmissions}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">{assignment.title}</h1>
          <Badge className="bg-[var(--duo-green-bg)] text-[var(--duo-green)]">{getStatusLabel(submission.status)}</Badge>
        </div>
        {assignment.description ? (
          <p className="text-sm text-[var(--duo-text-secondary)]">{assignment.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.autoScore}</p>
          <p className="text-xl font-bold">{submission.auto_score}</p>
        </div>
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.finalScore}</p>
          <p className="text-xl font-bold">{submission.final_score}</p>
        </div>
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.questions}</p>
          <p className="text-xl font-bold">{submission.total_questions}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.submissionDate}</p>
          <p className="mt-2 text-sm">{submission.created_at ? new Date(submission.created_at).toLocaleString("kk-KZ") : kk.assignments.createError}</p>
        </div>
        {submission.reviewed_at ? (
          <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.reviewedAt}</p>
            <p className="mt-2 text-sm">{new Date(submission.reviewed_at).toLocaleString("kk-KZ")}</p>
          </div>
        ) : null}
      </div>

      {submission.admin_feedback ? (
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.adminFeedback}</p>
          <p className="mt-2 text-sm">{submission.admin_feedback}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {assignment.questions.map((question, index) => {
          const answer = submission.answers.find((item) => item.question_id === question.id);
          const selectedOption = question.options.find((option) => option.id === answer?.selected_option_id);
          return (
            <div key={question.id} className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-white)] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">{kk.assignments.question} {index + 1}</p>
                  <p className="font-semibold text-[var(--duo-text)]">{question.question_text}</p>
                </div>
                <Badge className={`px-3 ${answer?.is_correct ? "bg-[var(--duo-green-bg)] text-[var(--duo-green)]" : "bg-[var(--duo-red-bg)] text-[var(--duo-red)]"}`}>
                  {answer?.is_correct ? kk.assignments.correct : kk.assignments.incorrect}
                </Badge>
              </div>
              <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-3">
                <p className="text-sm">
                  <span className="font-semibold">{selectedOption?.label}. </span>
                  <span>{selectedOption?.option_text ?? kk.assignments.createError}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}