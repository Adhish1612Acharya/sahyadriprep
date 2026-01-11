"use client";

import { Lightbulb, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Tip {
  tipText: string;
  category: string;
  importance: "critical" | "important" | "moderate";
  timestamp: number;
  context?: string;
}

interface AITipsPanelProps {
  data?: Tip[];
  onJumpTo: (seconds: number) => void;
}

export function AITipsPanel({ data, onJumpTo }: AITipsPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Key tips will appear here</p>
        <p className="text-sm mt-2">Important takeaways and best practices</p>
      </div>
    );
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "destructive";
      case "important":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-3">
      {data.map((tip, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  tip.importance === "critical"
                    ? "text-red-500"
                    : tip.importance === "important"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tip.category}</Badge>
                    <Badge variant={getImportanceColor(tip.importance)}>
                      {tip.importance}
                    </Badge>
                  </div>
                  {tip.timestamp !== null && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onJumpTo(tip.timestamp)}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      {Math.floor(tip.timestamp / 60)}:
                      {(tip.timestamp % 60).toString().padStart(2, "0")}
                    </Button>
                  )}
                </div>
                <p className="font-medium">{tip.tipText}</p>
                {tip.context && (
                  <p className="text-sm text-muted-foreground">{tip.context}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
