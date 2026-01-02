// Import types for use in type unions
import type { ImportantTopicTextAnswer } from "./important-topic-text-answer.types";
import type { ImportantTopicVideoAnswer } from "./important-topic-video-answer.types";
import type { ImportantQuestionTextAnswer } from "./important-question-text-answer.types";
import type { ImportantQuestionVideoAnswer } from "./important-question-video-answer.types";

// Re-export all interfaces from their respective files
export type { Media } from "./media.types";
export type { Subject } from "./subject.types";
export type { Module } from "./module.types";
export type { Exam } from "./exam.types";
export type { Resource } from "./resource.types";
export type { Note } from "./note.types";
export type { ImportantTopic } from "./important-topic.types";
export type { ImportantTopicTextAnswer } from "./important-topic-text-answer.types";
export type { ImportantTopicVideoAnswer } from "./important-topic-video-answer.types";
export type { ImportantQuestion } from "./important-question.types";
export type { ImportantQuestionTextAnswer } from "./important-question-text-answer.types";
export type { ImportantQuestionVideoAnswer } from "./important-question-video-answer.types";

export type {
  InterviewExperience,
  InterviewExperienceWithDetails,
} from "./interview-experience.types";

export * from "./auth-profile.types";

export * from "./college-admin-profile.types";

export * from "./student-profile.types";

export * from "./company.types";

export * from "./content-chunk.types";

// Type unions for common use cases
export type Answer =
  | ImportantTopicTextAnswer
  | ImportantTopicVideoAnswer
  | ImportantQuestionTextAnswer
  | ImportantQuestionVideoAnswer;

export type VideoAnswer =
  | ImportantTopicVideoAnswer
  | ImportantQuestionVideoAnswer;
export type TextAnswer = ImportantTopicTextAnswer | ImportantQuestionTextAnswer;

// Visibility type for reuse
export type Visibility = "public" | "private";
