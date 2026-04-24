"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSIGNMENT_CATEGORIES } from "@/lib/constants";
import { kk } from "@/lib/locale/kk";
import { cn } from "@/lib/utils";
import type { AdminAssignmentWithQuestions } from "@/lib/supabase/queries/assignments";

interface AdminAssignmentDetailProps {
  assignment: AdminAssignmentWithQuestions;
  busyAction?: "publish" | "archive" | null;
  onPublish: () => Promise<void> | void;
  onArchive: () => Promise<void> | void;
}

function getCategoryLabel(category: AdminAssignmentWithQuestions["category"]) {
  return ASSIGNMENT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

function getStatusLabel(status: AdminAssignmentWithQuestions["status"]) {
  if (status === "draft") return kk.assignments.draft;
  if (status === "published") return kk.assignments.published;
  return kk.assignments.archived;
}

function getStatusClassName(status: AdminAssignmentWithQuestions["status"]) {
  if (status === "published") {
    return "bg-[var(--duo-green-bg)] text-[var(--duo-green)]";
  }
  if (status === "archived") {
    return "bg-[var(--duo-orange-bg)] text-[var(--duo-orange)]";
  }

  return "bg-[var(--duo-bg)] text-[var(--duo-text-secondary)]";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("kk-KZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminAssignmentDetail({
  assignment,
  busyAction,
  onPublish,
  onArchive,
}: AdminAssignmentDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-[var(--duo-border)]">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-[var(--duo-text)]">
                {assignment.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("border-0", getStatusClassName(assignment.status))}>
                  {getStatusLabel(assignment.status)}
                </Badge>
                <Badge variant="secondary">{getCategoryLabel(assignment.category)}</Badge>
                <Badge variant="outline">{assignment.target_class_name}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/assignments/${assignment.id}/submissions`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {kk.assignments.viewSubmissions}
              </Link>
              {assignment.status !== "published" ? (
                <Button size="sm" onClick={onPublish} disabled={busyAction === "publish"}>
                  {busyAction === "publish" ? kk.assignments.loading : kk.assignments.publish}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onArchive}
                  disabled={busyAction === "archive"}
                >
                  {busyAction === "archive" ? kk.assignments.loading : kk.assignments.archive}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
              {kk.assignments.descriptionField}
            </p>
            <p className="whitespace-pre-wrap text-sm text-[var(--duo-text)]">
              {assignment.description || "—"}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                {kk.assignments.createdAt}
              </p>
              <p className="text-sm text-[var(--duo-text)]">
                {formatDate(assignment.created_at)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--duo-text-secondary)]">
                {kk.assignments.questions}
              </p>
              <p className="text-sm text-[var(--duo-text)]">
                {assignment.questions.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {assignment.questions.length === 0 ? (
        <Card className="border-2 border-[var(--duo-border)]">
          <CardContent className="py-10 text-center text-sm text-[var(--duo-text-secondary)]">
            {kk.assignments.noAssignments}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignment.questions.map((question, index) => {
            const correctOption = question.options.find(
              (option) => option.id === question.answer_key?.correct_option_id
            );

            return (
              <Card key={question.id} className="border-2 border-[var(--duo-border)]">
                <CardHeader className="gap-2">
                  <CardTitle className="text-base font-semibold text-[var(--duo-text)]">
                    {kk.assignments.question} {index + 1}
                  </CardTitle>
                  <p className="whitespace-pre-wrap text-sm text-[var(--duo-text)]">
                    {question.question_text}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {question.options.map((option) => {
                      const isCorrect = option.id === question.answer_key?.correct_option_id;

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-sm",
                            isCorrect
                              ? "border-[var(--duo-green)] bg-[var(--duo-green-bg)]"
                              : "border-[var(--duo-border)] bg-[var(--duo-white)]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--duo-text)]">{option.label}</span>
                            {isCorrect ? (
                              <Badge className="border-0 bg-[var(--duo-green)] text-white">
                                {kk.assignments.correctAnswer}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-[var(--duo-text)]">{option.option_text}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-xl bg-[var(--duo-bg)] px-4 py-3 text-sm">
                    <span className="font-semibold text-[var(--duo-text-secondary)]">
                      {kk.assignments.correctAnswer}:
                    </span>{" "}
                    <span className="font-medium text-[var(--duo-text)]">
                      {correctOption
                        ? `${correctOption.label}. ${correctOption.option_text}`
                        : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
