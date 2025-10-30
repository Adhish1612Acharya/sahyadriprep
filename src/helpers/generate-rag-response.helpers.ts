import groq from "@/lib/groq/groq";

const generateRAGResponse = async (
  userMessage: string,
  context: string,
  relevantChunks: any[],
  conversationHistory: any[] = []
): Promise<{ content: string; sources: string[] }> => {
  // ✅ Check if we have context
  if (context.trim().length === 0) {
    return {
      content: `I don't have any interview experience information related to "${userMessage}" in my knowledge base. 

Could you try asking about:
- Specific companies (e.g., "What was the Deloitte interview process?")
- Interview rounds (e.g., "What happens in technical rounds?")
- Interview tips (e.g., "How to prepare for coding interviews?")
- Specific batches or students' experiences

I can help you with questions about interview experiences that have been uploaded to the system.`,
      sources: [],
    };
  }

  try {
    // ✅ Build conversation context
    const conversationContext =
      conversationHistory.length > 0
        ? `Previous conversation:\n${conversationHistory
            .slice(-4) // Last 4 messages
            .map((msg: any) => `${msg.role}: ${msg.content}`)
            .join("\n")}\n\n`
        : "";

    // ✅ Create RAG prompt
    const ragPrompt = `You are an AI assistant helping students understand interview experiences from their peers. You have access to real interview experience documents from students who were placed in various companies.

${conversationContext}Context from interview experiences:
${context}

User Question: ${userMessage}

Instructions:
- Answer based ONLY on the provided interview experiences
- Be specific about which company/student/batch the information comes from
- If multiple sources mention the same thing, mention that
- Use the similarity scores to prioritize information (higher is more relevant)
- If the context doesn't fully answer the question, mention what information IS available
- Be encouraging and helpful - this is for students preparing for interviews
- Don't make up information not in the context
- Format your response clearly with bullet points or numbered lists when appropriate
- If technical terms are mentioned, explain them briefly

Answer:`;

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
          content: ragPrompt,
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

    // ✅ Extract sources
    const sources = Array.from(
      new Set(
        relevantChunks
          .map((chunk: any) => {
            const metadata = chunk.metadata || {};
            return (
              metadata.company_name ||
              metadata.document_title ||
              "Interview Experience"
            );
          })
          .filter(Boolean)
      )
    );

    return {
      content: aiResponse,
      sources,
    };
  } catch (error: any) {
    console.error("❌ Groq API Error:", error);

    // ✅ Fallback to template response if Groq fails
    const fallbackResponse = `Based on the interview experiences I found, here's what I can tell you:

${context.substring(0, 1200)}...

${
  relevantChunks.length > 1
    ? `📚 This information comes from ${relevantChunks.length} different interview experiences.`
    : "📚 This information comes from an interview experience in our database."
}

${
  relevantChunks[0]?.metadata?.company_name
    ? `🏢 Company: ${relevantChunks[0].metadata.company_name}`
    : ""
}
${
  relevantChunks[0]?.metadata?.batch
    ? `🎓 Batch: ${relevantChunks[0].metadata.batch}`
    : ""
}

Would you like me to:
- Explain any specific part in more detail?
- Find more interview experiences from similar companies?
- Help you prepare for specific interview rounds?

⚠️ Note: AI-enhanced response temporarily unavailable, showing direct context from interview experiences.`;

    return {
      content: fallbackResponse,
      sources: relevantChunks
        .map(
          (chunk: any) => chunk.metadata?.company_name || "Interview Experience"
        )
        .filter(Boolean),
    };
  }
};

export default generateRAGResponse;
