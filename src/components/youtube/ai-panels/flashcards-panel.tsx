"use client";

import { useState } from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Flashcard {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  timestamp: number ;
}

interface AIFlashcardsPanelProps {
  data?: Flashcard[];
  onJumpTo: (seconds: number) => void;
}

export function AIFlashcardsPanel({ data, onJumpTo }: AIFlashcardsPanelProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Flashcards will appear here</p>
        <p className="text-sm mt-2">AI-generated Q&A for quick revision</p>
      </div>
    );
  }

  const toggleFlip = (index: number) => {
    setFlipped((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {data.map((flashcard, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleFlip(index)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Category & Difficulty */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{flashcard.category}</Badge>
                  <Badge
                    variant={
                      flashcard.difficulty === "hard"
                        ? "destructive"
                        : flashcard.difficulty === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {flashcard.difficulty}
                  </Badge>
                </div>
                {flashcard.timestamp !== null && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpTo(flashcard.timestamp);
                    }}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    {Math.floor(flashcard.timestamp / 60)}:
                    {(flashcard.timestamp % 60).toString().padStart(2, "0")}
                  </Button>
                )}
              </div>

              {/* Question */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Question:</p>
                <p className="font-medium">{flashcard.question}</p>
              </div>

              {/* Answer (revealed on flip) */}
              {flipped.has(index) && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Answer:</p>
                  <p className="text-muted-foreground">{flashcard.answer}</p>
                </div>
              )}

              {/* Flip indicator */}
              <div className="text-center text-sm text-muted-foreground">
                {flipped.has(index)
                  ? "Click to hide answer"
                  : "Click to reveal answer"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
