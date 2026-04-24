import Link from "next/link";
import { AdminAssignmentForm } from "@/components/assignments/admin-assignment-form";
import { buttonVariants } from "@/components/ui/button";
import { kk } from "@/lib/locale/kk";
import { cn } from "@/lib/utils";

export default function NewAdminAssignmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">
            {kk.assignments.new}
          </h1>
        </div>
        <Link
          href="/admin/assignments"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {kk.assignments.backToList}
        </Link>
      </div>

      <AdminAssignmentForm />
    </div>
  );
}
