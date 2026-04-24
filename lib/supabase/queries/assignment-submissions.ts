import { supabase } from "@/lib/supabase/client";
import type {
  Assignment,
  AssignmentAnswer,
  AssignmentOption,
  AssignmentSubmission,
  Profile,
} from "@/types/db";
import {
  getAdminAssignmentById,
  type AdminAssignmentWithQuestions,
} from "@/lib/supabase/queries/assignments";

const MY_SUBMISSION_SELECT = `
  *,
  assignment:assignments (
    id,
    title,
    description,
    category,
    target_class_name,
    status,
    created_by,
    created_at,
    updated_at
  )
`;

const ADMIN_SUBMISSION_SELECT = `
  *,
  assignment:assignments (
    id,
    title,
    description,
    category,
    target_class_name,
    status,
    created_by,
    created_at,
    updated_at
  ),
  student:profiles (
    id,
    username,
    full_name,
    avatar_url,
    class_name,
    role
  )
`;

export interface SubmissionAnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitAssignmentResult {
  submissionId: string;
  autoScore: number;
  totalQuestions: number;
  status: "auto_checked";
}

export interface ReviewAssignmentSubmissionInput {
  finalScore: number;
  adminFeedback?: string | null;
}

export interface SubmissionWithAssignment extends AssignmentSubmission {
  assignment: Assignment | null;
}

export interface AdminAssignmentSubmission extends AssignmentSubmission {
  assignment: Assignment | null;
  student: Pick<
    Profile,
    "id" | "username" | "full_name" | "avatar_url" | "class_name" | "role"
  > | null;
}

export interface AdminSubmissionReviewAnswer {
  questionId: string;
  questionText: string;
  orderIndex: number;
  selectedOption: AssignmentOption | null;
  correctOption: AssignmentOption | null;
  isCorrect: boolean;
}

export interface AdminSubmissionReviewData {
  submission: AdminAssignmentSubmission;
  assignment: AdminAssignmentWithQuestions;
  answers: AdminSubmissionReviewAnswer[];
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("unauthorized");
  }

  return accessToken;
}

export async function getMyAssignmentSubmission(
  assignmentId: string
): Promise<SubmissionWithAssignment | null> {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select(MY_SUBMISSION_SELECT)
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  if (error) throw error;
  return (data as SubmissionWithAssignment | null) ?? null;
}

export async function getMyAssignmentSubmissions(): Promise<SubmissionWithAssignment[]> {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select(MY_SUBMISSION_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as SubmissionWithAssignment[] | null) ?? [];
}

export async function getAdminAssignmentSubmissions(
  assignmentId: string
): Promise<AdminAssignmentSubmission[]> {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select(ADMIN_SUBMISSION_SELECT)
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AdminAssignmentSubmission[] | null) ?? [];
}

export async function getAdminSubmissionById(
  submissionId: string
): Promise<AdminAssignmentSubmission | null> {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select(ADMIN_SUBMISSION_SELECT)
    .eq("id", submissionId)
    .maybeSingle();

  if (error) throw error;
  return (data as AdminAssignmentSubmission | null) ?? null;
}

export async function getSubmissionAnswers(
  submissionId: string
): Promise<AssignmentAnswer[]> {
  const { data, error } = await supabase
    .from("assignment_answers")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export interface SubmissionWithAnswers extends SubmissionWithAssignment {
  answers: AssignmentAnswer[];
}

export async function getMyAssignmentSubmissionWithAnswers(
  assignmentId: string
): Promise<SubmissionWithAnswers | null> {
  const submission = await getMyAssignmentSubmission(assignmentId);
  if (!submission || !submission.id) return null;

  const answers = await getSubmissionAnswers(submission.id);
  return { ...submission, answers };
}

export async function submitAssignment(
  assignmentId: string,
  answers: SubmissionAnswerInput[]
): Promise<SubmitAssignmentResult> {
  const accessToken = await getAccessToken();

  const response = await fetch("/api/assignments/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignmentId,
      answers,
    }),
  });

  const payload = (await response.json()) as SubmitAssignmentResult & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "submit_failed");
  }

  return payload;
}

export async function reviewAssignmentSubmission(
  submissionId: string,
  input: ReviewAssignmentSubmissionInput
) {
  const accessToken = await getAccessToken();

  const response = await fetch("/api/assignments/review", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submissionId,
      finalScore: input.finalScore,
      adminFeedback: input.adminFeedback ?? null,
    }),
  });

  const payload = (await response.json()) as {
    submissionId?: string;
    finalScore?: number;
    status?: "reviewed";
    reviewedAt?: string | null;
    adminFeedback?: string | null;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "review_failed");
  }

  return payload;
}

export async function getAdminSubmissionReviewData(
  submissionId: string
): Promise<AdminSubmissionReviewData | null> {
  const submission = await getAdminSubmissionById(submissionId);
  if (!submission?.assignment) return null;

  const assignment = await getAdminAssignmentById(submission.assignment.id);
  if (!assignment) return null;

  const answers = await getSubmissionAnswers(submissionId);
  const answerMap = new Map(answers.map((answer) => [answer.question_id, answer]));

  return {
    submission,
    assignment,
    answers: assignment.questions.map((question) => {
      const answer = answerMap.get(question.id) ?? null;
      const selectedOption =
        question.options.find((option) => option.id === answer?.selected_option_id) ?? null;
      const correctOption =
        question.options.find(
          (option) => option.id === question.answer_key?.correct_option_id
        ) ?? null;

      return {
        questionId: question.id,
        questionText: question.question_text,
        orderIndex: question.order_index,
        selectedOption,
        correctOption,
        isCorrect: answer?.is_correct ?? false,
      };
    }),
  };
}
