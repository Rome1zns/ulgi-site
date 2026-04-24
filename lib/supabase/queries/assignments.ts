import {
  CLASS_NAMES,
  type AssignmentCategory,
  type AssignmentStatus,
  type ClassName,
} from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type {
  Assignment,
  AssignmentAnswerKey,
  AssignmentOption,
  AssignmentQuestion,
} from "@/types/db";

const QUESTION_WITH_OPTIONS_SELECT = `
  id,
  assignment_id,
  question_text,
  order_index,
  created_at,
  options:assignment_options (
    id,
    question_id,
    label,
    option_text,
    order_index,
    created_at
  )
`;

export type OptionLabel = "A" | "B" | "C" | "D";

export interface AssignmentQuestionWithOptions extends AssignmentQuestion {
  options: AssignmentOption[];
}

export interface AdminAssignmentQuestion extends AssignmentQuestionWithOptions {
  answer_key: AssignmentAnswerKey | null;
}

export interface AssignmentWithQuestionCount extends Assignment {
  assignment_questions?: { id: string }[];
}

export interface AssignmentWithQuestions extends Assignment {
  questions: AssignmentQuestionWithOptions[];
}

export interface AdminAssignmentWithQuestions extends Assignment {
  questions: AdminAssignmentQuestion[];
}

export interface CreateAssignmentInput {
  title: string;
  description?: string | null;
  category: AssignmentCategory;
  target_class_name: ClassName;
  created_by: string;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string | null;
  category?: AssignmentCategory;
  target_class_name?: ClassName;
  status?: AssignmentStatus;
}

export interface CreateAssignmentQuestionInput {
  assignment_id: string;
  question_text: string;
  order_index?: number;
}

export interface UpdateAssignmentQuestionInput {
  question_text?: string;
  order_index?: number;
}

export interface CreateAssignmentOptionInput {
  question_id: string;
  label: OptionLabel;
  option_text: string;
  order_index?: number;
}

export interface UpdateAssignmentOptionInput {
  label?: OptionLabel;
  option_text?: string;
  order_index?: number;
}

export interface CreateAssignmentDraftOptionInput {
  label: OptionLabel;
  option_text: string;
  order_index?: number;
}

export interface CreateAssignmentDraftQuestionInput {
  question_text: string;
  order_index?: number;
  correct_label: OptionLabel;
  options: CreateAssignmentDraftOptionInput[];
}

export interface CreateAssignmentWithQuestionsInput extends CreateAssignmentInput {
  questions: CreateAssignmentDraftQuestionInput[];
}

function ensureClassName(className: string): ClassName {
  const normalizedClassName = className.trim();
  if (!(CLASS_NAMES as readonly string[]).includes(normalizedClassName)) {
    throw new Error("class_required");
  }

  return normalizedClassName as ClassName;
}

function ensureOptionLabel(label: string): OptionLabel {
  const normalizedLabel = label.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(normalizedLabel)) {
    throw new Error("option_label_invalid");
  }

  return normalizedLabel as OptionLabel;
}

