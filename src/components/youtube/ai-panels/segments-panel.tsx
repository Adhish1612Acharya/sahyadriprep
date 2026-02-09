"use client";

import { ListChecks, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewSessionSegment } from "@/models";
import { Camelize } from "@/types";

interface AISegmentsPanelProps {
  data: Camelize<InterviewSessionSegment>[];
  onJumpTo: (seconds: number) => void;
}

export function AISegmentsPanel({ data, onJumpTo }: AISegmentsPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Video segments will appear here</p>
        <p className="text-sm mt-2">
          AI will divide the video into logical sections
        </p>
      </div>
    );
  }

  // Sort segments by startTime ascending
  const sortedData = [...data].sort((a, b) => a.startTime - b.startTime);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {sortedData.map((segment, index) => (
        <Card key={index} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">
                    Segment {segment.segmentNumber}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(segment.startTime)} -{" "}
                    {formatTime(segment.endTime)}
                  </span>
                </div>
                <h4 className="font-semibold">{segment.title}</h4>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onJumpTo(segment.startTime)}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Jump to
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {segment.description}
            </p>
            {segment.keyConcepts && segment.keyConcepts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {segment.keyConcepts.map((concept, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
