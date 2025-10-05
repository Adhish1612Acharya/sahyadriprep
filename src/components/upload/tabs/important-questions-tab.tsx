"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2 } from "lucide-react";
import { MediaUploader } from "../media-uploader";
import { CardItem } from "../card-item";
import type { Media } from "@/models/media";

type ImportantQuestionData = {
  question: string;
  text_answer?: string;
  video_file?: File;
  is_public: boolean;
};

type QuestionItem = {
  id: string;
  question: string;
  text_answer: string;
  video_files: Media[];
  is_public: boolean;
};

type ImportantQuestionsTabProps = {
  resource_id: string;
  created_by: string;
  on_questions_change?: (questions: ImportantQuestionData[]) => void;
};

export function ImportantQuestionsTab({
  resource_id,
  created_by,
  on_questions_change,
}: ImportantQuestionsTabProps) {
  const [questions, set_questions] = useState<QuestionItem[]>([
    {
      id: `question-${Date.now()}`,
      question: "",
      text_answer: "",
      video_files: [],
      is_public: true,
    },
  ]);

  // Convert to ImportantQuestionData format for parent component
  const questions_data: ImportantQuestionData[] = useMemo(() => {
    return questions
      .filter((question) => question.question.trim()) // Only include questions with text
      .map((question) => ({
        question: question.question.trim(),
        text_answer: question.text_answer.trim() || undefined,
        video_file: question.video_files[0]?.file || undefined,
        is_public: question.is_public,
      }));
  }, [questions]);

  // Notify parent component when questions data changes
  useEffect(() => {
    if (on_questions_change) {
      on_questions_change(questions_data);
    }
  }, [questions_data, on_questions_change]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "draft_important_questions",
        JSON.stringify(questions)
      );
    } catch {}
  }, [questions]);

  const add_question = () => {
    const new_question: QuestionItem = {
      id: `question-${Date.now()}`,
      question: "",
      text_answer: "",
      video_files: [],
      is_public: true,
    };
    set_questions((prev) => [...prev, new_question]);
  };

  const remove_question = (question_id: string) => {
    set_questions((prev) =>
      prev.filter((question) => question.id !== question_id)
    );
  };

  const update_question = (
    question_id: string,
    updates: Partial<QuestionItem>
  ) => {
    set_questions((prev) =>
      prev.map((question) =>
        question.id === question_id ? { ...question, ...updates } : question
      )
    );
  };

  const validate_question = (question: QuestionItem): string[] => {
    const errors: string[] = [];

    if (!question.question.trim()) {
      errors.push("Question text is required");
    }

    if (!question.is_public) {
      if (!question.text_answer.trim() && question.video_files.length === 0) {
        errors.push("Private questions must have either text or video answer");
      }
    }

    return errors;
  };

  return (
    <div className="space-y-4">
      <CardItem
        title="Important Questions"
        description="Add questions that frequently appear in exams. Private questions require answers."
      >
        <div className="space-y-6">
          {questions.map((question, index) => {
            const question_errors = validate_question(question);
            const has_errors = question_errors.length > 0;

            return (
              <div
                key={question.id}
                className="border border-border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    {questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove_question(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`question-text-${question.id}`}>
                      Question
                    </Label>
                    <Textarea
                      id={`question-text-${question.id}`}
                      value={question.question}
                      onChange={(e) =>
                        update_question(question.id, {
                          question: e.target.value,
                        })
                      }
                      placeholder="e.g., Explain the difference between stack and queue data structures"
                      className={`min-h-20 ${
                        has_errors && !question.question.trim()
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {!question.question.trim() && (
                      <span className="text-xs text-red-500">
                        Question text is required
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Visibility</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Private
                        </span>
                        <Switch
                          checked={question.is_public}
                          onCheckedChange={(checked) =>
                            update_question(question.id, { is_public: checked })
                          }
                          aria-label="Toggle question visibility"
                        />
                        <span className="text-xs text-muted-foreground">
                          Public
                        </span>
                      </div>
                    </div>
                    {!question.is_public && (
                      <p className="text-xs text-orange-600">
                        Private questions must have either text or video answer
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`question-answer-${question.id}`}>
                        Text Answer
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                              {question.is_public
                                ? "optional"
                                : "required if no video"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border-border">
                            {question.is_public
                              ? "Public questions can be answer-optional"
                              : "Private questions need either text or video answer"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id={`question-answer-${question.id}`}
                      value={question.text_answer}
                      onChange={(e) =>
                        update_question(question.id, {
                          text_answer: e.target.value,
                        })
                      }
                      placeholder="Provide a detailed answer to this question..."
                      className="min-h-32"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Video Answer</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                              {question.is_public
                                ? "optional"
                                : "required if no text"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border-border">
                            Upload a video explanation for this question
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <MediaUploader
                      value={question.video_files}
                      onChange={(files) =>
                        update_question(question.id, { video_files: files })
                      }
                      max_files={1}
                      accept="video/*"
                      file_type="video"
                    />
                  </div>

                  {has_errors && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-700 font-medium">
                        Issues with this question:
                      </p>
                      <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                        {question_errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Button variant="outline" onClick={add_question} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Question
          </Button>
        </div>
      </CardItem>

      <CardItem
        title="Preview"
        description="This shows how your questions would be stored."
      >
        <pre className="text-xs md:text-sm overflow-auto rounded-md border border-border p-3 bg-muted/50">
          {JSON.stringify(questions_data, null, 2)}
        </pre>
      </CardItem>

      <div className="flex justify-end">
        <div className="text-xs text-muted-foreground mb-2">
          {questions_data.length > 0
            ? `✓ ${questions_data.length} question(s) ready`
            : "Add at least one question"}
        </div>
      </div>
    </div>
  );
}
