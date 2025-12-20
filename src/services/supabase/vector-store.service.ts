import { createClient } from "@/lib/vector_supabase/server";
import {
  ChatMessage,
  ChatSession,
  VectorChunk,
  VectorDocument,
} from "@/types/vector-store-service.types";
import { CHUNKS_CONTENT_TYPES } from "@/constants/chunks-content-types.constants";
import embeddings from "@/integrations/hf/hf-embeddings";
import { ContentType } from "@/models/content-chunk.types";
import createChunkSummary from "@/features/rag/generate-chunk-summary";

// Server-side vector store operations
export const vectorStoreServerOperations = {
  // Store a new document
  async storeDocument(
    document: Omit<VectorDocument, "id" | "created_at" | "updated_at">
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("documents")
      .insert({
        ...document,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to store document: ${error.message}`);
    return data as VectorDocument;
  },

  // ✅ Updated store chunks method
  async storeDocumentChunks(
    documentId: string,
    documentTitle: string, // ✅ Pass title for caching
    chunksWithEmbeddings: Array<{
      content: string;
      embedding: number[];
      chunk_index: number;
      tokenCount?: number;
      metadata?: Record<string, any>;
    }>
  ) {
    const supabase = await createClient();

    const chunks = chunksWithEmbeddings;

    const { data, error } = await supabase
      .from("document_chunks")
      .insert(chunks)
      .select();

    if (error)
      throw new Error(`Failed to store document chunks: ${error.message}`);
    return data as VectorChunk[];
  },

  /**
   * ✅ Updated search method - accepts optional pre-generated summary and company filter
   */
  search: async (
    query: string,
    options?: {
      contentType?: ContentType;
      threshold?: number;
      limit?: number;
      querySummary?: string;
      companyIds?: string[]; // ✅ NEW: Company filter
    }
  ) => {
    const supabase = await createClient();

    // ✅ Use provided summary or generate new one
    let query_summary: string;

    if (options?.querySummary) {
      console.log("📝 Using pre-generated query summary");
      query_summary = options.querySummary;
    } else {
      console.log("🧠 Generating new query summary...");
      query_summary = await createChunkSummary(query);
      console.log(
        "✅ Generated query summary:",
        query_summary.substring(0, 100) + "..."
      );
    }

    const queryEmbedding = await embeddings.embedQuery(query_summary);

    const { data, error } = await supabase.rpc("match_content", {
      query_embedding: queryEmbedding,
      match_threshold: options?.threshold || 0.5, // ✅ Fixed: Use directly, no inversion
      match_count: options?.limit || 10,
      filter_content_type: options?.contentType || null,
      filter_company_ids:
        options?.companyIds && options.companyIds.length > 0
          ? options.companyIds
          : null, // ✅ NEW: Pass company IDs array
    });

    if (error) throw error;
    return data;
  },

  /**
   * ✅ Updated: Search interview experiences with optional summary and company filter
   */
  searchInterviewExperiences: async (
    query: string,
    limit = 10,
    querySummary?: string,
    companyIds?: string[] // ✅ NEW parameter
  ) => {
    return vectorStoreServerOperations.search(query, {
      contentType: CHUNKS_CONTENT_TYPES.INTERVIEW_EXPERIENCE,
      threshold: 0.5, // ✅ Fixed: Changed from 0.75 to 0.5 (50% similarity)
      limit,
      querySummary,
      companyIds, // ✅ Pass company filter
    });
  },

  /**
   * ✅ Updated: Search YouTube transcript with optional summary and company filter
   */
  searchYouTubeVideosTranscript: async (
    query: string,
    limit = 10,
    querySummary?: string,
    companyIds?: string[] // ✅ NEW parameter
  ) => {
    return vectorStoreServerOperations.search(query, {
      contentType: CHUNKS_CONTENT_TYPES.YOUTUBE_VIDEO_TRANSCRIPT,
      threshold: 0.5, // ✅ Fixed: Changed from 0.7 to 0.5
      limit,
      querySummary,
      companyIds, // ✅ Pass company filter
    });
  },

  /**
   * ✅ Updated: Search YouTube title with optional summary and company filter
   */
  searchYouTubeVideosTitle: async (
    query: string,
    limit = 10,
    querySummary?: string,
    companyIds?: string[] // ✅ NEW parameter
  ) => {
    return vectorStoreServerOperations.search(query, {
      contentType: CHUNKS_CONTENT_TYPES.YOUTUBE_VIDEO_TITLE,
      threshold: 0.5, // ✅ Fixed: Changed from 0.7 to 0.5
      limit,
      querySummary,
      companyIds, // ✅ Pass company filter
    });
  },

  /**
   * ✅ Updated: Search YouTube description with optional summary and company filter
   */
  searchYouTubeVideosDescription: async (
    query: string,
    limit = 10,
    querySummary?: string,
    companyIds?: string[] // ✅ NEW parameter
  ) => {
    return vectorStoreServerOperations.search(query, {
      contentType: CHUNKS_CONTENT_TYPES.YOUTUBE_VIDEO_DESCRIPTION,
      threshold: 0.5, // ✅ Fixed: Changed from 0.7 to 0.5
      limit,
      querySummary,
      companyIds, // ✅ Pass company filter
    });
  },

  // Create chat session
  async createChatSession(
    session: Omit<ChatSession, "id" | "created_at" | "updated_at">
  ) {
    const vectorStoreServer = await createClient();

    const { data, error } = await vectorStoreServer
      .from("chat_sessions")
      .insert({
        ...session,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create chat session: ${error.message}`);
    return data as ChatSession;
  },

  // Add chat message
  async addChatMessage(message: Omit<ChatMessage, "id" | "created_at">) {
    const vectorStoreServer = await createClient();
    const { data, error } = await vectorStoreServer
      .from("chat_messages")
      .insert({
        ...message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add chat message: ${error.message}`);
    return data as ChatMessage;
  },

  // Update chat session
  async updateChatSession(sessionId: string, updates: Partial<ChatSession>) {
    const vectorStoreServer = await createClient();

    const { data, error } = await vectorStoreServer
      .from("chat_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update chat session: ${error.message}`);
    return data as ChatSession;
  },

  // Get chat messages for a session
  async getChatMessages(sessionId: string) {
    const vectorStoreServer = await createClient();

    const { data, error } = await vectorStoreServer
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to get chat messages: ${error.message}`);
    return data as ChatMessage[];
  },

  // Get chat sessions for a user
  async getChatSessions(userId: string) {
    const vectorStoreServer = await createClient();
    const { data, error } = await vectorStoreServer
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to get chat sessions: ${error.message}`);
    return data as ChatSession[];
  },

  // Delete document and its chunks
  async deleteDocument(documentId: string) {
    const vectorStoreServer = await createClient();
    // First delete chunks (due to foreign key constraint)
    const { error: chunksError } = await vectorStoreServer
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);

    if (chunksError)
      throw new Error(
        `Failed to delete document chunks: ${chunksError.message}`
      );

    // Then delete document
    const { error: docError } = await vectorStoreServer
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (docError)
      throw new Error(`Failed to delete document: ${docError.message}`);

    return { success: true };
  },

  // Get document by ID
  async getDocument(documentId: string) {
    const vectorStoreServer = await createClient();

    const { data, error } = await vectorStoreServer
      .from("documents")
      .select(
        `
        *,
        document_chunks(count)
      `
      )
      .eq("id", documentId)
      .single();

    if (error) throw new Error(`Failed to get document: ${error.message}`);
    return data as VectorDocument & { document_chunks: [{ count: number }] };
  },

  // Get all documents with pagination
  async getDocuments(
    page = 1,
    limit = 20,
    filters: Partial<VectorDocument> = {}
  ) {
    const vectorStoreServer = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = vectorStoreServer.from("documents").select(
      `
        *,
        document_chunks(count)
      `,
      { count: "exact" }
    );

    // Apply filters
    if (filters.subject_id) {
      query = query.eq("subject_id", filters.subject_id);
    }
    if (filters.module_id) {
      query = query.eq("module_id", filters.module_id);
    }
    if (filters.exam_id) {
      query = query.eq("exam_id", filters.exam_id);
    }
    if (filters.source_type) {
      query = query.eq("source_type", filters.source_type);
    }

    const { data, error, count } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get documents: ${error.message}`);

    return {
      documents: data as (VectorDocument & {
        document_chunks: [{ count: number }];
      })[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Get document statistics
  async getDocumentStats() {
    try {
      const vectorStoreServer = await createClient();

      const [documentsResult, chunksResult, sessionsResult] = await Promise.all(
        [
          vectorStoreServer
            .from("documents")
            .select("id", { count: "exact", head: true }),
          vectorStoreServer
            .from("document_chunks")
            .select("id", { count: "exact", head: true }),
          vectorStoreServer
            .from("chat_sessions")
            .select("id", { count: "exact", head: true }),
        ]
      );

      return {
        total_documents: documentsResult.count || 0,
        total_chunks: chunksResult.count || 0,
        total_chat_sessions: sessionsResult.count || 0,
      };
    } catch (error: any) {
      console.error("Error getting stats:", error);
      return {
        total_documents: 0,
        total_chunks: 0,
        total_chat_sessions: 0,
      };
    }
  },

  // Search documents by text (not vector search)
  async searchDocumentsByText(
    searchTerm: string,
    filters: Partial<VectorDocument> = {}
  ) {
    const vectorStoreServer = await createClient();

    let query = vectorStoreServer
      .from("documents")
      .select("*")
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);

    // Apply filters
    if (filters.subject_id) {
      query = query.eq("subject_id", filters.subject_id);
    }
    if (filters.module_id) {
      query = query.eq("module_id", filters.module_id);
    }
    if (filters.exam_id) {
      query = query.eq("exam_id", filters.exam_id);
    }
    if (filters.source_type) {
      query = query.eq("source_type", filters.source_type);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(`Text search failed: ${error.message}`);
    return data as VectorDocument[];
  },
};
