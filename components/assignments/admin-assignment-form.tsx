"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSIGNMENT_CATEGORIES,
  CLASS_NAMES,
  type AssignmentCategory,
  type ClassName,
} from "@/lib/constants";
import { useAuth } from "@/lib/contexts/auth-context";
import { kk } from "@/lib/locale/kk";
import {
  createAssignmentWithQuestions,
  type OptionLabel,
} from "@/lib/supabase/queries/assignments";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface DraftQuestion {
  id: string;
  questionText: string;
  correctLabel: OptionLabel;
  options: Array<{
    label: OptionLabel;
    text: string;
  }>;
}

function createEmptyQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    questionText: "",
    correctLabel: "A",
    options: OPTION_LABELS.map((label) => ({
      label,
      text: "",
    })),
  };
}

export function AdminAssignmentForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AssignmentCategory>("testing");
  const [targetClassName, setTargetClassName] = useState<ClassName>(CLASS_NAMES[0]);
  const [questions, setQuestions] = useState<DraftQuestion[]>([createEmptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateQuestion(
    questionId: string,
    updater: (question: DraftQuestion) => DraftQuestion
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? updater(question) : question
      )
    );
  }

  function addQuestion() {
    setQuestions((current) => [...current, createEmptyQuestion()]);
  }

  function removeQuestion(questionId: string) {
    setQuestions((current) =>
      current.length === 1 ? current : current.filter((question) => question.id !== questionId)
    );
  }

  function validateForm() {
    if (!title.trim()) return kk.auth.requiredField;

    for (const question of questions) {
      if (!question.questionText.trim()) return kk.auth.requiredField;

      const filledOptions = question.options.filter((option) => option.text.trim().length > 0);
      if (filledOptions.length < 2) return kk.assignments.optionRequired;
      if (!filledOptions.some((option) => option.label === question.correctLabel)) {
        return kk.assignments.correctOptionMissing;
      }
    }

    return null;
  }

  function mapErrorMessage(message: string) {
    switch (message) {
      case "question_required":
        return kk.auth.requiredField;
      case "option_required":
        return kk.assignments.optionRequired;
      case "correct_option_required":
        return kk.assignments.correctOptionMissing;
      case "class_required":
        return kk.auth.requiredField;
      default:
        return message || kk.assignments.createError;
    }
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError(kk.errors.forbidden);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const assignment = await createAssignmentWithQuestions({
        title,
        description,
        category,
        target_class_name: targetClassName,
        created_by: user.id,
        status: "draft",
        questions: questions.map((question, questionIndex) => ({
          question_text: question.questionText,
          order_index: questionIndex,
          correct_label: question.correctLabel,
          options: question.options.map((option, optionIndex) => ({
            label: option.label,
            option_text: option.text,
            order_index: optionIndex,
          })),
        })),
      });

      toast.success(kk.assignments.saved);
      router.push(`/admin/assignments/${assignment.id}`);
    } catch (submitError) {
      console.error("[assignments/create]", submitError);
      let errMsg = "";
      if (submitError instanceof Error) {
        errMsg = submitError.message;
      } else if (submitError && typeof submitError === "object" && "message" in submitError) {
        errMsg = String(submitError.message);
      }
      
      const message = errMsg ? mapErrorMessage(errMsg) : kk.assignments.createError;
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[var(--duo-border)]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[var(--duo-text)]">
            {kk.assignments.create}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assignment-title">{kk.assignments.titleField}</Label>
              <Input
                id="assignment-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={kk.assignments.titleField}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assignment-description">{kk.assignments.descriptionField}</Label>
              <Textarea
                id="assignment-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={kk.assignments.descriptionField}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{kk.assignments.category}</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as AssignmentCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={kk.assignments.category} />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_CATEGORIES.map((assignmentCategory) => (
                    <SelectItem key={assignmentCategory.value} value={assignmentCategory.value}>
                      {assignmentCategory.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{kk.assignments.class}</Label>
              <Select
                value={targetClassName}
                onValueChange={(value) => setTargetClassName(value as ClassName)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={kk.assignments.class} />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_NAMES.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--duo-text)]">
            {kk.assignments.questions}
          </h2>
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="h-4 w-4" />
            {kk.assignments.addQuestion}
          </Button>
        </div>

        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="border-2 border-[var(--duo-border)]">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-[var(--duo-text)]">
                {kk.assignments.question} {questionIndex + 1}
              </CardTitle>
              {questions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeQuestion(question.id)}
                  aria-label={kk.feed.delete}
                >
                  <Trash2 className="h-4 w-4 text-[var(--duo-red)]" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`question-${question.id}`}>
                  {kk.assignments.question}
                </Label>
                <Textarea
                  id={`question-${question.id}`}
                  value={question.questionText}
                  onChange={(event) =>
                    updateQuestion(question.id, (current) => ({
                      ...current,
                      questionText: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>{kk.assignments.options}</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {question.options.map((option) => (
                    <div key={option.label} className="space-y-2">
                      <Label htmlFor={`${question.id}-${option.label}`}>
                        {option.label}
                      </Label>
                      <Input
                        id={`${question.id}-${option.label}`}
                        value={option.text}
                        onChange={(event) =>
                          updateQuestion(question.id, (current) => ({
                            ...current,
                            options: current.options.map((currentOption) =>
                              currentOption.label === option.label
                                ? { ...currentOption, text: event.target.value }
                                : currentOption
                            ),
                          }))
                        }
                        placeholder={`${option.label}. ...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{kk.assignments.correctAnswer}</Label>
                <div className="flex flex-wrap gap-2">
                  {OPTION_LABELS.map((label) => {
                    const selected = question.correctLabel === label;
                    return (
                      <Button
                        key={label}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateQuestion(question.id, (current) => ({
                            ...current,
                            correctLabel: label,
                          }))
                        }
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error ? (
        <p className="text-sm font-medium text-[var(--duo-red)]">{error}</p>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving || loading}>
          {saving ? kk.assignments.loading : kk.assignments.save}
        </Button>
      </div>
    </div>
  );
}
