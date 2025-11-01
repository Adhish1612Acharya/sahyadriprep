"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  RefreshCw,
  Loader2,
  Sparkles,
  MessageSquare,
  ChevronDown,
  FileText,
  Video,
  Clock,
  ExternalLink,
  PlayCircle,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { useRagChatbot } from "@/hooks/useRagChatbot.hook";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { RAGResponse } from "@/types/rag-chatbot.types";

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
  const [openSources, setOpenSources] = useState<{ [key: number]: boolean }>(
    {}
  );
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

  // Toggle sources accordion
  const toggleSources = (index: number) => {
    setOpenSources((prev) => ({ ...prev, [index]: !prev[index] }));
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
        <ScrollArea className="h-full">
          <div className="p-4">
            {messages.length === 0 ? (
              <EmptyState setInputMessage={setInputMessage} />
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index}>
                    <MessageBubble message={message} />

                    {/* Sources Section (only for assistant messages) */}
                    {message.role === "assistant" &&
                      message.sources &&
                      Object.keys(message.sources).length > 0 && (
                        <SourcesSection
                          sources={message.sources as RAGResponse["sources"]}
                          metadata={message.metadata}
                          isOpen={openSources[index]}
                          onToggle={() => toggleSources(index)}
                        />
                      )}
                  </div>
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
    { label: "Google tips", query: "Tips for Google interviews?" },
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

function MessageBubble({ message }: { message: any }) {
  return (
    <div
      className={cn(
        "flex gap-2",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {message.role === "assistant" && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-sm",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>

      {message.role === "user" && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
            U
          </div>
        </div>
      )}
    </div>
  );
}

function SourcesSection({
  sources,
  metadata,
  isOpen,
  onToggle,
}: {
  sources: RAGResponse["sources"];
  metadata?: RAGResponse["metadata"];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const totalSources =
    sources.interview_documents.length +
    sources.youtube_videos.length +
    sources.youtube_timestamps.length;

  if (totalSources === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="mt-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between text-xs h-8"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            <span>
              View {totalSources} Source{totalSources !== 1 ? "s" : ""}
            </span>
            {metadata && (
              <Badge variant="secondary" className="text-xs h-5">
                {Math.round(metadata.performance.total_time_ms)}ms
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-3">
        {/* Interview Documents */}
        {sources.interview_documents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <FileText className="h-3 w-3" />
              Interview Documents ({sources.interview_documents.length})
            </div>
            {sources.interview_documents.map((doc) => (
              <InterviewDocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}

        {/* YouTube Videos */}
        {sources.youtube_videos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Video className="h-3 w-3" />
              YouTube Videos ({sources.youtube_videos.length})
            </div>
            {sources.youtube_videos.map((video) => (
              <YouTubeVideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* YouTube Timestamps */}
        {sources.youtube_timestamps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" />
              Video Segments ({sources.youtube_timestamps.length})
            </div>
            {sources.youtube_timestamps.map((timestamp) => (
              <YouTubeTimestampCard key={timestamp.id} timestamp={timestamp} />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function InterviewDocumentCard({
  document,
}: {
  document: RAGResponse["sources"]["interview_documents"][0];
}) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{document.title}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              {document.student_name && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{document.student_name}</span>
                </div>
              )}
              {document.company && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>{document.company}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {Math.round(document.similarity * 100)}%
          </Badge>
        </div>

        {document.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {document.excerpt}
          </p>
        )}

        {document.batch && (
          <Badge variant="outline" className="text-xs">
            Batch: {document.batch}
          </Badge>
        )}

        {document.document_url && (
          <Link
            href={document.document_url}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View Document
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function YouTubeVideoCard({
  video,
}: {
  video: RAGResponse["sources"]["youtube_videos"][0];
}) {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-3">
          {video.thumbnail_url && (
            <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
              <Image
                src={video.thumbnail_url}
                alt={video.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm line-clamp-2">
              {video.title}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {video.company && (
                <Badge variant="outline" className="text-xs">
                  {video.company}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {Math.round(video.similarity * 100)}%
              </Badge>
            </div>
          </div>
        </div>

        {video.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {video.excerpt}
          </p>
        )}

        {video.video_url && (
          <Link
            href={video.video_url}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Watch Video
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function YouTubeTimestampCard({
  timestamp,
}: {
  timestamp: RAGResponse["sources"]["youtube_timestamps"][0];
}) {
  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {timestamp.video_title}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>
                {timestamp.start_timestamp} - {timestamp.end_timestamp}
              </span>
              {timestamp.company && (
                <>
                  <span>•</span>
                  <span>{timestamp.company}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {Math.round(timestamp.similarity * 100)}%
          </Badge>
        </div>

        {timestamp.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {timestamp.excerpt}
          </p>
        )}

        {timestamp.timestamp_url && (
          <Link
            href={timestamp.timestamp_url}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <PlayCircle className="h-3 w-3" />
            Watch from {timestamp.start_timestamp}
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
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
  textareaRef: React.RefObject<HTMLTextAreaElement>;
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
