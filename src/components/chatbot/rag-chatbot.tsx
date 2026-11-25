"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  RefreshCw,
  Loader2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRagChatbot } from "@/hooks/useRagChatbot.hook";
import { MessageItem } from "@/components/rag/message-item"; // ✅ Import MessageItem

export default function RagChatbot() {
  const {
    messages,
    isTyping,
    isLoading,
    sendMessage,
    clearConversation,
    retryLastMessage,
  } = useRagChatbot();

  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Handle send message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;

    sendMessage(inputMessage);
    setInputMessage("");
    textareaRef.current?.focus();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 px-3 py-2 border-b flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={retryLastMessage}
          disabled={messages.length === 0 || isLoading}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          disabled={messages.length === 0}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        {/* Radix wraps content in a display:table div that grows to fit wide
            children (e.g. the Sources tab), pushing messages out of the panel.
            Force it to block so content wraps to the panel width. */}
        <ScrollArea className="h-full [&_[data-slot=scroll-area-viewport]>div]:!block">
          <div className="p-4">
            {messages.length === 0 ? (
              <EmptyState setInputMessage={setInputMessage} />
            ) : (
              <div className="space-y-4">
                {/* ✅ Use MessageItem component */}
                {messages.map((message, index) => (
                  <MessageItem key={index} message={message} />
                ))}

                {isTyping && <TypingIndicator />}

                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <InputArea
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        isLoading={isLoading}
        messageCount={messages.length}
        textareaRef={textareaRef}
      />
    </div>
  );
}

// ========================================
// Sub-components
// ========================================

function EmptyState({
  setInputMessage,
}: {
  setInputMessage: (msg: string) => void;
}) {
  const suggestions = [
    { label: "Deloitte", query: "What was the Deloitte interview process?" },
    { label: "Technical rounds", query: "Tell me about technical rounds" },
    { label: "HR rounds", query: "What to expect in HR rounds?" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4 text-muted-foreground py-8">
      <MessageSquare className="h-12 w-12 opacity-20" />
      <div>
        <h3 className="text-base font-semibold mb-1">Start a conversation</h3>
        <p className="text-xs">
          Ask about interview experiences and preparation tips
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {suggestions.map((suggestion) => (
          <Badge
            key={suggestion.label}
            variant="outline"
            className="cursor-pointer hover:bg-accent text-xs"
            onClick={() => setInputMessage(suggestion.query)}
          >
            {suggestion.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
        <AvatarFallback className="bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted/50 border rounded-lg px-4 py-3">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
          <div
            className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}

function InputArea({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyDown,
  isLoading,
  messageCount,
  textareaRef,
}: {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  messageCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="px-3 py-2 border-t flex-shrink-0">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about interviews..."
          className="min-h-[50px] max-h-[120px] resize-none text-sm"
          disabled={isLoading}
          rows={2}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          size="sm"
          className="px-3 self-end"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
        <span>Enter to send • Shift + Enter for new line</span>
        <span>{messageCount} messages</span>
      </div>
    </div>
  );
}
