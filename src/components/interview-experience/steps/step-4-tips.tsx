"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export function Step4Tips() {
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
        <CardTitle>Tips for Juniors</CardTitle>
        <CardDescription>Share valuable advice for students preparing for interviews</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="tipsForJuniors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Tips & Advice</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share tips that helped you prepare, mistakes to avoid, resources you used, etc."
                  rows={6}
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
