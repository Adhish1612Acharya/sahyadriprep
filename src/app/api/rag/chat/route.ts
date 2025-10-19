// src/app/api/rag/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/services/supabase/vector-store/vector-store-service";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";
import groq from "@/lib/groq/groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // message = "The second round was Phase 1 Technical Round, where at first I was asked to explain my projects. They asked about my favorite subject (I said OOPS) and then questioned me on that, mostly related to fundamentals and how it varies across various other programming languages. Later, they switched to a DSA-based problem-solving approach where I was given a few real-life examples, asked which algorithm to go with,",
      message="What is the third   technical   round  at deloitte?",
      session_id,
      user_id,
      conversation_history = [],
      search_limit = 3,
      similarity_threshold = 0.7,
      context_filters = {},
    } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("💬 Processing chat message:", message);

    // Step 1: Generate embedding for user message
    const queryEmbedding = await embeddings.embedQuery(message);

    // Step 2: Search for relevant context
    const relevantChunks =
      await vectorStoreServerOperations.searchSimilarChunks(queryEmbedding, {
        limit: search_limit,
        threshold: similarity_threshold,
        filters: context_filters,
      });

    console.log("Releveant chunks : ", relevantChunks);

    // Step 3: Build context from relevant chunks
    const context = relevantChunks
      .map(
        (chunk) =>
          `[From: ${chunk.document?.title || "Document"}]\n${chunk.content}`
      )
      .join("\n\n---\n\n");

    console.log("context:", context);

    // Step 4: Generate response (simple template-based for now)
    const response = await generateRAGResponse(
      message,
      context,
      relevantChunks
    );

    // Step 5: Store chat message if session_id provided
    // let stored_message = null;
    // if (session_id) {
    //   try {
    //     // Store user message
    //     await vectorStoreServerOperations.addChatMessage({
    //       session_id,
    //       role: "user",
    //       content: message,
    //       metadata: {
    //         timestamp: new Date().toISOString(),
    //         embedding_dimension: queryEmbedding.length,
    //       },
    //     });

    //     // Store assistant response
    //     stored_message = await vectorStoreServerOperations.addChatMessage({
    //       session_id,
    //       role: "assistant",
    //       content: response.content,
    //       metadata: {
    //         relevant_chunks: relevantChunks.length,
    //         context_used: context.length > 0,
    //         sources: relevantChunks.map((chunk) => ({
    //           document_id: chunk.document_id,
    //           title: chunk.document?.title,
    //           similarity: chunk.similarity,
    //         })),
    //       },
    //     });

    //     // Update session timestamp
    //     await vectorStoreServerOperations.updateChatSession(session_id, {
    //       title: stored_message ? message.substring(0, 50) + "..." : undefined,
    //     });
    //   } catch (sessionError) {
    //     console.warn("⚠️ Failed to store chat messages:", sessionError);
    //     // Continue without storing - don't fail the whole request
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: response.content,
      metadata: {
        context_used: context.length > 0,
        relevant_chunks_count: relevantChunks.length,
        sources: relevantChunks.map((chunk) => ({
          document_title: chunk.document?.title,
          similarity: Math.round(chunk.similarity * 1000) / 1000,
          preview: chunk.content.substring(0, 100) + "...",
        })),
        // session_info: stored_message
        //   ? {
        //       session_id,
        //       message_id: stored_message.id,
        //     }
        //   : null,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in chat:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Simple RAG response generator (replace with your LLM of choice)
async function generateRAGResponse(
  userMessage: string,
  context: string,
  relevantChunks: any[]
): Promise<{ content: string; sources: string[] }> {
  if (context.trim().length === 0) {
    return {
      content: `I don't have enough context in my knowledge base to answer your question about "${userMessage}". Could you try asking about a topic that's covered in the uploaded study materials?`,
      sources: [],
    };
  }

  try {
    // ✅ Create RAG prompt with context
    const ragPrompt = `You are a helpful study assistant. Answer the user's question based on the provided context from study materials.

Context from study materials:
${context}

User Question: ${userMessage}

Instructions:
- Answer based only on the provided context
- Be clear and educational
- If the context doesn't fully answer the question, mention what information is available
- Keep the response concise but informative
- Don't make up information not in the context

Answer:`;

    // ✅ Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable study assistant that helps students understand their study materials. Always base your answers on the provided context.",
        },
        {
          role: "user",
          content: ragPrompt,
        },
      ],
      model: "openai/gpt-oss-20b", // ✅ Using Llama3 (fast and free)
      temperature: 0.3, // ✅ Lower temperature for more focused responses
      max_tokens: 1000, // ✅ Reasonable response length
    });

    const aiResponse = completion.choices[0]?.message?.content;

    console.log("AI Response:", aiResponse);

    if (!aiResponse) {
      throw new Error("No response from Groq AI");
    }

    return {
      content: aiResponse,
      sources: relevantChunks
        .map((chunk) => chunk.document?.title || "Unknown")
        .filter(Boolean),
    };
  } catch (error: any) {
    console.error("❌ Groq API Error:", error);

    // ✅ Fallback to template response if Groq fails
    const fallbackResponse = `Based on the study materials I found, here's what I can tell you about your question: "${userMessage}"

${context.substring(0, 800)}...

${
  relevantChunks.length > 1
    ? `This information comes from ${relevantChunks.length} different sources in your study materials.`
    : "This information comes from your study materials."
}

Would you like me to explain any specific part in more detail or help you with related concepts?

(Note: AI response temporarily unavailable, showing context directly)`;

    return {
      content: fallbackResponse,
      sources: relevantChunks
        .map((chunk) => chunk.document?.title || "Unknown")
        .filter(Boolean),
    };
  }
}

// GET method to retrieve chat sessions
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const session_id = url.searchParams.get("session_id");
    const user_id = url.searchParams.get("user_id");

    if (session_id) {
      // Get specific chat session with messages
      const [sessionResult, messagesResult] = await Promise.all([
        vectorStoreServerOperations.vectorStoreServer
          .from("chat_sessions")
          .select("*")
          .eq("id", session_id)
          .single(),
        vectorStoreServerOperations.vectorStoreServer
          .from("chat_messages")
          .select("*")
          .eq("session_id", session_id)
          .order("created_at", { ascending: true }),
      ]);

      if (sessionResult.error) throw sessionResult.error;
      if (messagesResult.error) throw messagesResult.error;

      return NextResponse.json({
        success: true,
        session: sessionResult.data,
        messages: messagesResult.data,
      });
    } else if (user_id) {
      // Get all sessions for a user
      const { data, error } =
        await vectorStoreServerOperations.vectorStoreServer
          .from("chat_sessions")
          .select("*")
          .eq("user_id", user_id)
          .order("updated_at", { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        sessions: data,
      });
    } else {
      // Get recent public sessions or general info
      const stats = await vectorStoreServerOperations.getDocumentStats();

      return NextResponse.json({
        success: true,
        message: "Chat endpoint is ready",
        stats,
      });
    }
  } catch (error: any) {
    console.error("❌ Error in chat GET:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
