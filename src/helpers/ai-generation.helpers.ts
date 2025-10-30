import { callGemini } from "@/lib/gemini/gemini";
import { TranscriptSegment } from "@/types/youtube-videos.types";

// ============================================
// AI GENERATION FUNCTIONS USING GEMINI
// ============================================

/**
 * Generate overview with Gemini
 */
export async function generateOverview(
  title: string,
  description: string,
  transcript: string,
  apiKey: string
) {
  console.log("🔑 Using Overview API key");

  const prompt = `You are an expert AI assistant that analyzes interview videos and generates structured educational content.

Analyze this interview experience video and provide a comprehensive overview.

VIDEO DETAILS:
Title: ${title}
Description: ${description || "N/A"}

TRANSCRIPT:
${transcript.slice(0, 50000)}${
    transcript.length > 50000 ? "...(truncated)" : ""
  }

Generate a JSON object with these exact keys:
{
  "summary": "A concise 150-200 word summary of the interview",
  "key_points": ["array", "of", "5-7", "most", "important", "points"],
  "topics": ["array", "of", "main", "topics"],
  "difficulty_level": "beginner" or "intermediate" or "advanced",
  "recommended_for": ["array", "of", "target", "audience"]
}

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown.`;

  try {
    return await callGemini(prompt, apiKey);
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

/**
 * Generate video segments with Gemini
 */
export async function generateSegments(
  title: string,
  transcriptSegments: TranscriptSegment[],
  apiKey: string
) {
  console.log("🔑 Using Segments API key");

  const timestampedText = transcriptSegments
    .map((seg) => {
      const mins = Math.floor(seg.start / 60);
      const secs = Math.floor(seg.start % 60);
      return `[${mins}:${secs.toString().padStart(2, "0")}] ${seg.text}`;
    })
    .join("\n");

  const prompt = `You are an expert AI assistant that analyzes interview videos and generates structured educational content.

Segment this interview video into logical sections.

VIDEO TITLE: ${title}

TRANSCRIPT WITH TIMESTAMPS:
${timestampedText.slice(0, 50000)}${
    timestampedText.length > 50000 ? "\n...(truncated)" : ""
  }

Divide this interview into 5-8 logical segments. Each segment should represent a distinct phase or topic.

Generate a JSON object with a "segments" array, where each segment has:
{
  "segments": [
    {
      "segment_number": 1,
      "title": "Brief descriptive title",
      "description": "50-100 word summary",
      "start_time": 0,
      "end_time": 120,
      "key_concepts": ["concept1", "concept2"]
    }
  ]
}

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown.`;

  try {
    const response = await callGemini(prompt, apiKey);
    return response.segments || [];
  } catch (e) {
    console.error("Error generating segments:", e);
    return [];
  }
}

/**
 * Generate flashcards with Gemini
 */
export async function generateFlashcards(
  title: string,
  transcript: string,
  apiKey: string
) {
  console.log("🔑 Using Flashcards API key");

  const prompt = `You are an expert AI assistant that analyzes interview videos and generates structured educational content.

Create educational flashcards from this interview experience.

VIDEO TITLE: ${title}

TRANSCRIPT:
${transcript.slice(0, 50000)}${
    transcript.length > 50000 ? "...(truncated)" : ""
  }

Create 15-20 flashcards that capture the most valuable insights.

Generate a JSON object with a "flashcards" array:
{
  "flashcards": [
    {
      "question": "Clear, specific question",
      "answer": "Concise, actionable answer (2-3 sentences)",
      "difficulty": "easy" or "medium" or "hard",
      "category": "technical" or "behavioral" or "preparation" or "tips" or "company_culture",
      "timestamp": 120 or null
    }
  ]
}

Focus on:
- Actionable advice
- Specific examples
- Common mistakes to avoid
- Best practices

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown.`;

  try {
    const response = await callGemini(prompt, apiKey);
    return response.flashcards || [];
  } catch (e) {
    console.error("Error generating flashcards:", e);
    return [];
  }
}

/**
 * Generate key tips with Gemini
 */
export async function generateKeyTips(
  title: string,
  transcript: string,
  apiKey: string
) {
  console.log("🔑 Using Tips API key");

  const prompt = `You are an expert AI assistant that analyzes interview videos and generates structured educational content.

Extract actionable tips and best practices from this interview.

VIDEO TITLE: ${title}

TRANSCRIPT:
${transcript.slice(0, 50000)}${
    transcript.length > 50000 ? "...(truncated)" : ""
  }

Extract 10-15 key tips and best practices.

Generate a JSON object with a "tips" array:
{
  "tips": [
    {
      "tip_text": "The tip itself (1-2 sentences, actionable)",
      "category": "preparation" or "communication" or "technical" or "mindset" or "follow_up",
      "importance": "critical" or "important" or "helpful",
      "context": "Additional context (optional)",
      "timestamp": 120 or null
    }
  ]
}

Focus on:
- Actionable advice
- Specific strategies
- Common pitfalls to avoid
- Unique insights

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown.`;

  try {
    const response = await callGemini(prompt, apiKey);
    return response.tips || [];
  } catch (e) {
    console.error("Error generating tips:", e);
    return [];
  }
}
