"use client";

import { useEffect, useState } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Bot,
  Sparkles,
} from "lucide-react";
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

const CHATBOT_OPEN_KEY = "rag_chatbot_is_open";

function saveOpenState(isOpen: boolean) {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(CHATBOT_OPEN_KEY, isOpen.toString());
    } catch (error) {
      console.error("Failed to save chatbot open state:", error);
    }
  }
}

function loadOpenState(): boolean {
  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem(CHATBOT_OPEN_KEY);
      return saved === "true";
    } catch (error) {
      console.error("Failed to load chatbot open state:", error);
    }
  }
  return false;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedOpenState = loadOpenState();
    setIsOpen(savedOpenState);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      saveOpenState(isOpen);
    }
  }, [isOpen, isMounted]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (isMinimized) setIsMinimized(false);
  };

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* ✅ Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative p-2">
            <Button
              onClick={handleToggle}
              size="lg"
              className={cn(
                "group relative overflow-hidden",
                "h-16 w-16 rounded-full",
                "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500",
                "hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
                "shadow-2xl hover:shadow-blue-500/50",
                "transition-all duration-300",
                "hover:scale-110 active:scale-95",
                "border-4 border-white dark:border-gray-900",
                "animate-pulse-slow"
              )}
              aria-label="Open AI Interview Assistant"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 animate-ping opacity-75" />
              <div className="relative z-10 flex items-center justify-center">
                <Bot className="h-7 w-7 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300" />
            </Button>

            {/* AI Badge */}
            <div className="absolute top-0 right-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold shadow-lg animate-bounce z-10">
              <Sparkles className="w-2.5 h-2.5" />
              AI
            </div>

            {/* Notification Dot */}
            <div className="absolute top-0 left-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 animate-pulse z-10" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap">
              Chat with AI Assistant
              <div className="absolute top-full right-6 w-3 h-3 bg-gray-900 dark:bg-gray-800 rotate-45 -mt-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Floating Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out animate-chatbot-pop",
            isMinimized
              ? "bottom-4 right-4 w-80 sm:bottom-6 sm:right-6"
              : "inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[500px] sm:h-[700px] sm:max-h-[85vh]"
          )}
        >
          <Card className="h-full flex flex-col shadow-2xl border">
            {/* ✅ Header - Updated to match shadcn black scheme */}
            <CardHeader className="pb-3 border-b flex-shrink-0 bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon with subtle background */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate text-foreground">
                      Sahyadri Coach
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Powered by verified experiences
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {/* Minimize Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hidden sm:flex rounded-md hover:bg-accent"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggle}
                    className="h-8 w-8 p-0 rounded-md hover:bg-destructive/10 hover:text-destructive"
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
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm">
                    Click to expand and continue chatting...
                  </p>
                </div>
              </CardContent>
            )}

            {/* ✅ Footer - Updated to match shadcn scheme */}
            {!isMinimized && (
              <CardFooter className="border-t bg-muted/30 px-3 sm:px-4 py-2 flex-shrink-0">
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground w-full leading-relaxed">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Powered by verified interview experiences
                  </span>
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
