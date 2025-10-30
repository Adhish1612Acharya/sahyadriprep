// src/app/api/rag/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/services/supabase/vector-store.service";
import generateRAGResponse from "@/helpers/generate-rag-response.helpers";

/**
 * POST /api/chat
 * RAG chatbot for interview experiences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      // session_id,
      // user_id,
      conversation_history = [],
      search_limit = 5,
      similarity_threshold = 0.75,
    } = body;

    // ✅ Validation
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (search_limit < 1 || search_limit > 20) {
      return NextResponse.json(
        { success: false, error: "Search limit must be between 1 and 20" },
        { status: 400 }
      );
    }

    if (similarity_threshold < 0 || similarity_threshold > 1) {
      return NextResponse.json(
        { success: false, error: "Threshold must be between 0 and 1" },
        { status: 400 }
      );
    }

    console.log("💬 Processing chat message:", message);
    console.log("📊 Search parameters:", {
      search_limit,
      similarity_threshold,
    });

    const startTime = Date.now();

    // ✅ Step 1: Search interview experiences using new method
    console.log("🔍 Searching interview experiences...");
    const searchStartTime = Date.now();

    const relevantChunks =
      await vectorStoreServerOperations.searchInterviewExperiences(
        message,
        search_limit
      );

    const searchTime = Date.now() - searchStartTime;
    console.log(`✅ Search completed in ${searchTime}ms`);
    console.log(`📊 Found ${relevantChunks.length} relevant chunks`);
    console.log("Releveant Chunks: ", relevantChunks);

    // ✅ Step 2: Build context from relevant chunks
    const context = relevantChunks
      .map((chunk: any, index: number) => {
        const metadata = chunk.metadata || {};
        const source =
          metadata.document_title ||
          metadata.company_name ||
          metadata.student_name ||
          "Interview Experience";

        return `[Source ${index + 1}: ${source}]
Company: ${metadata.company_name || "N/A"}
Student: ${metadata.student_name || "Anonymous"}
Batch: ${metadata.batch || "N/A"}
Similarity: ${(chunk.similarity * 100).toFixed(1)}%

Summary:
${chunk.summary || "No summary available"}

Full Content:
${chunk.content || "No content available"}`;
      })
      .join("\n\n---\n\n");

    console.log("📝 Context length:", context.length);
    console.log("Context: ", context);

    // ✅ Step 3: Generate AI response with context
    const responseStartTime = Date.now();
    const response = await generateRAGResponse(
      message,
      context,
      relevantChunks,
      conversation_history
    );
    const responseTime = Date.now() - responseStartTime;

    console.log(`🤖 AI response generated in ${responseTime}ms`);

    // // ✅ Step 4: Store chat messages (optional)
    // let stored_message_id = null;
    // if (session_id) {
    //   try {
    //     // Store user message
    //     await vectorStoreServerOperations.addChatMessage({
    //       session_id,
    //       role: "user",
    //       content: message,
    //       metadata: {
    //         timestamp: new Date().toISOString(),
    //         search_limit,
    //         similarity_threshold,
    //       },
    //     });

    //     // Store assistant response
    //     const stored_message = await vectorStoreServerOperations.addChatMessage(
    //       {
    //         session_id,
    //         role: "assistant",
    //         content: response.content,
    //         metadata: {
    //           relevant_chunks: relevantChunks.length,
    //           context_used: context.length > 0,
    //           sources: relevantChunks.map((chunk: any) => ({
    //             content_id: chunk.id,
    //             content_type: chunk.content_type,
    //             similarity: chunk.similarity,
    //             metadata: chunk.metadata,
    //           })),
    //           performance: {
    //             search_time_ms: searchTime,
    //             response_time_ms: responseTime,
    //           },
    //         },
    //       }
    //     );

    //     stored_message_id = stored_message.id;

    //     // Update session timestamp and title
    //     await vectorStoreServerOperations.updateChatSession(session_id, {
    //       title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    //     });

    //     console.log("💾 Chat messages stored successfully");
    // } catch (sessionError) {
    //   console.warn("Some error occurred", sessionError);
    //   // Continue without storing - don't fail the whole request
    // }

    const totalTime = Date.now() - startTime;

    // ✅ Step 5: Return response
    return NextResponse.json({
      success: true,
      message: response.content,
      metadata: {
        context_used: context.length > 0,
        relevant_chunks_count: relevantChunks.length,
        sources: relevantChunks.map((chunk: any) => ({
          content_type: chunk.content_type,
          similarity: Math.round(chunk.similarity * 1000) / 1000,
          company: chunk.metadata?.company_name || "N/A",
          student: chunk.metadata?.student_name || "Anonymous",
          batch: chunk.metadata?.batch || "N/A",
          preview: chunk.content.substring(0, 150) + "...",
        })),
        // session_info: session_id
        //   ? {
        //       session_id,
        //       message_id: stored_message_id,
        //     }
        //   : null,
        performance: {
          search_time_ms: searchTime,
          response_time_ms: responseTime,
          total_time_ms: totalTime,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error in chat:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Chat processing failed",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve chat sessions
// export async function GET(request: NextRequest) {
//   try {
//     const url = new URL(request.url);
//     const session_id = url.searchParams.get("session_id");
//     const user_id = url.searchParams.get("user_id");

//     if (session_id) {
//       // Get specific chat session with messages
//       const [sessionResult, messagesResult] = await Promise.all([
//         vectorStoreServerOperations.vectorStoreServer
//           .from("chat_sessions")
//           .select("*")
//           .eq("id", session_id)
//           .single(),
//         vectorStoreServerOperations.vectorStoreServer
//           .from("chat_messages")
//           .select("*")
//           .eq("session_id", session_id)
//           .order("created_at", { ascending: true }),
//       ]);

//       if (sessionResult.error) throw sessionResult.error;
//       if (messagesResult.error) throw messagesResult.error;

//       return NextResponse.json({
//         success: true,
//         session: sessionResult.data,
//         messages: messagesResult.data,
//       });
//     } else if (user_id) {
//       // Get all sessions for a user
//       const { data, error } =
//         await vectorStoreServerOperations.vectorStoreServer
//           .from("chat_sessions")
//           .select("*")
//           .eq("user_id", user_id)
//           .order("updated_at", { ascending: false });

//       if (error) throw error;

//       return NextResponse.json({
//         success: true,
//         sessions: data,
//       });
//     } else {
//       // Get recent public sessions or general info
//       const stats = await vectorStoreServerOperations.getDocumentStats();

//       return NextResponse.json({
//         success: true,
//         message: "Chat endpoint is ready",
//         stats,
//       });
//     }
//   } catch (error: any) {
//     console.error("❌ Error in chat GET:", error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
