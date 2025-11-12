"use client";

import { useState } from "react";
import { MessageSquare, X, Minimize2, Maximize2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
            // ✅ Mobile: Full screen with safe margins
            // ✅ Desktop: Fixed size bottom-right
            isMinimized
              ? "bottom-4 right-4 w-80 sm:bottom-6 sm:right-6"
              : "inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[500px] sm:h-[700px] sm:max-h-[85vh]"
          )}
        >
          <Card className="h-full flex flex-col shadow-2xl border-2">
            {/* Header */}
            <CardHeader className="pb-3 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-base sm:text-lg truncate">
                    Interview Assistant
                  </CardTitle>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {/* ✅ Hide minimize on mobile, show on desktop */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hidden sm:flex"
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
              <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
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

            {/* ✅ Trust-Building Footer (Always Visible) */}
            {!isMinimized && (
              <CardFooter className="border-t bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 px-3 sm:px-4 py-2 flex-shrink-0">
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground w-full leading-relaxed">
                  Powered by verified interview experiences.{" "}
                  <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Check sources
                  </button>{" "}
                  for complete details.
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