async function getQuestionsWithOptions(
  assignmentId: string
): Promise<AssignmentQuestionWithOptions[]> {
  const { data, error } = await supabase
    .from("assignment_questions")
    .select(QUESTION_WITH_OPTIONS_SELECT)
    .eq("assignment_id", assignmentId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AssignmentQuestionWithOptions[];
}

export async function getPublishedAssignments(targetClassName?: string) {
  let query = supabase
    .from("assignments")
    .select("*, assignment_questions(id)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (targetClassName) {
    query = query.eq("target_class_name", targetClassName);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AssignmentWithQuestionCount[];
}

export async function getAssignmentById(id: string) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAssignmentWithQuestions(
  id: string
): Promise<AssignmentWithQuestions | null> {
  const assignment = await getAssignmentById(id);
  if (!assignment) return null;

  const questions = await getQuestionsWithOptions(id);
  return {
    ...assignment,
    questions,
  };
}

export async function getAdminAssignments() {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminAssignmentById(
  id: string
): Promise<AdminAssignmentWithQuestions | null> {
  const assignment = await getAssignmentById(id);
  if (!assignment) return null;

  const questions = await getQuestionsWithOptions(id);
  const questionIds = questions.map((question) => question.id);

  let answerKeyMap = new Map<string, AssignmentAnswerKey>();

  if (questionIds.length > 0) {
    const { data: answerKeys, error: answerKeysError } = await supabase
      .from("assignment_answer_keys")
      .select("*")
      .in("question_id", questionIds);

    if (answerKeysError) throw answerKeysError;
    answerKeyMap = new Map(
      (answerKeys ?? []).map((answerKey) => [answerKey.question_id, answerKey])
    );
  }

  return {
    ...assignment,
    questions: questions.map((question) => ({
      ...question,
      answer_key: answerKeyMap.get(question.id) ?? null,
    })),
  };
}

export async function createAssignment(input: CreateAssignmentInput) {
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      target_class_name: ensureClassName(input.target_class_name),
      created_by: input.created_by,
      status: input.status ?? "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssignment(id: string, input: UpdateAssignmentInput) {
  const updates: UpdateAssignmentInput = {};

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) {
    updates.description = input.description?.trim() || null;
  }
  if (input.category !== undefined) updates.category = input.category;
  if (input.target_class_name !== undefined) {
    updates.target_class_name = ensureClassName(input.target_class_name);
  }
  if (input.status !== undefined) updates.status = input.status;

  const { data, error } = await supabase
    .from("assignments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssignment(id: string) {
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

export async function createAssignmentQuestion(input: CreateAssignmentQuestionInput) {
  const { data, error } = await supabase
    .from("assignment_questions")
    .insert({
      assignment_id: input.assignment_id,
      question_text: input.question_text.trim(),
      order_index: input.order_index ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssignmentQuestion(
  id: string,
  input: UpdateAssignmentQuestionInput
) {
  const updates: UpdateAssignmentQuestionInput = {};

  if (input.question_text !== undefined) {
    updates.question_text = input.question_text.trim();
  }
  if (input.order_index !== undefined) updates.order_index = input.order_index;

  const { data, error } = await supabase
    .from("assignment_questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssignmentQuestion(id: string) {
  const { error } = await supabase
    .from("assignment_questions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createAssignmentOption(input: CreateAssignmentOptionInput) {
  const { data, error } = await supabase
    .from("assignment_options")
    .insert({
      question_id: input.question_id,
      label: ensureOptionLabel(input.label),
      option_text: input.option_text.trim(),
      order_index: input.order_index ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssignmentOption(
  id: string,
  input: UpdateAssignmentOptionInput
) {
  const updates: UpdateAssignmentOptionInput = {};

  if (input.label !== undefined) updates.label = ensureOptionLabel(input.label);
  if (input.option_text !== undefined) {
    updates.option_text = input.option_text.trim();
  }
  if (input.order_index !== undefined) updates.order_index = input.order_index;

  const { data, error } = await supabase
    .from("assignment_options")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssignmentOption(id: string) {
  const { error } = await supabase
    .from("assignment_options")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function setAssignmentAnswerKey(
  questionId: string,
  correctOptionId: string
) {
  const { data, error } = await supabase
    .from("assignment_answer_keys")
    .upsert(
      {
        question_id: questionId,
        correct_option_id: correctOptionId,
      },
      { onConflict: "question_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function publishAssignment(id: string) {
  return updateAssignment(id, { status: "published" });
}

export async function archiveAssignment(id: string) {
  return updateAssignment(id, { status: "archived" });
}

export async function createAssignmentWithQuestions(
  input: CreateAssignmentWithQuestionsInput
) {
  if (input.questions.length === 0) {
    throw new Error("question_required");
  }

  const assignment = await createAssignment({
    ...input,
    status: input.status ?? "draft",
  });

  try {
    for (const [questionIndex, question] of input.questions.entries()) {
      const questionText = question.question_text.trim();
      if (!questionText) {
        throw new Error("question_required");
      }

      const normalizedOptions = question.options
        .map((option, optionIndex) => ({
          label: ensureOptionLabel(option.label),
          option_text: option.option_text.trim(),
          order_index: option.order_index ?? optionIndex,
        }))
        .filter((option) => option.option_text.length > 0);

      if (normalizedOptions.length < 2) {
        throw new Error("option_required");
      }

      if (!normalizedOptions.some((option) => option.label === question.correct_label)) {
        throw new Error("correct_option_required");
      }

      const createdQuestion = await createAssignmentQuestion({
        assignment_id: assignment.id,
        question_text: questionText,
        order_index: question.order_index ?? questionIndex,
      });

      const { data: createdOptions, error: optionsError } = await supabase
        .from("assignment_options")
        .insert(
          normalizedOptions.map((option) => ({
            question_id: createdQuestion.id,
            label: option.label,
            option_text: option.option_text,
            order_index: option.order_index,
          }))
        )
        .select();

      if (optionsError) throw optionsError;

      const correctOption = (createdOptions ?? []).find(
        (option) => option.label === question.correct_label
      );

      if (!correctOption) {
        throw new Error("correct_option_required");
      }

      await setAssignmentAnswerKey(createdQuestion.id, correctOption.id);
    }

    return assignment;
  } catch (error) {
    try {
      await deleteAssignment(assignment.id);
    } catch (cleanupError) {
      console.error("[assignments] cleanup error:", cleanupError);
    }

    throw error;
  }
}
