"use client";

import { useState } from "react";
import { MessageSquare, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import RagChatbot from "@/components/chatbot/rag-chatbot";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out",
            isMinimized
              ? "bottom-6 right-6 w-80"
              : "bottom-6 right-6 w-[500px] h-[700px] max-h-[85vh]"
          )}
        >
          <Card className="h-full flex flex-col shadow-2xl border-2">
            {/* Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Interview Assistant</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            {!isMinimized && (
              <CardContent className="flex-1 overflow-hidden p-0">
                <RagChatbot />
              </CardContent>
            )}

            {/* Minimized State */}
            {isMinimized && (
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Click to expand and continue chatting...
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
