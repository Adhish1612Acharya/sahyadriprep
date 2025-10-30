// src/app/api/rag/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreServerOperations } from "@/services/supabase/vector-store.service";
import doc_loader from "@/lib/rag-chatbot/load-doc";
import create_doc_chunk from "@/lib/rag-chatbot/create-doc-chunk";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";
import embedDocumentsWithHandling from "@/lib/rag-chatbot/embed-documents";
import { InferenceClient } from "@huggingface/inference";

export async function POST(request: NextRequest) {
  try {
    // const body = await request.json();
    // const {
    //   filePath,
    //   title,
    //   subject_id,
    //   module_id,
    //   exam_id,
    //   source_type = "pdf",
    //   source_reference,
    //   metadata = {},
    //   main_project_document_id, // ✅ Pass the main project document ID
    // } = body;

    // Validate required fields
    // if (!filePath || !title) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "filePath and title are required",
    //     },
    //     { status: 400 }
    //   );
    // }

    console.log("🚀 Starting document processing...");
    // console.log("📄 File path:", filePath);

    // Step 1: Load document content
    console.log("📖 Loading document...");
    const documentContent = await doc_loader();

    console.log("Document content loaded:", documentContent);

    if (!documentContent || documentContent.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Document content is empty or could not be loaded",
        },
        { status: 400 }
      );
    }

    console.log(
      `✅ Document loaded. Content length: ${documentContent.length} characters`
    );

    // Step 2: Create document record in vector store
    console.log("💾 Storing document metadata in vector store...");
    // const vectorDocument = await vectorStoreServerOperations.storeDocument({
    //   title,
    //   content: documentContent,
    //   source_type,
    //   source_reference: source_reference || filePath,
    //   subject_id,
    //   module_id,
    //   exam_id,
    //   main_project_document_id, // ✅ Store reference to main project
    //   metadata: {
    //     ...metadata,
    //     original_file_path: filePath,
    //     content_length: documentContent.length,
    //     processed_at: new Date().toISOString(),
    //   },
    // });

    // console.log(`✅ Document stored with ID: ${vectorDocument.id}`);

    // Step 3: Split document into chunks
    console.log("✂️ Creating document chunks...");
    const chunks = await create_doc_chunk(documentContent);

    console.log("Chunks created:", chunks);

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No chunks were created from the document",
        },
        { status: 400 }
      );
    }

    console.log(`✅ Created ${chunks.length} chunks`);

    // -----------------------
    // NEW: Summarize each chunk using Hugging Face Inference
    // -----------------------
    console.log("📝 Summarizing chunks (Hugging Face)...");

    const hfToken = process.env.HF_API_KEY;
    const hfClient = new InferenceClient(hfToken);

    async function summarizeChunk(text: string) {
      const maxAttempts = 3;
      let attempt = 0;
      let backoff = 500;
      const input = text.length > 8000 ? text.slice(0, 8000) : text;

      while (attempt < maxAttempts) {
        try {
          const res = await hfClient.summarization({
            model: "facebook/bart-large-cnn",
            inputs: input,
            // provider optional; keep hf-inference default
            // parameters can be tuned if supported by your client/provider
            parameters: { max_length: 150, min_length: 30, do_sample: false },
            provider: "hf-inference",
          });

          // Handle different possible shapes of response
          let summary = "";
          if (Array.isArray(res) && res.length > 0) {
            summary =
              (res[0] as any).summary_text ||
              (res[0] as any).generated_text ||
              (res[0] as any).text ||
              String(res[0]);
          } else if (typeof res === "object" && res !== null) {
            summary =
              (res as any).summary_text ||
              (res as any).generated_text ||
              (res as any).text ||
              JSON.stringify(res);
          } else {
            summary = String(res);
          }

          summary = summary.trim();
          if (summary.length === 0) throw new Error("Empty summary returned");
          return summary;
        } catch (err: any) {
          attempt += 1;
          if (attempt >= maxAttempts) break;
          console.warn(
            `HF summarization attempt ${attempt} failed: ${
              err?.message || err
            }. retrying in ${backoff}ms`
          );
          await new Promise((r) => setTimeout(r, backoff));
          backoff *= 2;
        }
      }

      // Final fallback: short truncation as pseudo-summary
      console.warn(
        "HF summarization failed, using truncated fallback summary."
      );
      return text.trim().slice(0, 300) + (text.length > 300 ? "…" : "");
    }

    // Run sequentially (safer for rate limits). Add tiny delay between calls.
    const summaries: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const s = await summarizeChunk(chunks[i]);
      summaries.push(s);
      await new Promise((r) => setTimeout(r, 150)); // small throttle
    }

    console.log(`✅ Generated ${summaries.length} summaries`);

    // Step 4: Generate embeddings for summaries (not raw chunks)
    console.log("🧠 Generating embeddings for summaries...");
    const embeddings_array = await embedDocumentsWithHandling(
      embeddings,
      summaries
    );

    console.log("Embeddings generated:", embeddings_array);

    if (embeddings_array.length !== chunks.length) {
      throw new Error("Mismatch between chunks and embeddings count");
    }

    console.log(`✅ Generated ${embeddings_array.length} embeddings`);

    // Step 5: Prepare chunks with embeddings and include summary + original text
    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      content: chunk,
      summary: summaries[index],
      embedding: embeddings_array[index],
      chunk_index: index,
      tokenCount: chunk.split(" ").length,
      metadata: {
        chunk_length: chunk.length,
        summary_length: summaries[index].length,
        word_count: chunk.split(" ").length,
        // subject_id, module_id, exam_id can be added here
      },
    }));

    // Step 6: Store chunks with document reference
    console.log("🗄️ Storing chunks in vector database...");
    const storedChunks = await vectorStoreServerOperations.storeDocumentChunks(
      "123", // ✅ Use vector store document ID
      "demo", // ✅ Pass title for caching
      chunksWithEmbeddings
    );

    console.log(`✅ Stored ${storedChunks.length} chunks in vector database`);

    // ✅ Update main project document status (optional)
    // if (main_project_document_id) {
    //   await updateMainProjectDocument(main_project_document_id, {
    //     vector_store_status: "processed",
    //     vector_chunks_count: storedChunks.length,
    //     vector_document_id: vectorDocument.id,
    //   });
    // }

    // Step 7: Get final statistics
    // const stats = await vectorStoreServerOperations.getDocumentStats();

    return NextResponse.json({
      success: true,
      message: "Document processed and stored successfully",
      data: {
        // vector_document: {
        //   id: vectorDocument.id,
        //   title: vectorDocument.title,
        //   main_project_reference: main_project_document_id,
        // },
        processing: {
          chunks_created: chunks.length,
          embeddings_generated: embeddings_array.length,
          chunks_stored: storedChunks.length,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error processing document:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process document",
        details: error.stack ? error.stack.split("\n").slice(0, 5) : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to check processing status or list documents
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId");

    if (documentId) {
      // Get specific document info
      const { data, error } =
        await vectorStoreServerOperations.vectorStoreServer
          .from("documents")
          .select(
            `
          *,
          document_chunks(count)
        `
          )
          .eq("id", documentId)
          .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        document: data,
      });
    } else {
      // Get all documents with chunk counts
      const { data, error } =
        await vectorStoreServerOperations.vectorStoreServer
          .from("documents")
          .select(
            `
          id,
          title,
          source_type,
          subject_id,
          module_id,
          exam_id,
          created_at,
          document_chunks(count)
        `
          )
          .order("created_at", { ascending: false })
          .limit(50);

      if (error) throw error;

      const stats = await vectorStoreServerOperations.getDocumentStats();

      return NextResponse.json({
        success: true,
        documents: data,
        stats,
      });
    }
  } catch (error: any) {
    console.error("❌ Error fetching documents:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ Helper function to update main project
async function updateMainProjectDocument(documentId: string, updates: any) {
  try {
    // Import your main project supabase client
    const { createClient: createMainClient } = await import(
      "@/lib/supabase/server"
    );
    const mainSupabase = await createMainClient();

    await mainSupabase.from("documents").update(updates).eq("id", documentId);
  } catch (error) {
    console.warn("Failed to update main project document status:", error);
    // Don't fail the whole process if this fails
  }
}
