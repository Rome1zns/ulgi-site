"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { kk } from "@/lib/locale/kk";
import {
  getAdminSubmissionReviewData,
  reviewAssignmentSubmission,
  type AdminSubmissionReviewData,
} from "@/lib/supabase/queries/assignment-submissions";

interface ReviewUpdatePayload {
  submissionId: string;
  finalScore: number;
  adminFeedback: string | null;
  reviewedAt: string | null;
  status: "reviewed";
}

interface AdminReviewDialogProps {
  submissionId: string;
  onReviewed?: (payload: ReviewUpdatePayload) => void;
}

function getScoreBadgeClass(isCorrect: boolean) {
  return isCorrect
    ? "bg-[var(--duo-green-bg)] text-[var(--duo-green)]"
    : "bg-[var(--duo-red-bg)] text-[var(--duo-red)]";
}

export function AdminReviewDialog({
  submissionId,
  onReviewed,
}: AdminReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AdminSubmissionReviewData | null>(null);
  const [finalScore, setFinalScore] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadReviewData() {
      setLoading(true);

      try {
        const reviewData = await getAdminSubmissionReviewData(submissionId);
        if (!active) return;

        setData(reviewData);
        setFinalScore(
          String(reviewData?.submission.final_score ?? reviewData?.submission.auto_score ?? 0)
        );
        setAdminFeedback(reviewData?.submission.admin_feedback ?? "");
      } catch (error) {
        console.error("[assignments/review-dialog]", error);
        if (active) {
          toast.error(kk.assignments.createError);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviewData();

    return () => {
      active = false;
    };
  }, [open, submissionId]);

  async function handleSave() {
    if (!data) return;

    const parsedScore = Number(finalScore);
    if (!Number.isInteger(parsedScore) || parsedScore < 0) {
      toast.error(kk.assignments.createError);
      return;
    }

    if (parsedScore > data.submission.total_questions) {
      toast.error(kk.assignments.createError);
      return;
    }

    setSaving(true);

    try {
      const result = await reviewAssignmentSubmission(submissionId, {
        finalScore: parsedScore,
        adminFeedback: adminFeedback.trim() || null,
      });

      toast.success(kk.assignments.reviewSaved);
      onReviewed?.({
        submissionId,
        finalScore: result.finalScore ?? parsedScore,
        adminFeedback: result.adminFeedback ?? null,
        reviewedAt: result.reviewedAt ?? null,
        status: "reviewed",
      });
      setOpen(false);
    } catch (error) {
      console.error("[assignments/review-save]", error);
      toast.error(kk.assignments.createError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" variant="outline" />}
      >
        {kk.assignments.review}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] !max-w-4xl overflow-hidden !rounded-[var(--radius-xl)] !border-2 !border-[var(--duo-border)] p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b border-[var(--duo-border)] px-6 py-5">
            <DialogTitle className="text-lg font-bold text-[var(--duo-text)]">
              {kk.assignments.review}
            </DialogTitle>
            <DialogDescription>
              {data?.submission.student?.full_name || data?.submission.student?.username || "—"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="py-10 text-center text-sm text-[var(--duo-text-secondary)]">
                {kk.assignments.loading}
              </div>
            ) : !data ? (
              <div className="py-10 text-center text-sm text-[var(--duo-text-secondary)]">
                {kk.assignments.createError}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                      {kk.assignments.autoScore}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--duo-text)]">
                      {data.submission.auto_score}/{data.submission.total_questions}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                      {kk.assignments.finalScore}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--duo-text)]">
                      {data.submission.final_score ?? data.submission.auto_score}/
                      {data.submission.total_questions}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                      {kk.assignments.status}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--duo-text)]">
                      {data.submission.status === "reviewed"
                        ? kk.assignments.reviewed
                        : data.submission.status === "auto_checked"
                          ? kk.assignments.autoChecked
                          : kk.assignments.submitted}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[var(--duo-text)]">
                    {kk.assignments.answers}
                  </h3>
                  {data.answers.map((answer, index) => (
                    <div
                      key={answer.questionId}
                      className="rounded-2xl border-2 border-[var(--duo-border)] bg-[var(--duo-white)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--duo-text)]">
                            {kk.assignments.question} {index + 1}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--duo-text)]">
                            {answer.questionText}
                          </p>
                        </div>
                        <Badge className={getScoreBadgeClass(answer.isCorrect)}>
                          {answer.isCorrect ? kk.assignments.correct : kk.assignments.incorrect}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                            {kk.assignments.answers}
                          </p>
                          <p className="mt-1 text-sm text-[var(--duo-text)]">
                            {answer.selectedOption
                              ? `${answer.selectedOption.label}. ${answer.selectedOption.option_text}`
                              : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                            {kk.assignments.correctAnswer}
                          </p>
                          <p className="mt-1 text-sm text-[var(--duo-text)]">
                            {answer.correctOption
                              ? `${answer.correctOption.label}. ${answer.correctOption.option_text}`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`final-score-${submissionId}`}>
                      {kk.assignments.finalScore}
                    </Label>
                    <Input
                      id={`final-score-${submissionId}`}
                      type="number"
                      min={0}
                      max={data.submission.total_questions}
                      value={finalScore}
                      onChange={(event) => setFinalScore(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`admin-feedback-${submissionId}`}>
                      {kk.assignments.adminFeedback}
                    </Label>
                    <Textarea
                      id={`admin-feedback-${submissionId}`}
                      value={adminFeedback}
                      onChange={(event) => setAdminFeedback(event.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="border-t border-[var(--duo-border)] bg-[var(--duo-white)] px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Жабу
            </Button>
            <Button onClick={handleSave} disabled={loading || saving || !data}>
              {saving ? kk.assignments.loading : kk.assignments.save}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
