"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ASSIGNMENT_CATEGORIES } from "@/lib/constants";
import { kk } from "@/lib/locale/kk";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types/db";

interface AdminAssignmentsTableProps {
  assignments: Assignment[];
  busyId?: string | null;
  onPublish: (id: string) => Promise<void> | void;
  onArchive: (id: string) => Promise<void> | void;
}

function getCategoryLabel(value: Assignment["category"]) {
  return ASSIGNMENT_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function getStatusLabel(status: Assignment["status"]) {
  if (status === "draft") return kk.assignments.draft;
  if (status === "published") return kk.assignments.published;
  return kk.assignments.archived;
}

function getStatusClassName(status: Assignment["status"]) {
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
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function AdminAssignmentsTable({
  assignments,
  busyId,
  onPublish,
  onArchive,
}: AdminAssignmentsTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="card-duo py-12 text-center">
        <p className="text-sm font-medium text-[var(--duo-text-secondary)]">
          {kk.assignments.noAssignments}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {assignments.map((assignment) => {
          const isBusy = busyId === assignment.id;
          const actionLabel =
            assignment.status === "published" ? kk.assignments.archive : kk.assignments.publish;

          return (
            <div key={assignment.id} className="card-duo space-y-4 !p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[var(--duo-text)]">
                    {assignment.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--duo-text-secondary)]">
                    {formatDate(assignment.created_at)}
                  </p>
                </div>
                <Badge className={cn("border-0", getStatusClassName(assignment.status))}>
                  {getStatusLabel(assignment.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-[var(--duo-text-secondary)]">
                    {kk.assignments.category}
                  </p>
                  <p className="font-medium text-[var(--duo-text)]">
                    {getCategoryLabel(assignment.category)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--duo-text-secondary)]">
                    {kk.assignments.class}
                  </p>
                  <p className="font-medium text-[var(--duo-text)]">
                    {assignment.target_class_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/assignments/${assignment.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {kk.assignments.open}
                </Link>
                <Button
                  size="sm"
                  onClick={() =>
                    assignment.status === "published"
                      ? onArchive(assignment.id)
                      : onPublish(assignment.id)
                  }
                  disabled={isBusy}
                >
                  {isBusy ? kk.assignments.loading : actionLabel}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border-2 border-[var(--duo-border)] bg-[var(--duo-white)] md:block">
        <table className="w-full text-sm">
          <thead className="bg-[var(--duo-bg)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.titleField}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.category}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.class}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.status}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.createdAt}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--duo-text-secondary)]">
                {kk.assignments.open}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--duo-border)]">
            {assignments.map((assignment) => {
              const isBusy = busyId === assignment.id;
              const actionLabel =
                assignment.status === "published"
                  ? kk.assignments.archive
                  : kk.assignments.publish;

              return (
                <tr key={assignment.id}>
                  <td className="px-4 py-3 font-medium text-[var(--duo-text)]">
                    {assignment.title}
                  </td>
                  <td className="px-4 py-3 text-[var(--duo-text)]">
                    {getCategoryLabel(assignment.category)}
                  </td>
                  <td className="px-4 py-3 text-[var(--duo-text)]">
                    {assignment.target_class_name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("border-0", getStatusClassName(assignment.status))}>
                      {getStatusLabel(assignment.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--duo-text-secondary)]">
                    {formatDate(assignment.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/assignments/${assignment.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        {kk.assignments.open}
                      </Link>
                      <Button
                        size="sm"
                        onClick={() =>
                          assignment.status === "published"
                            ? onArchive(assignment.id)
                            : onPublish(assignment.id)
                        }
                        disabled={isBusy}
                      >
                        {isBusy ? kk.assignments.loading : actionLabel}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
