"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export function Step3ProjectDiscussion() {
  const formContext = useFormContext()
  const control = formContext?.control

  if (!control) {
    return (
      <div className="text-destructive p-4 border border-destructive rounded">
        Error: Form context not available. Please refresh the page.
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project & Resume Discussion</CardTitle>
        <CardDescription>Share your project and resume discussion experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="projectDiscussion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Discussion</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project discussion experience, questions asked, tech stack discussed, etc."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="resumeDiscussion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume Discussion</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what was discussed about your resume, experience, skills, etc."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
