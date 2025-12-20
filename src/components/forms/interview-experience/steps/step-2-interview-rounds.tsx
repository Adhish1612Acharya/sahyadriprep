"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { demoInterviewExperience } from "@/constants/placeholder.constants"

export function Step2InterviewRounds() {
  const formContext = useFormContext()
  const control = formContext?.control

  // Moved useFieldArray hook to the top level
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rounds",
  })

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
        <CardTitle>Interview Rounds</CardTitle>
        <CardDescription>Describe each round you went through</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Round {index + 1}</h4>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <FormField
              control={control}
              name={`rounds.${index}.roundTitle`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Round Title</FormLabel>
                  <FormControl>
                    <Input placeholder={demoInterviewExperience.rounds[0].roundTitle} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`rounds.${index}.difficulty`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`rounds.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics Asked & Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder={demoInterviewExperience.rounds[0].description} rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ roundTitle: "", difficulty: "Medium", description: "" })}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Round
        </Button>
      </CardContent>
    </Card>
  )
}
