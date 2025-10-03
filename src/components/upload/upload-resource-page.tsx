"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { NotesTab } from "./tabs/notes-tab"
import { ImportantTopicsTab } from "./tabs/important-topics-tab"
import { ImportantQuestionsTab } from "./tabs/important-questions-tab"
import type {Exam} from "@/models/exam"
import type {Module} from "@/models/module"
import type {Subject} from "@/models/subject"

type StepOneState = {
  subjectId?: string
  moduleId?: string
  examId?: string
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const subjects: Subject[] = [
  {
    id: "s1",
    subject_code: "DSA-101",
    subject_name: "Data Structures",
    academic_year: 2024,
    engineering_year: 2,
    created_at: "2024-07-01",
  },
  {
    id: "s2",
    subject_code: "OS-201",
    subject_name: "Operating Systems",
    academic_year: 2024,
    engineering_year: 2,
    created_at: "2024-07-01",
  },
]

const modules: Module[] = [
  { id: "m1", subject_id: "s1", module_name: "Arrays & Linked Lists", created_at: "2024-07-01" },
  { id: "m2", subject_id: "s1", module_name: "Trees & Graphs", created_at: "2024-07-01" },
  { id: "m3", subject_id: "s2", module_name: "CPU Scheduling", created_at: "2024-07-01" },
]

const exams: Exam[] = [
  { id: "e1", exam_name: "Midterm", created_at: "2024-07-01" },
  { id: "e2", exam_name: "Endsem", created_at: "2024-07-01" },
]

function UploadResourcePage() {
  const [step1, setStep1] = useState<StepOneState>({})
  const [visibility, setVisibility] = useState<"public" | "private">("public")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("draft_step1")
      if (raw) setStep1(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem("draft_step1", JSON.stringify(step1))
    } catch {}
  }, [step1])

  const filteredModules = useMemo(
    () => modules.filter((m) => !step1.subjectId || m.subject_id === step1.subjectId),
    [step1.subjectId],
  )

  const resourceId = useMemo(() => genId(), [])

  const canProceed = Boolean(step1.subjectId) && Boolean(step1.moduleId) && Boolean(step1.examId)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-balance text-2xl md:text-3xl font-semibold">Upload Resource</h1>
        <p className="text-muted-foreground mt-1">
          Select Subject, Module, and Exam, then add notes, topics, and questions.
        </p>
      </header>

      <section className="space-y-4">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Select Context</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Select
                value={step1.subjectId}
                onValueChange={(v) =>
                  setStep1(({ moduleId: _omit, ...s }) => ({ ...s, subjectId: v, moduleId: undefined }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.subject_code} — {s.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Module</Label>
              <Select
                value={step1.moduleId}
                onValueChange={(v) => setStep1((s) => ({ ...s, moduleId: v }))}
                disabled={!step1.subjectId}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={step1.subjectId ? "Choose module" : "Select subject first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Exam</Label>
              <Select value={step1.examId} onValueChange={(v) => setStep1((s) => ({ ...s, examId: v }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.exam_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 md:mt-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Add Content</CardTitle>
          </CardHeader>
          <CardContent>
            {!canProceed ? (
              <div className="text-sm text-muted-foreground">Select Subject, Module, and Exam to continue.</div>
            ) : (
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes">Notes & Resources</TabsTrigger>
                  <TabsTrigger value="topics">Important Topics</TabsTrigger>
                  <TabsTrigger value="questions">Important Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-4">
                  <NotesTab
                    resourceId={resourceId}
                    createdBy="user_123"
                    visibility={visibility}
                    onVisibilityChange={setVisibility}
                  />
                </TabsContent>
                <TabsContent value="topics" className="mt-4">
                  <ImportantTopicsTab resourceId={resourceId} createdBy="user_123" />
                </TabsContent>
                <TabsContent value="questions" className="mt-4">
                  <ImportantQuestionsTab resourceId={resourceId} createdBy="user_123" />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="flex items-center justify-end gap-3 mt-6">
        <Button variant="secondary">Save Draft</Button>
        <Button disabled={!canProceed}>Submit</Button>
      </footer>
    </div>
  )
}

export default UploadResourcePage
