import { createClient } from "@/lib/vector_supabase/server";
import {
  ChatMessage,
  ChatSession,
  SimilarChunk,
  VectorChunk,
  VectorDocument,
} from "./vector-store-service.types";

// Helper function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

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
      chunkIndex: number;
      tokenCount?: number;
      metadata?: Record<string, any>;
    }>
  ) {
    const supabase = await createClient();

    const chunks = chunksWithEmbeddings.map((chunk) => ({
      document_id: documentId, // ✅ String reference
      document_title: documentTitle, // ✅ Cache title
      content: chunk.content,
      embedding: `[${chunk.embedding.join(",")}]`,
      chunk_index: chunk.chunkIndex,
      token_count: chunk.tokenCount || chunk.content.split(" ").length,
      metadata: chunk.metadata || {},
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("document_chunks")
      .insert(chunks)
      .select();

    if (error)
      throw new Error(`Failed to store document chunks: ${error.message}`);
    return data as VectorChunk[];
  },

  // ✅ Updated search with document info
  async searchSimilarChunks(
    queryEmbedding: number[],
    options: {
      limit?: number;
      threshold?: number;
      filters?: {
        subject_id?: string;
        module_id?: string;
        exam_id?: string;
        document_id?: string;
      };
    } = {}
  ): Promise<SimilarChunk[]> {
    const supabase = await createClient();
    const { limit = 20, threshold = 0.3, filters = {} } = options;

    try {
      console.log("Searching with embedding:", queryEmbedding);
      // Call vector_search_function RPC with parameters
      const { data, error } = await supabase.rpc("vector_search_function", {
        query_embedding: queryEmbedding,
        match_threshold: 1 - threshold, // similarity threshold converted to pgvector distance
        limit_count: limit,
      });

      console.log("Raw search results:", data, error);

      if (error) throw new Error(`Vector search failed: ${error.message}`);

      if (!data) return [];

      // Apply additional filters client-side since RPC returns all matches below threshold
      // const filteredResults = (data as any[])
      //   .filter(chunk => {
      //     if (filters.subject_id && chunk.metadata?.subject_id !== filters.subject_id) return false;
      //     if (filters.module_id && chunk.metadata?.module_id !== filters.module_id) return false;
      //     if (filters.exam_id && chunk.metadata?.exam_id !== filters.exam_id) return false;
      //     if (filters.document_id && chunk.document_id !== filters.document_id) return false;
      //     return true;
      //   })
      //   .map(chunk => {
      //     try {
      //       return {
      //         ...chunk,
      //         embedding: typeof chunk.embedding === 'string' ? JSON.parse(chunk.embedding) : chunk.embedding,
      //         similarity: 1 - chunk.similarity_distance, // convert distance back to similarity
      //         document: {
      //           id: chunk.document_id,
      //           title: chunk.document_title,
      //           subject_id: chunk.metadata?.subject_id,
      //           module_id: chunk.metadata?.module_id,
      //           exam_id: chunk.metadata?.exam_id,
      //         },
      //       };
      //     } catch {
      //       console.warn("Failed to parse embedding for chunk:", chunk.id);
      //       return null;
      //     }
      //   })
      //   .filter(Boolean)
      //   .filter(chunk => chunk.similarity >= threshold);

      // return filteredResults as SimilarChunk[];

      return data;
    } catch (error: any) {
      console.error("Error in searchSimilarChunks:", error);
      throw new Error(`Vector search failed: ${error.message}`);
    }
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
