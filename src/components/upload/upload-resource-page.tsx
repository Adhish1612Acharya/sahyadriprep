"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotesTab } from "./tabs/notes-tab";
import { ImportantTopicsTab } from "./tabs/important-topics-tab";
import { ImportantQuestionsTab } from "./tabs/important-questions-tab";
import { useSubjects } from "@/hooks/useSubjects/useSubjects.hooks";
import { useModules } from "@/hooks/useModules/useModules.hooks";
import { useExams } from "@/hooks/useExams/useExams.hooks";
// import { useResourceUpload } from "@/hooks/useResourceUpload";

type StepOneState = {
  subject_id?: string;
  module_id?: string;
  exam_id?: string;
};

type NoteData = {
  title: string;
  description: string;
  file: File;
};

type ImportantTopicData = {
  title: string;
  text_answer?: string;
  video_file?: File;
  is_public: boolean;
};

type ImportantQuestionData = {
  question: string;
  text_answer?: string;
  video_file?: File;
  is_public: boolean;
};

type ResourceData = {
  context: StepOneState;
  notes: NoteData[];
  important_topics: ImportantTopicData[];
  important_questions: ImportantQuestionData[];
  visibility: "public" | "private";
};

type ValidationError = {
  field: string;
  message: string;
};

function gen_id() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function UploadResourcePage() {
  const [step_1, set_step_1] = useState<StepOneState>({
    subject_id: "",
    module_id: "",
    exam_id: "",
  });
  const [visibility, set_visibility] = useState<"public" | "private">("public");
  const [resource_data, set_resource_data] = useState<ResourceData>({
    context: {},
    notes: [],
    important_topics: [],
    important_questions: [],
    visibility: "public",
  });
  const [validation_errors, set_validation_errors] = useState<
    ValidationError[]
  >([]);
  const [is_submitting, set_is_submitting] = useState(false);
  const [submit_success, set_submit_success] = useState(false);

  // Use useCallback for all change handlers
  const handle_subject_change = useCallback((subject_id: string) => {
    set_step_1((prev) => ({
      ...prev,
      subject_id,
      module_id: "", // Reset module when subject changes
    }));
  }, []);

  const handle_module_change = useCallback((module_id: string) => {
    set_step_1((prev) => ({
      ...prev,
      module_id,
    }));
  }, []);

  const handle_exam_change = useCallback((exam_id: string) => {
    set_step_1((prev) => ({
      ...prev,
      exam_id,
    }));
  }, []);

  // Load all subjects and exams on component mount
  const { subjectsQuery } = useSubjects();
  const { examsQuery } = useExams();

  // Load modules only when a subject is selected
  const { modulesQuery } = useModules(step_1.subject_id);

  // Update resource_data context when step_1 or visibility changes
  useEffect(() => {
    set_resource_data((prev) => ({
      ...prev,
      context: step_1,
      visibility,
    }));
  }, [step_1, visibility]);

  const resource_id = useMemo(() => gen_id(), []);

  const can_proceed = useMemo(
    () =>
      Boolean(step_1.subject_id) &&
      Boolean(step_1.module_id) &&
      Boolean(step_1.exam_id),
    [step_1.subject_id, step_1.module_id, step_1.exam_id]
  );

  // Validation functions (keeping them as they are)
  const validate_notes = (notes: NoteData[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (notes.length > 2) {
      errors.push({
        field: "notes",
        message: "Maximum 2 PDF files allowed",
      });
    }

    notes.forEach((note, index) => {
      if (!note.title.trim()) {
        errors.push({
          field: `notes.${index}.title`,
          message: `Note ${index + 1}: Title is required`,
        });
      }

      if (!note.description.trim()) {
        errors.push({
          field: `notes.${index}.description`,
          message: `Note ${index + 1}: Description is required`,
        });
      }

      if (!note.file || note.file.type !== "application/pdf") {
        errors.push({
          field: `notes.${index}.file`,
          message: `Note ${index + 1}: Valid PDF file is required`,
        });
      }
    });

    return errors;
  };

  const validate_topics = (topics: ImportantTopicData[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    topics.forEach((topic, index) => {
      if (!topic.title.trim()) {
        errors.push({
          field: `topics.${index}.title`,
          message: `Topic ${index + 1}: Title is required`,
        });
      }

      if (!topic.is_public) {
        if (!topic.text_answer?.trim() && !topic.video_file) {
          errors.push({
            field: `topics.${index}.answer`,
            message: `Topic ${
              index + 1
            }: Private topics must have either text or video answer`,
          });
        }
      }

      if (topic.video_file && !topic.video_file.type.startsWith("video/")) {
        errors.push({
          field: `topics.${index}.video`,
          message: `Topic ${index + 1}: Invalid video file format`,
        });
      }
    });

    return errors;
  };

  const validate_questions = (
    questions: ImportantQuestionData[]
  ): ValidationError[] => {
    const errors: ValidationError[] = [];

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors.push({
          field: `questions.${index}.question`,
          message: `Question ${index + 1}: Question text is required`,
        });
      }

      if (!question.is_public) {
        if (!question.text_answer?.trim() && !question.video_file) {
          errors.push({
            field: `questions.${index}.answer`,
            message: `Question ${
              index + 1
            }: Private questions must have either text or video answer`,
          });
        }
      }

      if (
        question.video_file &&
        !question.video_file.type.startsWith("video/")
      ) {
        errors.push({
          field: `questions.${index}.video`,
          message: `Question ${index + 1}: Invalid video file format`,
        });
      }
    });

    return errors;
  };

  const validate_resource = (data: ResourceData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.context.subject_id) {
      errors.push({
        field: "context.subject_id",
        message: "Subject is required",
      });
    }
    if (!data.context.module_id) {
      errors.push({
        field: "context.module_id",
        message: "Module is required",
      });
    }
    if (!data.context.exam_id) {
      errors.push({ field: "context.exam_id", message: "Exam is required" });
    }

    const has_notes = data.notes.length > 0;
    const has_topics = data.important_topics.length > 0;
    const has_questions = data.important_questions.length > 0;

    if (!has_notes && !has_topics && !has_questions) {
      errors.push({
        field: "content",
        message:
          "At least one type of content (Notes, Topics, or Questions) is required",
      });
    }

    errors.push(...validate_notes(data.notes));
    errors.push(...validate_topics(data.important_topics));
    errors.push(...validate_questions(data.important_questions));

    return errors;
  };

  const format_for_api = (data: ResourceData) => {
    const form_data = new FormData();

    form_data.append("subject_id", data.context.subject_id || "");
    form_data.append("module_id", data.context.module_id || "");
    form_data.append("exam_id", data.context.exam_id || "");
    form_data.append("visibility", data.visibility);

    data.notes.forEach((note, index) => {
      form_data.append(`notes[${index}][title]`, note.title);
      form_data.append(`notes[${index}][description]`, note.description);
      form_data.append(`notes[${index}][file]`, note.file);
    });

    data.important_topics.forEach((topic, index) => {
      form_data.append(`important_topics[${index}][title]`, topic.title);
      form_data.append(
        `important_topics[${index}][is_public]`,
        topic.is_public.toString()
      );

      if (topic.text_answer) {
        form_data.append(
          `important_topics[${index}][text_answer]`,
          topic.text_answer
        );
      }

      if (topic.video_file) {
        form_data.append(
          `important_topics[${index}][video_file]`,
          topic.video_file
        );
      }
    });

    data.important_questions.forEach((question, index) => {
      form_data.append(
        `important_questions[${index}][question]`,
        question.question
      );
      form_data.append(
        `important_questions[${index}][is_public]`,
        question.is_public.toString()
      );

      if (question.text_answer) {
        form_data.append(
          `important_questions[${index}][text_answer]`,
          question.text_answer
        );
      }

      if (question.video_file) {
        form_data.append(
          `important_questions[${index}][video_file]`,
          question.video_file
        );
      }
    });

    return form_data;
  };

  const handle_submit = useCallback(async () => {
    try {
      set_is_submitting(true);
      set_validation_errors([]);
      set_submit_success(false);

      const errors = validate_resource(resource_data);

      if (errors.length > 0) {
        set_validation_errors(errors);
        return;
      }

      const form_data = format_for_api(resource_data);

      console.log("Form Data Prepared for API:");
      for (const pair of form_data.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      set_submit_success(true);
      localStorage.removeItem("draft_step_1");

      setTimeout(() => {
        set_step_1({ subject_id: "", module_id: "", exam_id: "" });
        set_resource_data({
          context: {},
          notes: [],
          important_topics: [],
          important_questions: [],
          visibility: "public",
        });
        set_submit_success(false);
      }, 3000);
    } catch (error: any) {
      set_validation_errors([
        {
          field: "submission",
          message:
            error.message || "Failed to upload resource. Please try again.",
        },
      ]);
    } finally {
      set_is_submitting(false);
    }
  }, [resource_data]);

  const handle_save_draft = useCallback(() => {
    try {
      localStorage.setItem(
        "draft_resource_data",
        JSON.stringify(resource_data)
      );
      alert("Draft saved successfully!");
    } catch {
      alert("Failed to save draft");
    }
  }, [resource_data]);

  const handle_notes_change = useCallback((notes: NoteData[]) => {
    set_resource_data((prev) => ({ ...prev, notes }));
  }, []);

  const handle_topics_change = useCallback((topics: ImportantTopicData[]) => {
    set_resource_data((prev) => ({ ...prev, important_topics: topics }));
  }, []);

  const handle_questions_change = useCallback(
    (questions: ImportantQuestionData[]) => {
      set_resource_data((prev) => ({
        ...prev,
        important_questions: questions,
      }));
    },
    []
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-balance text-2xl md:text-3xl font-semibold">
          Upload Resource
        </h1>
        <p className="text-muted-foreground mt-1">
          Select Subject, Module, and Exam, then add notes, topics, and
          questions.
        </p>
      </header>

      {/* Validation Errors Display */}
      {validation_errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation_errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {submit_success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Resource uploaded successfully! The form will reset in a few
            seconds.
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Select Context</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {/* Subject Dropdown - Enhanced Native Select */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </Label>
              <div className="relative">
                <select
                  value={step_1.subject_id}
                  onChange={(e) => handle_subject_change(e.target.value)}
                  disabled={subjectsQuery.isLoading}
                  className={`
                    flex h-11 w-full rounded-lg border-2 px-4 py-2 text-sm font-medium
                    shadow-sm transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      subjectsQuery.isLoading
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : subjectsQuery.error
                        ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500"
                        : step_1.subject_id
                        ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500"
                        : "border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    }
                    dark:bg-gray-800 dark:border-gray-600 dark:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <option value="" className="text-gray-500">
                    {subjectsQuery.isLoading
                      ? "🔄 Loading subjects..."
                      : "📚 Choose subject"}
                  </option>
                  {subjectsQuery.data?.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                      className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      {subject.subject_code} — {subject.subject_name}
                    </option>
                  ))}
                </select>

                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {subjectsQuery.isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {subjectsQuery.error && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {step_1.subject_id &&
                    !subjectsQuery.isLoading &&
                    !subjectsQuery.error && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </div>
              </div>

              {/* Enhanced Error Display */}
              {subjectsQuery.error && (
                <Alert
                  variant="destructive"
                  className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    ❌ Failed to load subjects. Please refresh the page.
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Feedback */}
              {step_1.subject_id &&
                !subjectsQuery.isLoading &&
                !subjectsQuery.error && (
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                    ✅ Subject selected successfully
                  </div>
                )}
            </div>

            {/* Module Dropdown - Enhanced Native Select */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Module
              </Label>
              <div className="relative">
                <select
                  value={step_1.module_id}
                  onChange={(e) => handle_module_change(e.target.value)}
                  disabled={!step_1.subject_id || modulesQuery.isLoading}
                  className={`
                    flex h-11 w-full rounded-lg border-2 px-4 py-2 text-sm font-medium
                    shadow-sm transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      !step_1.subject_id || modulesQuery.isLoading
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : modulesQuery.error
                        ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500"
                        : step_1.module_id
                        ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500"
                        : "border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    }
                    dark:bg-gray-800 dark:border-gray-600 dark:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <option value="" className="text-gray-500">
                    {!step_1.subject_id
                      ? "📚 Select subject first"
                      : modulesQuery.isLoading
                      ? "🔄 Loading modules..."
                      : "📖 Choose module"}
                  </option>
                  {modulesQuery.data?.map((module) => (
                    <option
                      key={module.id}
                      value={module.id}
                      className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      {module.module_name}
                    </option>
                  ))}
                </select>

                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {modulesQuery.isLoading && step_1.subject_id && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {modulesQuery.error && step_1.subject_id && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {step_1.module_id &&
                    !modulesQuery.isLoading &&
                    !modulesQuery.error && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </div>
              </div>

              {/* Enhanced Error Display */}
              {modulesQuery.error && step_1.subject_id && (
                <Alert
                  variant="destructive"
                  className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    ❌ Failed to load modules. Please try selecting the subject
                    again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Feedback */}
              {step_1.module_id &&
                !modulesQuery.isLoading &&
                !modulesQuery.error && (
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                    ✅ Module selected successfully
                  </div>
                )}

              {/* Dependency Hint */}
              {!step_1.subject_id && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  💡 Please select a subject first to enable module selection
                </div>
              )}
            </div>

            {/* Exam Dropdown - Enhanced Native Select */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Exam
              </Label>
              <div className="relative">
                <select
                  value={step_1.exam_id}
                  onChange={(e) => handle_exam_change(e.target.value)}
                  disabled={examsQuery.isLoading}
                  className={`
                    flex h-11 w-full rounded-lg border-2 px-4 py-2 text-sm font-medium
                    shadow-sm transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      examsQuery.isLoading
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : examsQuery.error
                        ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500"
                        : step_1.exam_id
                        ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500"
                        : "border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    }
                    dark:bg-gray-800 dark:border-gray-600 dark:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <option value="" className="text-gray-500">
                    {examsQuery.isLoading
                      ? "🔄 Loading exams..."
                      : "🎯 Choose exam"}
                  </option>
                  {examsQuery.data?.map((exam) => (
                    <option
                      key={exam.id}
                      value={exam.id}
                      className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      {exam.exam_name}
                    </option>
                  ))}
                </select>

                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {examsQuery.isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {examsQuery.error && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {step_1.exam_id &&
                    !examsQuery.isLoading &&
                    !examsQuery.error && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </div>
              </div>

              {/* Enhanced Error Display */}
              {examsQuery.error && (
                <Alert
                  variant="destructive"
                  className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    ❌ Failed to load exams. Please refresh the page.
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Feedback */}
              {step_1.exam_id && !examsQuery.isLoading && !examsQuery.error && (
                <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  ✅ Exam selected successfully
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 md:mt-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Add Content</CardTitle>
          </CardHeader>
          <CardContent>
            {!can_proceed ? (
              <div className="text-sm text-muted-foreground">
                Select Subject, Module, and Exam to continue.
              </div>
            ) : (
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes">Notes & Resources</TabsTrigger>
                  <TabsTrigger value="topics">Important Topics</TabsTrigger>
                  <TabsTrigger value="questions">
                    Important Questions
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-4">
                  <NotesTab
                    resource_id={resource_id}
                    created_by="user_123"
                    visibility={visibility}
                    on_visibility_change={set_visibility}
                    on_notes_change={handle_notes_change}
                  />
                </TabsContent>
                <TabsContent value="topics" className="mt-4">
                  <ImportantTopicsTab
                    resource_id={resource_id}
                    created_by="user_123"
                    on_topics_change={handle_topics_change}
                  />
                </TabsContent>
                <TabsContent value="questions" className="mt-4">
                  <ImportantQuestionsTab
                    resource_id={resource_id}
                    created_by="user_123"
                    on_questions_change={handle_questions_change}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="flex items-center justify-end gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={handle_save_draft}
          disabled={is_submitting}
        >
          Save Draft
        </Button>
        <Button
          onClick={handle_submit}
          disabled={!can_proceed || is_submitting}
        >
          {is_submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </footer>
    </div>
  );
}

export default UploadResourcePage;
