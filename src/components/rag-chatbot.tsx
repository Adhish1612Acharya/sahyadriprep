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
import { Separator } from "@/components/ui/separator";
import { useRagChatbot } from "@/hooks/useRagChatbot.hook";
import { cn } from "@/lib/utils";

export default function RagChatbot() {
  const {
    messages,
    isTyping,
    isLoading,
    lastResponse,
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

      {/* Chat Messages - ✅ FIXED: Added explicit height */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-3 text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 opacity-20" />
                <div>
                  <h3 className="text-base font-semibold mb-1">
                    Start a conversation
                  </h3>
                  <p className="text-xs">Ask about interview experiences</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent text-xs"
                    onClick={() =>
                      setInputMessage(
                        "What was the Deloitte interview process?"
                      )
                    }
                  >
                    Deloitte
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent text-xs"
                    onClick={() =>
                      setInputMessage("Tell me about technical rounds")
                    }
                  >
                    Technical rounds
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg p-3 space-y-2 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>

                      {message.role === "assistant" &&
                        lastResponse &&
                        index === messages.length - 1 && (
                          <>
                            <Separator className="my-2" />
                            <div className="text-xs space-y-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-semibold">Sources:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {lastResponse.metadata.relevant_chunks_count}
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                {lastResponse.metadata.sources
                                  .slice(0, 2)
                                  .map((source, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs p-2 bg-background rounded border"
                                    >
                                      <div className="font-semibold">
                                        {source.company} ({source.batch})
                                      </div>
                                      <div className="text-muted-foreground truncate">
                                        {source.student} •{" "}
                                        {(source.similarity * 100).toFixed(0)}%
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </>
                        )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                          U
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
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
                )}

                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - ✅ FIXED: Made flex-shrink-0 */}
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
          <span>Enter to send</span>
          <span>{messages.length} msgs</span>
        </div>
      </div>
    </div>
  );
}
