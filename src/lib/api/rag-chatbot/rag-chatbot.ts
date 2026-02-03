import { CHAT_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { ChatRequest, ChatResponse } from "@/types/rag-service.types";
import { httpGet, httpPost } from "@/lib/api/http";
import { Camelize } from "@/types";

export const ragChatbotApi = {
  sendMessage: async (
    request: ChatRequest,
  ): Promise<Camelize<ChatResponse>> => {
    const response = await httpPost<Camelize<ChatResponse>, any>(
      CHAT_ENDPOINTS.SEND_MESSAGE,
      {
        message: request.message,
        conversation_history: request.conversation_history || [],
        search_limit: request.search_limit || 5,
        similarity_threshold: 0.35,
      },
    );
    return response;
  },

  getStats: async (): Promise<any> => {
    const response = await httpGet<any>(CHAT_ENDPOINTS.BASE);
    return response;
  },
};
