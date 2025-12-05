"use client"

import { InterviewExperienceForm } from "@/components/interview-experience/interview-experience-form"

export default function InterviewExperiencePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Share Your Interview Experience</h1>
          <p className="text-center text-muted-foreground">Help other students by sharing your interview journey</p>
        </div>
        <InterviewExperienceForm />
      </div>
    </div>
  )
}
