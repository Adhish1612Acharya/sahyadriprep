// src/app/api/rag/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/lib/supabase/vector-server";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
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

    // Step 3: Build context from relevant chunks
    const context = relevantChunks
      .map(
        (chunk) =>
          `[From: ${chunk.document?.title || "Document"}]\n${chunk.content}`
      )
      .join("\n\n---\n\n");

    // Step 4: Generate response (simple template-based for now)
    const response = await generateRAGResponse(
      message,
      context,
      relevantChunks
    );

    // Step 5: Store chat message if session_id provided
    let stored_message = null;
    if (session_id) {
      try {
        // Store user message
        await vectorStoreServerOperations.addChatMessage({
          session_id,
          role: "user",
          content: message,
          metadata: {
            timestamp: new Date().toISOString(),
            embedding_dimension: queryEmbedding.length,
          },
        });

        // Store assistant response
        stored_message = await vectorStoreServerOperations.addChatMessage({
          session_id,
          role: "assistant",
          content: response.content,
          metadata: {
            relevant_chunks: relevantChunks.length,
            context_used: context.length > 0,
            sources: relevantChunks.map((chunk) => ({
              document_id: chunk.document_id,
              title: chunk.document?.title,
              similarity: chunk.similarity,
            })),
          },
        });

        // Update session timestamp
        await vectorStoreServerOperations.updateChatSession(session_id, {
          title: stored_message ? message.substring(0, 50) + "..." : undefined,
        });
      } catch (sessionError) {
        console.warn("⚠️ Failed to store chat messages:", sessionError);
        // Continue without storing - don't fail the whole request
      }
    }

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
        session_info: stored_message
          ? {
              session_id,
              message_id: stored_message.id,
            }
          : null,
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

  // Simple template-based response (replace with actual LLM)
  const response = `Based on the study materials I found, here's what I can tell you about your question: "${userMessage}"

${context.substring(0, 800)}...

${
  relevantChunks.length > 1
    ? `This information comes from ${relevantChunks.length} different sources in your study materials.`
    : "This information comes from your study materials."
}

Would you like me to explain any specific part in more detail or help you with related concepts?`;

  return {
    content: response,
    sources: relevantChunks
      .map((chunk) => chunk.document?.title || "Unknown")
      .filter(Boolean),
  };
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
