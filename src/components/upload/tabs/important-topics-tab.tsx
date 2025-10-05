"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2 } from "lucide-react";
import { MediaUploader } from "../media-uploader";
import { CardItem } from "../card-item";
import type { Media } from "@/models/media";

type ImportantTopicData = {
  title: string;
  text_answer?: string;
  video_file?: File;
  is_public: boolean;
};

type TopicItem = {
  id: string;
  title: string;
  text_answer: string;
  video_files: Media[];
  is_public: boolean;
};

type ImportantTopicsTabProps = {
  resource_id: string;
  created_by: string;
  on_topics_change?: (topics: ImportantTopicData[]) => void;
};

export function ImportantTopicsTab({
  resource_id,
  created_by,
  on_topics_change,
}: ImportantTopicsTabProps) {
  const [topics, set_topics] = useState<TopicItem[]>([
    {
      id: `topic-${Date.now()}`,
      title: "",
      text_answer: "",
      video_files: [],
      is_public: true,
    },
  ]);

  // Convert to ImportantTopicData format for parent component
  const topics_data: ImportantTopicData[] = useMemo(() => {
    return topics
      .filter((topic) => topic.title.trim()) // Only include topics with titles
      .map((topic) => ({
        title: topic.title.trim(),
        text_answer: topic.text_answer.trim() || undefined,
        video_file: topic.video_files[0]?.file || undefined,
        is_public: topic.is_public,
      }));
  }, [topics]);

  // Notify parent component when topics data changes
  useEffect(() => {
    if (on_topics_change) {
      on_topics_change(topics_data);
    }
  }, [topics_data, on_topics_change]);

  useEffect(() => {
    try {
      localStorage.setItem("draft_important_topics", JSON.stringify(topics));
    } catch {}
  }, [topics]);

  const add_topic = () => {
    const new_topic: TopicItem = {
      id: `topic-${Date.now()}`,
      title: "",
      text_answer: "",
      video_files: [],
      is_public: true,
    };
    set_topics((prev) => [...prev, new_topic]);
  };

  const remove_topic = (topic_id: string) => {
    set_topics((prev) => prev.filter((topic) => topic.id !== topic_id));
  };

  const update_topic = (topic_id: string, updates: Partial<TopicItem>) => {
    set_topics((prev) =>
      prev.map((topic) =>
        topic.id === topic_id ? { ...topic, ...updates } : topic
      )
    );
  };

  const validate_topic = (topic: TopicItem): string[] => {
    const errors: string[] = [];

    if (!topic.title.trim()) {
      errors.push("Title is required");
    }

    if (!topic.is_public) {
      if (!topic.text_answer.trim() && topic.video_files.length === 0) {
        errors.push("Private topics must have either text or video answer");
      }
    }

    return errors;
  };

  return (
    <div className="space-y-4">
      <CardItem
        title="Important Topics"
        description="Add topics that are crucial for exam preparation. Private topics require answers."
      >
        <div className="space-y-6">
          {topics.map((topic, index) => {
            const topic_errors = validate_topic(topic);
            const has_errors = topic_errors.length > 0;

            return (
              <div
                key={topic.id}
                className="border border-border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Topic {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    {topics.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove_topic(topic.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`topic-title-${topic.id}`}>Title</Label>
                    <Input
                      id={`topic-title-${topic.id}`}
                      value={topic.title}
                      onChange={(e) =>
                        update_topic(topic.id, { title: e.target.value })
                      }
                      placeholder="e.g., Data Structures Overview"
                      className={
                        has_errors && !topic.title.trim()
                          ? "border-red-300"
                          : ""
                      }
                    />
                    {!topic.title.trim() && (
                      <span className="text-xs text-red-500">
                        Title is required
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Visibility</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Private
                        </span>
                        <Switch
                          checked={topic.is_public}
                          onCheckedChange={(checked) =>
                            update_topic(topic.id, { is_public: checked })
                          }
                          aria-label="Toggle topic visibility"
                        />
                        <span className="text-xs text-muted-foreground">
                          Public
                        </span>
                      </div>
                    </div>
                    {!topic.is_public && (
                      <p className="text-xs text-orange-600">
                        Private topics must have either text or video answer
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`topic-answer-${topic.id}`}>
                        Text Answer
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                              {topic.is_public
                                ? "optional"
                                : "required if no video"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border-border">
                            {topic.is_public
                              ? "Public topics can be answer-optional"
                              : "Private topics need either text or video answer"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id={`topic-answer-${topic.id}`}
                      value={topic.text_answer}
                      onChange={(e) =>
                        update_topic(topic.id, { text_answer: e.target.value })
                      }
                      placeholder="Explain this topic in detail..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Video Answer</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                              {topic.is_public
                                ? "optional"
                                : "required if no text"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border-border">
                            Upload a video explanation for this topic
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <MediaUploader
                      value={topic.video_files}
                      onChange={(files) =>
                        update_topic(topic.id, { video_files: files })
                      }
                      max_files={1}
                      accept="video/*"
                      file_type="video"
                    />
                  </div>

                  {has_errors && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-700 font-medium">
                        Issues with this topic:
                      </p>
                      <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                        {topic_errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Button variant="outline" onClick={add_topic} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Topic
          </Button>
        </div>
      </CardItem>

      <CardItem
        title="Preview"
        description="This shows how your topics would be stored."
      >
        <pre className="text-xs md:text-sm overflow-auto rounded-md border border-border p-3 bg-muted/50">
          {JSON.stringify(topics_data, null, 2)}
        </pre>
      </CardItem>

      <div className="flex justify-end">
        <div className="text-xs text-muted-foreground mb-2">
          {topics_data.length > 0
            ? `✓ ${topics_data.length} topic(s) ready`
            : "Add at least one topic"}
        </div>
      </div>
    </div>
  );
}
