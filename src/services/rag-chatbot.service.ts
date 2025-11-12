import { axiosClient } from "@/lib/axiosClient";
import { CHAT_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { ChatRequest, ChatResponse } from "@/types/rag-service.types";

/**
 * RAG Chatbot Service
 */
export const ragChatbotService = {
  /**
   * Send a message to the RAG chatbot
   */
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await axiosClient.post<ChatResponse>(
      CHAT_ENDPOINTS.SEND_MESSAGE,
      {
        message: request.message,
        conversation_history: request.conversation_history || [],
        search_limit: request.search_limit || 5,
        similarity_threshold: 0.35,
        //  request.similarity_threshold || 0.75,
      }
    );

    return response.data;
  },

  /**
   * Get chat statistics
   */
  getStats: async (): Promise<any> => {
    const response = await axiosClient.get(CHAT_ENDPOINTS.BASE);
    return response.data;
  },
};
