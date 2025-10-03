"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CardItem } from "../card-item"
import { MediaUploader } from "../media-uploader"
import type { Media} from "@/models/media"
import type { ImportantQuestionTextAnswer } from "@/models/important-question-text-answer"


function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

type QuestionDraft = {
  id: string
  question: string
  visibility: "public" | "private"
  textAnswers: Array<Pick<ImportantQuestionTextAnswer, "id" | "title" | "description" | "answer" | "created_by">>
  videoAnswers: Array<{
    id: string
    title: string
    description?: string
    is_ai_generated: boolean
    created_by: string
    media: Media[]
  }>
}

type ImportantQuestionsTabProps = {
  resourceId: string
  createdBy: string
}

export function ImportantQuestionsTab({ resourceId, createdBy }: ImportantQuestionsTabProps) {
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { id: genId(), question: "", visibility: "public", textAnswers: [], videoAnswers: [] },
  ])

  useEffect(() => {
    try {
      localStorage.setItem("draft_questions", JSON.stringify(questions))
    } catch {}
  }, [questions])

  function addQuestion() {
    setQuestions((q) => [...q, { id: genId(), question: "", visibility: "public", textAnswers: [], videoAnswers: [] }])
  }
  function removeQuestion(idx: number) {
    setQuestions((q) => q.filter((_, i) => i !== idx))
  }
  function updateQuestion<K extends keyof QuestionDraft>(idx: number, key: K, value: QuestionDraft[K]) {
    setQuestions((q) => {
      const copy = q.slice()
      copy[idx] = { ...copy[idx], [key]: value }
      return copy
    })
  }

  function addTextAnswer(idx: number) {
    setQuestions((q) => {
      const copy = q.slice()
      copy[idx].textAnswers.push({
        id: genId(),
        title: "",
        description: "",
        answer: "",
        created_by: createdBy,
      })
      return copy
    })
  }
  function updateTextAnswer(idx: number, aIdx: number, partial: Partial<QuestionDraft["textAnswers"][number]>) {
    setQuestions((q) => {
      const copy = q.slice()
      copy[idx].textAnswers[aIdx] = { ...copy[idx].textAnswers[aIdx], ...partial }
      return copy
    })
  }
  function removeTextAnswer(idx: number, aIdx: number) {
    setQuestions((q) => {
      const copy = q.slice()
      copy[idx].textAnswers.splice(aIdx, 1)
      return copy
    })
  }

  function addVideoAnswer(idx: number) {
    setQuestions((q) => {
      const copy = q.slice()
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
  function updateVideoAnswer(idx: number, aIdx: number, partial: Partial<QuestionDraft["videoAnswers"][number]>) {
    setQuestions((q) => {
      const copy = q.slice()
      copy[idx].videoAnswers[aIdx] = { ...copy[idx].videoAnswers[aIdx], ...partial }
      return copy
    })
  }
  function removeVideoAnswer(idx: number, aIdx: number) {
    setQuestions((q) => {
      const copy = q.slice()
      copy[idx].videoAnswers.splice(aIdx, 1)
      return copy
    })
  }

  const payload = useMemo(() => questions.map<QuestionDraft>((q) => q), [questions])

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <CardItem
          key={q.id}
          title={`Question ${idx + 1}`}
          description="Add your question and optional text/video answers."
          onRemove={questions.length > 1 ? () => removeQuestion(idx) : undefined}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`q-text-${idx}`}>Question</Label>
              <Textarea
                id={`q-text-${idx}`}
                value={q.question}
                onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                placeholder="e.g., Explain the process scheduling algorithms..."
                className="min-h-24"
                aria-invalid={q.question.trim().length === 0}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Visibility</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Private</span>
                <Switch
                  checked={q.visibility === "public"}
                  onCheckedChange={(v) => updateQuestion(idx, "visibility", v ? "public" : "private")}
                  aria-label="Toggle question public visibility"
                />
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Text Answers</Label>
                <Button variant="secondary" size="sm" onClick={() => addTextAnswer(idx)}>
                  Add text answer
                </Button>
              </div>
              {q.textAnswers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No text answers yet.</p>
              ) : null}
              {q.textAnswers.map((ans, aIdx) => (
                <div key={ans.id} className="grid gap-3 border border-border rounded-md p-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`qa-title-${idx}-${aIdx}`}>Title</Label>
                    <Input
                      id={`qa-title-${idx}-${aIdx}`}
                      value={ans.title}
                      onChange={(e) => updateTextAnswer(idx, aIdx, { title: e.target.value })}
                      placeholder="e.g., Round Robin Explanation"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`qa-desc-${idx}-${aIdx}`}>Description (optional)</Label>
                    <Textarea
                      id={`qa-desc-${idx}-${aIdx}`}
                      value={ans.description ?? ""}
                      onChange={(e) => updateTextAnswer(idx, aIdx, { description: e.target.value })}
                      placeholder="Short context…"
                      className="min-h-20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`qa-answer-${idx}-${aIdx}`}>Answer</Label>
                    <Textarea
                      id={`qa-answer-${idx}-${aIdx}`}
                      value={ans.answer}
                      onChange={(e) => updateTextAnswer(idx, aIdx, { answer: e.target.value })}
                      placeholder="Detailed answer…"
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
              {q.videoAnswers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No video answers yet.</p>
              ) : null}
              {q.videoAnswers.map((ans, aIdx) => (
                <div key={ans.id} className="grid gap-3 border border-border rounded-md p-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`qva-title-${idx}-${aIdx}`}>Title</Label>
                    <Input
                      id={`qva-title-${idx}-${aIdx}`}
                      value={ans.title}
                      onChange={(e) => updateVideoAnswer(idx, aIdx, { title: e.target.value })}
                      placeholder="e.g., Preemptive vs Non-preemptive"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`qva-desc-${idx}-${aIdx}`}>Description (optional)</Label>
                    <Textarea
                      id={`qva-desc-${idx}-${aIdx}`}
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
                      <Label htmlFor={`qva-ai-${idx}-${aIdx}`}>AI generated?</Label>
                      <Switch
                        id={`qva-ai-${idx}-${aIdx}`}
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
        <Button variant="secondary" onClick={addQuestion}>
          Add another question
        </Button>
        <Button>Save Questions</Button>
      </div>

      <CardItem title="Preview Payload">
        <pre className="text-xs md:text-sm overflow-auto rounded-md border border-border p-3 bg-muted/50">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </CardItem>
    </div>
  )
}
