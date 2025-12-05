"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { demoInterviewExperience } from "@/constants/placeholder.constants"

export function Step1CompanyDetails() {
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
        <CardTitle>Company & Role Details</CardTitle>
        <CardDescription>Tell us about your placement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder={demoInterviewExperience.company} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Offered</FormLabel>
              <FormControl>
                <Input placeholder={demoInterviewExperience.role} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="placementType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placement Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="PPO">PPO (Pre Placement Offer)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="package"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder={demoInterviewExperience.package} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
