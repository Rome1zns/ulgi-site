import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifySupabaseAuth } from "@/lib/supabase/verify-request";

interface SubmitAnswerPayload {
  questionId: string;
  selectedOptionId: string;
}

interface SubmitRequestBody {
  assignmentId: string;
  answers: SubmitAnswerPayload[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSubmitAnswerPayload(value: unknown): value is SubmitAnswerPayload {
  if (!value || typeof value !== "object") return false;

  const answer = value as Record<string, unknown>;
  return isNonEmptyString(answer.questionId) && isNonEmptyString(answer.selectedOptionId);
}

function isSubmitRequestBody(value: unknown): value is SubmitRequestBody {
  if (!value || typeof value !== "object") return false;

  const body = value as Record<string, unknown>;
  return isNonEmptyString(body.assignmentId)
    && Array.isArray(body.answers)
    && body.answers.every(isSubmitAnswerPayload);
}

export async function POST(request: Request) {
  const auth = await verifySupabaseAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (auth.role !== "student") {
    return NextResponse.json({ error: "only_students_can_submit" }, { status: 403 });
  }

  if (!auth.className) {
    return NextResponse.json({ error: "class_required" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isSubmitRequestBody(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const assignmentId = body.assignmentId.trim();
  const answers = body.answers.map((answer) => ({
    questionId: answer.questionId.trim(),
    selectedOptionId: answer.selectedOptionId.trim(),
  }));

  if (answers.length === 0) {
    return NextResponse.json({ error: "answers_required" }, { status: 400 });
  }

  const uniqueQuestionIds = new Set(answers.map((answer) => answer.questionId));
  if (uniqueQuestionIds.size !== answers.length) {
    return NextResponse.json({ error: "duplicate_answers" }, { status: 400 });
  }

  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .from("assignments")
    .select("id, status, target_class_name")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) {
    console.error("[assignments/submit] assignment lookup:", assignmentError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!assignment || assignment.status !== "published") {
    return NextResponse.json({ error: "assignment_not_found" }, { status: 404 });
  }

  if (assignment.target_class_name !== auth.className) {
    return NextResponse.json({ error: "wrong_class" }, { status: 403 });
  }

  const { data: existingSubmission, error: existingSubmissionError } = await supabaseAdmin
    .from("assignment_submissions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .eq("student_id", auth.userId)
    .maybeSingle();

  if (existingSubmissionError) {
    console.error("[assignments/submit] submission lookup:", existingSubmissionError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (existingSubmission) {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  const { data: questions, error: questionsError } = await supabaseAdmin
    .from("assignment_questions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .order("order_index", { ascending: true });

  if (questionsError) {
    console.error("[assignments/submit] questions lookup:", questionsError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const questionIds = (questions ?? []).map((question) => question.id);
  if (questionIds.length === 0) {
    return NextResponse.json({ error: "assignment_not_ready" }, { status: 500 });
  }

  if (answers.length !== questionIds.length) {
    return NextResponse.json({ error: "answers_incomplete" }, { status: 400 });
  }

  const questionIdSet = new Set(questionIds);
  if (answers.some((answer) => !questionIdSet.has(answer.questionId))) {
    return NextResponse.json({ error: "invalid_question" }, { status: 400 });
  }

  const { data: options, error: optionsError } = await supabaseAdmin
    .from("assignment_options")
    .select("id, question_id")
    .in("question_id", questionIds);

  if (optionsError) {
    console.error("[assignments/submit] options lookup:", optionsError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const optionMap = new Map((options ?? []).map((option) => [option.id, option.question_id]));

  const { data: answerKeys, error: answerKeysError } = await supabaseAdmin
    .from("assignment_answer_keys")
    .select("question_id, correct_option_id")
    .in("question_id", questionIds);

  if (answerKeysError) {
    console.error("[assignments/submit] answer key lookup:", answerKeysError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if ((answerKeys ?? []).length !== questionIds.length) {
    return NextResponse.json({ error: "assignment_not_ready" }, { status: 500 });
  }

  const answerKeyMap = new Map(
    (answerKeys ?? []).map((answerKey) => [answerKey.question_id, answerKey.correct_option_id])
  );

  const scoredAnswers = answers.map((answer) => {
    const optionQuestionId = optionMap.get(answer.selectedOptionId);
    if (!optionQuestionId || optionQuestionId !== answer.questionId) {
      return null;
    }

    return {
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
      is_correct: answerKeyMap.get(answer.questionId) === answer.selectedOptionId,
    };
  });

  if (scoredAnswers.some((answer) => answer === null)) {
    return NextResponse.json({ error: "invalid_option" }, { status: 400 });
  }

  const normalizedAnswers = scoredAnswers.filter(
    (
      answer
    ): answer is {
      question_id: string;
      selected_option_id: string;
      is_correct: boolean;
    } => answer !== null
  );

  const totalQuestions = questionIds.length;
  const autoScore = normalizedAnswers.filter((answer) => answer.is_correct).length;

  const { data: submission, error: submissionError } = await supabaseAdmin
    .from("assignment_submissions")
    .insert({
      assignment_id: assignmentId,
      student_id: auth.userId,
      status: "auto_checked",
      total_questions: totalQuestions,
      auto_score: autoScore,
      final_score: autoScore,
    })
    .select("id, status, auto_score, total_questions")
    .single();

  if (submissionError) {
    if (submissionError.code === "23505") {
      return NextResponse.json({ error: "already_submitted" }, { status: 409 });
    }

    console.error("[assignments/submit] submission insert:", submissionError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const { error: answersInsertError } = await supabaseAdmin
    .from("assignment_answers")
    .insert(
      normalizedAnswers.map((answer) => ({
        submission_id: submission.id,
        question_id: answer.question_id,
        selected_option_id: answer.selected_option_id,
        is_correct: answer.is_correct,
      }))
    );

  if (answersInsertError) {
    console.error("[assignments/submit] answers insert:", answersInsertError);

    const { error: rollbackError } = await supabaseAdmin
      .from("assignment_submissions")
      .delete()
      .eq("id", submission.id);

    if (rollbackError) {
      console.error("[assignments/submit] rollback submission delete:", rollbackError);
    }

    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({
    submissionId: submission.id,
    autoScore: submission.auto_score,
    totalQuestions: submission.total_questions,
    status: submission.status,
  });
}
