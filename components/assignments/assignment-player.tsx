"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAssignmentWithQuestions } from "@/lib/supabase/queries/assignments";
import {
  getMyAssignmentSubmission,
  submitAssignment,
} from "@/lib/supabase/queries/assignment-submissions";
import { useAuth } from "@/lib/contexts/auth-context";
import { kk } from "@/lib/locale/kk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SelectedAnswers {
  [questionId: string]: string;
}

function getSubmissionLabel(status?: string) {
  if (status === "reviewed") return kk.assignments.reviewed;
  if (status === "auto_checked") return kk.assignments.autoChecked;
  if (status === "submitted") return kk.assignments.submitted;
  return kk.assignments.notStarted;
}

export function AssignmentPlayer() {
  const params = useParams();
  const assignmentId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [assignment, setAssignment] = useState<Awaited<ReturnType<typeof getAssignmentWithQuestions>> | null>(null);
  const [submission, setSubmission] = useState<Awaited<ReturnType<typeof getMyAssignmentSubmission>> | null>(null);
  const [answers, setAnswers] = useState<SelectedAnswers>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = profile?.role === "student";
  const hasSubmission = Boolean(submission?.id);

  useEffect(() => {
    if (authLoading || !assignmentId) return;

    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [assignmentData, submissionData] = await Promise.all([
          getAssignmentWithQuestions(assignmentId),
          getMyAssignmentSubmission(assignmentId),
        ]);

        if (!active) return;
        setAssignment(assignmentData);
        setSubmission(submissionData);
      } catch (err) {
        console.error("[assignment-player] error:", err);
        if (active) setError(kk.assignments.createError);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, assignmentId]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-xl bg-[var(--duo-border)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-semibold text-[var(--duo-text-secondary)]">{kk.assignments.createError}</p>
      </div>
    );
  }

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;
    if (!isStudent) {
      setError(kk.assignments.studentOnly);
      return;
    }

    if (assignment.questions.length !== Object.keys(answers).length) {
      setError(kk.assignments.answerAllQuestions);
      return;
    }

    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      await submitAssignment(
        assignmentId,
        assignment.questions.map((question) => ({
          questionId: question.id,
          selectedOptionId: answers[question.id],
        }))
      );
      router.push(`/assignments/${assignmentId}/result`);
    } catch (err) {
      console.error("[assignment-submit]", err);
      setError(
        err instanceof Error && err.message === "already_submitted"
          ? kk.assignments.alreadySubmitted
          : kk.assignments.createError
      );
      if (err instanceof Error && err.message === "already_submitted") {
        router.push(`/assignments/${assignmentId}/result`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">{assignment.title}</h1>
          <Badge className="bg-[var(--duo-green-bg)] text-[var(--duo-green)]">
            {kk.assignments.published}
          </Badge>
        </div>
        {assignment.description ? (
          <p className="text-sm text-[var(--duo-text-secondary)]">{assignment.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-[var(--duo-text-secondary)]">
          <span className="rounded-full border border-[var(--duo-border)] bg-[var(--duo-bg)] px-3 py-1">
            {kk.assignments.category}: {assignment.category}
          </span>
          <span className="rounded-full border border-[var(--duo-border)] bg-[var(--duo-bg)] px-3 py-1">
            {kk.assignments.class}: {assignment.target_class_name}
          </span>
          <span className="rounded-full border border-[var(--duo-border)] bg-[var(--duo-bg)] px-3 py-1">
            {kk.assignments.questions}: {assignment.questions.length}
          </span>
          {submission ? (
            <span className="rounded-full border border-[var(--duo-border)] bg-[var(--duo-bg)] px-3 py-1">
              {getSubmissionLabel(submission.status)}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {hasSubmission ? (
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-6 text-center">
          <p className="mb-4 text-base font-semibold text-[var(--duo-text)]">{kk.assignments.alreadySubmitted}</p>
          <Button onClick={() => router.push(`/assignments/${assignmentId}/result`)} className="bg-[var(--duo-green)]">
            {kk.assignments.viewResult}
          </Button>
        </div>
      ) : isStudent ? (
        <div className="space-y-6">
          {assignment.questions.map((question, questionIndex) => (
            <div key={question.id} className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-white)] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--duo-text-secondary)]">
                    {kk.assignments.question} {questionIndex + 1}
                  </p>
                  <p className="text-sm font-semibold text-[var(--duo-text)]">{question.question_text}</p>
                </div>
                <Badge className="bg-[var(--duo-bg)] text-[var(--duo-text-secondary)]">
                  {question.options.length} {kk.assignments.options}
                </Badge>
              </div>

              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className={`block cursor-pointer rounded-xl border px-4 py-3 transition ${
                      answers[question.id] === option.id
                        ? "border-[var(--duo-green)] bg-[var(--duo-green-bg)]"
                        : "border-[var(--duo-border)] bg-[var(--duo-white)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => handleSelect(question.id, option.id)}
                      className="mr-3 inline-block h-4 w-4"
                    />
                    <span className="font-semibold">{option.label}. </span>
                    <span>{option.option_text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--duo-text-secondary)]">{kk.assignments.answerAllQuestions}</p>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? kk.assignments.submitting : kk.assignments.submit}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--duo-border)] bg-[var(--duo-bg)] p-6 text-center">
          <p className="mb-4 text-base font-semibold text-[var(--duo-text)]">{kk.assignments.studentOnly}</p>
        </div>
      )}
    </div>
  );
}