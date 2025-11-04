import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { ragChatbotService } from "@/services/rag-chatbot.service";
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
} from "@/types/rag-service.types";
// import { useToast } from "@/hooks/use-toast";

/**
 * Hook for RAG chatbot with conversation management
 */
export function useRagChatbot() {
  const queryClient = useQueryClient();
  //   const { toast } = useToast();

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Send message mutation
   */
  const sendMessageMutation = useMutation({
    mutationFn: (request: ChatRequest) =>
      ragChatbotService.sendMessage(request),
    onMutate: async (variables) => {
      // Optimistically add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: variables.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (data, variables) => {
      // ✅ Add assistant response with sources
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        sources: data.sources, // ✅ Include sources from response
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      // Log performance
      console.log("📊 Chat Performance:", data.metadata?.performance);
      console.log("📚 Sources:", {
        interview_documents: data.sources?.interview_documents.length || 0,
        youtube_videos: data.sources?.youtube_videos.length || 0,
        youtube_timestamps: data.sources?.youtube_timestamps.length || 0,
      });
    },
    onError: (error: Error) => {
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
      setIsTyping(false);

      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${
          error.message || "Failed to send message"
        }`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      // toast({
      //   title: "Error",
      //   description: error.message || "Failed to send message",
      //   variant: "destructive",
      // });
    },
  });

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    (
      message: string,
      options?: { search_limit?: number; similarity_threshold?: number }
    ) => {
      if (!message.trim()) {
        // toast({
        //   title: "Empty message",
        //   description: "Please enter a message",
        //   variant: "destructive",
        // });
        return;
      }

      sendMessageMutation.mutate({
        message: message.trim(),
        conversation_history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        search_limit: options?.search_limit,
        similarity_threshold: options?.similarity_threshold,
      });
    },
    [
      messages,
      sendMessageMutation,
      // toast
    ]
  );

  /**
   * Clear conversation
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
  }, []);

  /**
   * Retry last message
   */
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (lastUserMessage) {
      // Remove last user and assistant messages
      setMessages((prev) => prev.slice(0, -2));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    // State
    messages,
    isTyping,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    lastResponse: sendMessageMutation.data,

    // Actions
    sendMessage,
    clearConversation,
    retryLastMessage,

    // Mutation
    mutation: sendMessageMutation,
  };
}
