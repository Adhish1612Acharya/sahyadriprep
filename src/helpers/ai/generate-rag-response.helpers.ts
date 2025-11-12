import groq from "@/lib/groq/groq";

export default async function generateRAGResponse(
  userMessage: string,
  context: string,
  chunks: any[],
  conversationHistory: any[] = []
): Promise<{ content: string }> {
  try {
    const systemPrompt = `You are an AI assistant specialized in helping students prepare for job interviews. You have access to a database of interview experiences from placed students and recorded interview sessions.

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

Remember: Your answer should be based on the summaries and content provided in the context sources below.`;

    const contextPrompt = `
Available Context Sources:
${context}

User Question: ${userMessage}

Please provide a comprehensive answer based on the above sources. Reference specific sources when making claims (e.g., "According to Source 1..." or "As mentioned in the video at 5:23...").`;

    console.log("🤖 Calling Groq API...");

    // ✅ Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful interview preparation assistant. You help students by sharing insights from real interview experiences of their peers. Always cite which company or student the information comes from. Be encouraging and specific.`,
        },
        {
          role: "user",
          content: `${systemPrompt}\n\n${contextPrompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile", // ✅ Best model for reasoning
      temperature: 0.3, // ✅ Lower temperature for factual responses
      max_tokens: 1500, // ✅ Allow detailed responses
      top_p: 0.9,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    console.log("✅ AI Response received");

    if (!aiResponse) {
      throw new Error("No response from Groq AI");
    }

    return {
      content: aiResponse,
    };
  } catch (error: any) {
    console.error("❌ Groq API Error:", error);

    throw error;
  }
}
