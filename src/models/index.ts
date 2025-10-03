// Import types for use in type unions
import type { ImportantTopicTextAnswer } from "./important-topic-text-answer";
import type { ImportantTopicVideoAnswer } from "./important-topic-video-answer";
import type { ImportantQuestionTextAnswer } from "./important-question-text-answer";
import type { ImportantQuestionVideoAnswer } from "./important-question-video-answer";

// Re-export all interfaces from their respective files
export type { Media } from "./media";
export type { Subject } from "./subject";
export type { Module } from "./module";
export type { Exam } from "./exam";
export type { Resource } from "./resource";
export type { Note } from "./note";
export type { ImportantTopic } from "./important-topic";
export type { ImportantTopicTextAnswer } from "./important-topic-text-answer";
export type { ImportantTopicVideoAnswer } from "./important-topic-video-answer";
export type { ImportantQuestion } from "./important-question";
export type { ImportantQuestionTextAnswer } from "./important-question-text-answer";
export type { ImportantQuestionVideoAnswer } from "./important-question-video-answer";

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
