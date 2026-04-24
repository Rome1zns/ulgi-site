"use client";

import { useEffect, useState } from "react";
import { getPublishedAssignments } from "@/lib/supabase/queries/assignments";
import { getMyAssignmentSubmissions } from "@/lib/supabase/queries/assignment-submissions";
import { useAuth } from "@/lib/contexts/auth-context";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { kk } from "@/lib/locale/kk";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Awaited<ReturnType<typeof getPublishedAssignments>>>([]);
  const [submissions, setSubmissions] = useState<Awaited<ReturnType<typeof getMyAssignmentSubmissions>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    setLoading(true);
    setError(false);

    (async () => {
      try {
        const [assignmentsData, submissionsData] = await Promise.all([
          getPublishedAssignments(profile?.role === "student" ? profile?.class_name ?? undefined : undefined),
          getMyAssignmentSubmissions(),
        ]);

        if (!active) return;
        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
      } catch (err) {
        console.error("[assignments] error:", err);
        if (!active) setError(true);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, profile?.class_name, profile?.role]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm font-semibold text-[var(--duo-text-secondary)]">
          {kk.assignments.createError}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">{kk.assignments.title}</h1>
          <p className="text-sm text-[var(--duo-text-secondary)]">{kk.assignments.allAssignments}</p>
        </div>
      </div>

      <AssignmentList assignments={assignments} submissions={submissions} role={profile?.role ?? null} />
    </div>
  );
}