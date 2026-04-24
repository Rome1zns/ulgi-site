import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifySupabaseAuth } from "@/lib/supabase/verify-request";

interface ReviewRequestBody {
  submissionId: string;
  finalScore: number;
  adminFeedback?: string | null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isReviewRequestBody(value: unknown): value is ReviewRequestBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  const feedback = body.adminFeedback;

  return isNonEmptyString(body.submissionId)
    && typeof body.finalScore === "number"
    && Number.isInteger(body.finalScore)
    && (feedback === undefined || feedback === null || typeof feedback === "string");
}

export async function POST(request: Request) {
  const auth = await verifySupabaseAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "admin_only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isReviewRequestBody(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const submissionId = body.submissionId.trim();
  const finalScore = body.finalScore;
  const adminFeedback = body.adminFeedback?.trim() || null;

  if (finalScore < 0) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
  }

  if (adminFeedback && adminFeedback.length > 1000) {
    return NextResponse.json({ error: "feedback_too_long" }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabaseAdmin
    .from("assignment_submissions")
    .select("id, total_questions")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    console.error("[assignments/review] submission lookup:", submissionError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!submission) {
    return NextResponse.json({ error: "submission_not_found" }, { status: 404 });
  }

  if (finalScore > submission.total_questions) {
    return NextResponse.json({ error: "invalid_score" }, { status: 400 });
  }

  const reviewedAt = new Date().toISOString();

  const { data: updatedSubmission, error: updateError } = await supabaseAdmin
    .from("assignment_submissions")
    .update({
      status: "reviewed",
      final_score: finalScore,
      admin_feedback: adminFeedback,
      reviewed_by: auth.userId,
      reviewed_at: reviewedAt,
    })
    .eq("id", submissionId)
    .select("id, status, final_score, admin_feedback, reviewed_at")
    .single();

  if (updateError) {
    console.error("[assignments/review] submission update:", updateError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({
    submissionId: updatedSubmission.id,
    finalScore: updatedSubmission.final_score,
    status: updatedSubmission.status,
    adminFeedback: updatedSubmission.admin_feedback,
    reviewedAt: updatedSubmission.reviewed_at,
  });
}
