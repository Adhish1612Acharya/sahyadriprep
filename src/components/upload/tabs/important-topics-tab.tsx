"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CardItem } from "../card-item"
import { MediaUploader } from "../media-uploader"
import type { ImportantTopicTextAnswer } from "@/models/important-topic-text-answer"

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

type TopicDraft = {
  id: string
  title: string
  visibility: "public" | "private"
  textAnswers: Array<Pick<ImportantTopicTextAnswer, "id" | "title" | "description" | "answer" | "created_by">>
  videoAnswers: Array<{
    id: string
    title: string
    description?: string
    is_ai_generated: boolean
    created_by: string
    media: Media[]
  }>
}

type ImportantTopicsTabProps = {
  resourceId: string
  createdBy: string
}

export function ImportantTopicsTab({ resourceId, createdBy }: ImportantTopicsTabProps) {
  const [topics, setTopics] = useState<TopicDraft[]>([
    {
      id: genId(),
      title: "",
      visibility: "public",
      textAnswers: [],
      videoAnswers: [],
    },
  ])

  useEffect(() => {
    try {
      localStorage.setItem("draft_topics", JSON.stringify(topics))
    } catch {}
  }, [topics])

  function addTopic() {
    setTopics((t) => [...t, { id: genId(), title: "", visibility: "public", textAnswers: [], videoAnswers: [] }])
  }

  function removeTopic(idx: number) {
    setTopics((t) => t.filter((_, i) => i !== idx))
  }

  function updateTopic<K extends keyof TopicDraft>(idx: number, key: K, value: TopicDraft[K]) {
    setTopics((t) => {
      const copy = t.slice()
      copy[idx] = { ...copy[idx], [key]: value }
      return copy
    })
  }

  function addTextAnswer(idx: number) {
    setTopics((t) => {
      const copy = t.slice()
      const topic = copy[idx]
      topic.textAnswers.push({
        id: genId(),
        title: "",
        description: "",
        answer: "",
        created_by: createdBy,
      })
      return copy
    })
  }

  function updateTextAnswer(idx: number, aIdx: number, partial: Partial<TopicDraft["textAnswers"][number]>) {
    setTopics((t) => {
      const copy = t.slice()
      const item = { ...copy[idx].textAnswers[aIdx], ...partial }
      copy[idx].textAnswers[aIdx] = item
      return copy
    })
  }

  function removeTextAnswer(idx: number, aIdx: number) {
    setTopics((t) => {
      const copy = t.slice()
      copy[idx].textAnswers.splice(aIdx, 1)
      return copy
    })
  }

  function addVideoAnswer(idx: number) {
    setTopics((t) => {
      const copy = t.slice()
      copy[idx].videoAnswers.push({
        id: genId(),
        title: "",
        description: "",
        is_ai_generated: false,
        created_by: createdBy,
        media: [],
      })
      return copy
    })
  }

  function updateVideoAnswer(idx: number, aIdx: number, partial: Partial<TopicDraft["videoAnswers"][number]>) {
    setTopics((t) => {
      const copy = t.slice()
      const item = { ...copy[idx].videoAnswers[aIdx], ...partial }
      copy[idx].videoAnswers[aIdx] = item
      return copy
    })
  }

  function removeVideoAnswer(idx: number, aIdx: number) {
    setTopics((t) => {
      const copy = t.slice()
      copy[idx].videoAnswers.splice(aIdx, 1)
      return copy
    })
  }

  const payload = useMemo(() => {
    return topics.map<TopicDraft>((t) => t)
  }, [topics])

  return (
    <div className="space-y-4">
      {topics.map((topic, idx) => (
        <CardItem
          key={topic.id}
          title={`Topic ${idx + 1}`}
          description="Add topic title, and optional text/video answers."
          onRemove={topics.length > 1 ? () => removeTopic(idx) : undefined}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`topic-title-${idx}`}>Title</Label>
              <Input
                id={`topic-title-${idx}`}
                value={topic.title}
                onChange={(e) => updateTopic(idx, "title", e.target.value)}
                placeholder="e.g., AVL Trees Rotations"
                aria-invalid={topic.title.trim().length === 0}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Visibility</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Private</span>
                <Switch
                  checked={topic.visibility === "public"}
                  onCheckedChange={(v) => updateTopic(idx, "visibility", v ? "public" : "private")}
                  aria-label="Toggle topic public visibility"
                />
                <span className="text-xs text-muted-foreground">Public</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                        What’s public?
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground border-border">
                      Public allows multiple contributors to add answers.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Text Answers</Label>
                <Button variant="secondary" size="sm" onClick={() => addTextAnswer(idx)}>
                  Add text answer
                </Button>
              </div>
              {topic.textAnswers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No text answers yet.</p>
              ) : null}
              {topic.textAnswers.map((ans, aIdx) => (
                <div key={ans.id} className="grid gap-3 border border-border rounded-md p-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`ta-title-${idx}-${aIdx}`}>Title</Label>
                    <Input
                      id={`ta-title-${idx}-${aIdx}`}
                      value={ans.title}
                      onChange={(e) => updateTextAnswer(idx, aIdx, { title: e.target.value })}
                      placeholder="e.g., LL vs RR Rotation"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`ta-desc-${idx}-${aIdx}`}>Description (optional)</Label>
                    <Textarea
                      id={`ta-desc-${idx}-${aIdx}`}
                      value={ans.description ?? ""}
                      onChange={(e) => updateTextAnswer(idx, aIdx, { description: e.target.value })}
                      placeholder="Short context…"
                      className="min-h-20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`ta-answer-${idx}-${aIdx}`}>Answer</Label>
                    <Textarea
                      id={`ta-answer-${idx}-${aIdx}`}
                      value={ans.answer}
                      onChange={(e) => updateTextAnswer(idx, aIdx, { answer: e.target.value })}
                      placeholder="Detailed explanation…"
                      className="min-h-28"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeTextAnswer(idx, aIdx)}>
                      Remove answer
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Video Answers</Label>
                <Button variant="secondary" size="sm" onClick={() => addVideoAnswer(idx)}>
                  Add video answer
                </Button>
              </div>
              {topic.videoAnswers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No video answers yet.</p>
              ) : null}
              {topic.videoAnswers.map((ans, aIdx) => (
                <div key={ans.id} className="grid gap-3 border border-border rounded-md p-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`va-title-${idx}-${aIdx}`}>Title</Label>
                    <Input
                      id={`va-title-${idx}-${aIdx}`}
                      value={ans.title}
                      onChange={(e) => updateVideoAnswer(idx, aIdx, { title: e.target.value })}
                      placeholder="e.g., Rotation Walkthrough"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`va-desc-${idx}-${aIdx}`}>Description (optional)</Label>
                    <Textarea
                      id={`va-desc-${idx}-${aIdx}`}
                      value={ans.description ?? ""}
                      onChange={(e) => updateVideoAnswer(idx, aIdx, { description: e.target.value })}
                      placeholder="Short context…"
                      className="min-h-20"
                    />
                  </div>
                  <MediaUploader
                    value={ans.media}
                    onChange={(media) => updateVideoAnswer(idx, aIdx, { media })}
                    maxFiles={1}
                    accept="video/*"
                    helper="Attach a single video per answer."
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`va-ai-${idx}-${aIdx}`}>AI generated?</Label>
                      <Switch
                        id={`va-ai-${idx}-${aIdx}`}
                        checked={ans.is_ai_generated}
                        onCheckedChange={(v) => updateVideoAnswer(idx, aIdx, { is_ai_generated: v })}
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeVideoAnswer(idx, aIdx)}>
                      Remove answer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardItem>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={addTopic}>
          Add another topic
        </Button>
        <Button>Save Topics</Button>
      </div>

      <CardItem title="Preview Payload">
        <pre className="text-xs md:text-sm overflow-auto rounded-md border border-border p-3 bg-muted/50">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </CardItem>
    </div>
  )
}
