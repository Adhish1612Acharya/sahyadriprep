"use client";

import { Sparkles, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AIOverviewPanelProps {
  data?: {
    summary: string;
    key_points?: string[];
    topics?: string[];
    difficulty_level?: string;
    recommended_for?: string[];
  };
}

export function AIOverviewPanel({ data }: AIOverviewPanelProps) {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>AI-generated overview will appear here</p>
        <p className="text-sm mt-2">
          Click Get AI Insights to generate content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="font-semibold mb-2">Summary</h3>
        <p className="text-muted-foreground">{data.summary}</p>
      </div>

      <Separator />

      {/* Key Points */}
      <div>
        <h3 className="font-semibold mb-3">Key Points</h3>
        <ul className="space-y-2">
          {data.key_points?.map((point: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Topics */}
      <div>
        <h3 className="font-semibold mb-3">Topics Covered</h3>
        <div className="flex flex-wrap gap-2">
          {data.topics?.map((topic: string, index: number) => (
            <Badge key={index} variant="secondary">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Meta */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Difficulty: </span>
          <Badge variant="outline">{data.difficulty_level}</Badge>
        </div>
      </div>

      {data.recommended_for && data.recommended_for.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Recommended For</h3>
            <div className="flex flex-wrap gap-2">
              {data.recommended_for.map((audience: string, index: number) => (
                <Badge key={index} variant="outline">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
