// src/app/api/rag/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/services/supabase/vector-store.service";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      limit = 5,
      threshold = 0.7,
      filters = {},
      include_document_info = true,
    } = body;

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Validate numeric parameters
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Limit must be between 1 and 50",
        },
        { status: 400 }
      );
    }

    if (threshold < 0 || threshold > 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Threshold must be between 0 and 1",
        },
        { status: 400 }
      );
    }

    console.log("🔍 Processing search query:", query);
    console.log("📊 Search parameters:", { limit, threshold, filters });

    // Step 1: Generate embedding for the search query
    console.log("🧠 Generating query embedding...");
    const startTime = Date.now();
    const queryEmbedding = await embeddings.embedQuery(query);
    const embeddingTime = Date.now() - startTime;

    console.log(`✅ Query embedding generated in ${embeddingTime}ms`);
    console.log(`📏 Embedding dimension: ${queryEmbedding.length}`);

    // Step 2: Search for similar chunks
    console.log("🔎 Searching for similar chunks...");
    const searchStartTime = Date.now();

    const searchResults = await vectorStoreServerOperations.searchSimilarChunks(
      queryEmbedding,
      {
        limit,
        threshold,
        filters: {
          subject_id: filters.subject_id,
          module_id: filters.module_id,
          exam_id: filters.exam_id,
          document_id: filters.document_id,
        },
      }
    );

    const searchTime = Date.now() - searchStartTime;
    console.log(`✅ Search completed in ${searchTime}ms`);
    console.log(`📊 Found ${searchResults.length} similar chunks`);

    // Step 3: Format results
    const formattedResults = searchResults.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      similarity: Math.round(chunk.similarity * 1000) / 1000, // Round to 3 decimal places
      chunk_index: chunk.chunk_index,
      token_count: chunk.token_count,
      metadata: chunk.metadata,
      document_info: include_document_info
        ? {
            id: chunk.document?.id,
            title: chunk.document?.title,
            subject_id: chunk.document?.subject_id,
            module_id: chunk.document?.module_id,
            exam_id: chunk.document?.exam_id,
            source_type: chunk.document?.source_type,
          }
        : undefined,
    }));

    // Step 4: Generate context for potential chat response
    const context = searchResults
      .slice(0, 3) // Use top 3 results for context
      .map((chunk) => chunk.content)
      .join("\n\n");

    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
      context,
      metadata: {
        total_results: searchResults.length,
        search_parameters: {
          limit,
          threshold,
          filters: Object.keys(filters).length > 0 ? filters : "none",
        },
        performance: {
          embedding_time_ms: embeddingTime,
          search_time_ms: searchTime,
          total_time_ms: embeddingTime + searchTime,
        },
        embedding_info: {
          dimension: queryEmbedding.length,
          model: process.env.NEXT_PUBLIC_HF_MODEL_NAME || "default",
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error in search:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Search failed",
        details: error.stack ? error.stack.split("\n").slice(0, 5) : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method for getting search suggestions or recent searches
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "suggestions";

    if (type === "suggestions") {
      // Return some sample search suggestions based on available documents
      const { data, error } =
        await vectorStoreServerOperations.vectorStoreServer
          .from("documents")
          .select("title, subject_id, module_id")
          .limit(10);

      if (error) throw error;

      const suggestions = [
        "What is machine learning?",
        "Explain data structures",
        "How does recursion work?",
        "What are the types of algorithms?",
        "Explain object-oriented programming",
        ...data.map((doc) => `Tell me about ${doc.title}`),
      ];

      return NextResponse.json({
        success: true,
        suggestions: suggestions.slice(0, 10),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Search endpoint is ready",
    });
  } catch (error: any) {
    console.error("❌ Error in search GET:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
