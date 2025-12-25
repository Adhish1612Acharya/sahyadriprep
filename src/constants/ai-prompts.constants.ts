export const AI_PROMPTS = {
  overview: ({
    title,
    description,
    transcript,
  }: {
    title: string;
    description: string;
    transcript: string;
  }) => `Analyze this Sahyadri College senior's interview experience video for campus placement prep.

VIDEO DETAILS:
Title: ${title}
Description: ${description || "N/A"}

TRANSCRIPT:
${transcript.slice(0, 50000)}${
    transcript.length > 50000 ? "...(truncated)" : ""
  }

Follow the JSON schema exactly for VTU CSE freshers.`,

  segments: ({
    title,
    timestampedText,
  }: {
    title: string;
    timestampedText: string;
  }) => `Segment this Sahyadri College senior's interview into logical rounds/phases.

VIDEO TITLE: ${title}

TRANSCRIPT WITH TIMESTAMPS:
${timestampedText.slice(0, 50000)}${
    timestampedText.length > 50000 ? "\n...(truncated)" : ""
  }

Divide into 5–8 college placement phases (Online Test, Technical, HR etc.). Follow the JSON schema exactly.`,

  flashcards: ({
    title,
    transcript,
  }: {
    title: string;
    transcript: string;
  }) => `Create educational flashcards from this Sahyadri College senior's interview experience.

VIDEO TITLE: ${title}

TRANSCRIPT:
${transcript.slice(0, 50000)}${
    transcript.length > 50000 ? "...(truncated)" : ""
  }

Generate 15–20 flashcards for VTU CSE freshers. Focus on actionable college placement insights. Follow the JSON schema.`,

  tips: ({
    title,
    transcript,
  }: {
    title: string;
    transcript: string;
  }) => `Extract actionable tips and best practices from this Sahyadri College senior's interview experience.

VIDEO TITLE: ${title}

TRANSCRIPT:
${transcript.slice(0, 50000)}${
    transcript.length > 50000 ? "...(truncated)" : ""
  }

Extract 10–15 tips helpful for VTU CSE campus placements. Follow the JSON schema exactly.`,

  extractCompanies: ({
    query,
  }: {
    query: string;
  }) => `You are a company name extractor. Extract all company names mentioned in the user's query.

Rules:
1. Return ONLY company names (e.g., Google, Microsoft, Amazon, Netflix)
2. Return as a JSON array of strings: ["Company1", "Company2"]
3. If no companies mentioned, return empty array: []
4. Use standard company names (e.g., "Google" not "google inc")
5. Include variations (e.g., if user says "FAANG", return ["Facebook", "Amazon", "Apple", "Netflix", "Google"])
6. Do not include generic terms like "tech company", "startup", etc.

User query: "${query}"

Return ONLY the JSON array, nothing else.`,

  chunkSummary: ({ text }: { text: string }) => {
    const input = text.length > 8000 ? text.slice(0, 8000) : text;

    return `You are creating a summary for a text chunk in a Retrieval-Augmented Generation (RAG) system. This summary will be used to help retrieve relevant information when users ask questions.

Your task:
1. Summarize the key topics, concepts, and information in this text chunk.
2. Include important keywords and entities that would help match user queries.
3. Focus on what questions this chunk could answer.
4. Keep it 2-3 clear and concise sentences.
5. Do not include introductory phrases like "This text discusses..." or "The summary is...".

Text chunk:
${input}`;
  },

  

  ragGroqSystem: () =>
    `You are an AI assistant specialized in helping students prepare for job interviews. You have access to a database of interview experiences from placed students and recorded interview sessions.

Your role:
- Analyze the provided context from interview documents and YouTube videos
- Answer questions based ONLY on the information in the context
- Provide accurate, helpful interview preparation advice
- Cite specific sources when providing information
- Be concise but comprehensive

Privacy & Anonymity Guidelines:
- NEVER include personal details like names, USN numbers, student IDs, email addresses, phone numbers, age, or any identifying information
- Refer to individuals generically as "a student", "one candidate", "an interviewee", "a peer", or "someone"
- Replace personal identifiers with generic terms (e.g., "a Computer Science student", "a final-year candidate")
- Focus exclusively on interview content, questions, and experiences—not on who shared them
- If a source contains personal information, omit those details entirely from your response

Context Guidelines:
- Interview documents contain written experiences from students
- YouTube videos may have titles, descriptions, or transcript segments with timestamps
- When referencing YouTube transcripts, mention the time range if available
- If multiple sources say similar things, synthesize the information

Response Format:
- Start with a direct answer to the question
- Provide relevant details from the context
- Keep your response focused and well-structured
- Do NOT invent information not present in the context
- If the context doesn't contain relevant information, say so clearly

Remember: Your answer should be based on the summaries and content provided in the context sources below.`,

  ragGroqUserTurn: ({
    userMessage,
    context,
  }: {
    userMessage: string;
    context: string;
  }) =>
    `Available Context Sources:
${context}

User Question: ${userMessage}

Please provide a comprehensive answer based on the above sources. Reference specific sources when making claims (e.g., "According to Source 1..." or "As mentioned in the video at 5:23...").`,
} as const;
