import { AI_OUTPUT_SCHEMAS } from "@/constants/ai-output-schemas";
import { AI_PROMPTS } from "@/constants/ai-prompts";
import { generateStructuredAiOutput } from "@/features/ai/structured-output";
import { Flashcard, OverviewResponse, Segment, Tip } from "../types";

export async function generateOverview(
  title: string,
  description: string,
  transcript: string,
  apiKey: string
): Promise<OverviewResponse> {
  console.log("🔑 Using Overview API key");

  const prompt = AI_PROMPTS.overview({ title, description, transcript });

  try {
    return await generateStructuredAiOutput<OverviewResponse>(
      prompt,
      apiKey,
      AI_OUTPUT_SCHEMAS.interviewSessionOverview
    );
  } catch (e) {
    console.error("Error generating overview:", e);
    return {
      summary: "Unable to generate overview at this time.",
      key_points: [],
      topics: [],
      difficulty_level: "intermediate",
      recommended_for: [],
    };
  }
}

export async function generateSegments(
  title: string,
  transcriptSegments: TranscriptSegment[],
  apiKey: string
): Promise<Segment[]> {
  console.log("🔑 Using Segments API key");

  const timestampedText = transcriptSegments
    .map((seg) => {
      const mins = Math.floor(seg.start / 60);
      const secs = Math.floor(seg.start % 60);
      return `[${mins}:${secs.toString().padStart(2, "0")}] ${seg.text}`;
    })
    .join("\n");

  const prompt = AI_PROMPTS.segments({ title, timestampedText });

  try {
    const response = await generateStructuredAiOutput<{ segments: Segment[] }>(
      prompt,
      apiKey,
      AI_OUTPUT_SCHEMAS.interviewSessionSegments
    );
    return response.segments || [];
  } catch (e) {
    console.error("Error generating segments:", e);
    return [];
  }
}

export async function generateFlashcards(
  title: string,
  transcript: string,
  apiKey: string
): Promise<Flashcard[]> {
  console.log("🔑 Using Flashcards API key");

  const prompt = AI_PROMPTS.flashcards({ title, transcript });

  try {
    const response = await generateStructuredAiOutput<{
      flashcards: Flashcard[];
    }>(prompt, apiKey, AI_OUTPUT_SCHEMAS.interviewSessionFlashcards);
    return response.flashcards || [];
  } catch (e) {
    console.error("Error generating flashcards:", e);
    return [];
  }
}

export async function generateKeyTips(
  title: string,
  transcript: string,
  apiKey: string
): Promise<Tip[]> {
  console.log("🔑 Using Tips API key");

  const prompt = AI_PROMPTS.tips({ title, transcript });

  try {
    const response = await generateStructuredAiOutput<{ tips: Tip[] }>(
      prompt,
      apiKey,
      AI_OUTPUT_SCHEMAS.interviewSessionTips
    );
    return response.tips || [];
  } catch (e) {
    console.error("Error generating tips:", e);
    return [];
  }
}
