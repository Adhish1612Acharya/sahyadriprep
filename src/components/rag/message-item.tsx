"use client";

import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, User, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourcesDisplayComponent } from "./sources-display";
import type { ChatMessage } from "@/types/rag-service.types";
import ReactMarkdown from "react-markdown";
import { Camelize } from "@/types";

interface MessageItemProps {
  message: Camelize<ChatMessage>;
}

export const MessageItem = memo(({ message }: MessageItemProps) => {
  const isUser = message.role === "user";
  const [activeTab, setActiveTab] = useState("message");
  const hasSources =
    !isUser &&
    message.sources &&
    ((message.sources.interviewDocuments?.length ?? 0) > 0 ||
      (message.sources.youtubeVideos?.length ?? 0) > 0 ||
      (message.sources.youtubeTimestamps?.length ?? 0) > 0);

  const totalSources = hasSources
    ? (message.sources?.interviewDocuments?.length ?? 0) +
      (message.sources?.youtubeVideos?.length ?? 0) +
      (message.sources?.youtubeTimestamps?.length ?? 0)
    : 0;

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback className="bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex-1 max-w-[85%]", isUser && "flex justify-end")}>
        {isUser ? (
          // User message - simple card
          <Card className={cn("px-4 py-3 bg-primary text-primary-foreground")}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </Card>
        ) : (
          // Assistant message - with tabs for message and sources
          <Card className="bg-muted/50 overflow-hidden">
            {hasSources ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="message"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Answer
                  </TabsTrigger>
                  <TabsTrigger
                    value="sources"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Sources
                    {totalSources > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary text-primary-foreground">
                        {totalSources}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="message" className="m-0 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 mb-2">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 mb-2">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        code: ({ children }) => (
                          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </TabsContent>

                <TabsContent value="sources" className="m-0 p-4">
                  <SourcesDisplayComponent
                    sources={message.sources!}
                    className="border-0 shadow-none"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              // No sources - just show message
              <div className="px-4 py-3">
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});

MessageItem.displayName = "MessageItem";
