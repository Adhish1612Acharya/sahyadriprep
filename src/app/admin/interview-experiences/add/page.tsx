"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Upload, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useInterviewExperiences } from "@/hooks/useInterviewExperiences.hook";

// Form validation schema
const formSchema = z.object({
  document: z
    // .instanceof(FileList)
    .any()
    .refine((files) => files.length > 0, "PDF document is required")
    .refine(
      (files) => files[0]?.type === "application/pdf",
      "Only PDF files are allowed"
    )
    .refine(
      (files) => files[0]?.size <= 10 * 1024 * 1024,
      "PDF must be less than 10MB"
    ),
  video_preview: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0]?.size <= 100 * 1024 * 1024,
      "Video must be less than 100MB"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ["video/mp4", "video/webm", "video/quicktime"].includes(files[0]?.type),
      "Only MP4, WebM, or MOV videos are allowed"
    ),
  studentName: z
    .string()
    .min(2, "Student name must be at least 2 characters")
    .optional(),
  college_id: z.string().uuid("Please select a college"),
  company_id: z.string().uuid("Please select a company"),
  batch: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Batch must be in format YYYY-YYYY (e.g., 2023-2027)"
    ),
  placedYear: z
    .string()
    .optional()
    .refine(
      (val) => !val || (parseInt(val) >= 2000 && parseInt(val) <= 2100),
      "Year must be between 2000 and 2100"
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadInterviewExperiencePage() {
  const router = useRouter();
  const { createExperience } = useInterviewExperiences();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      college_id: "",
      company_id: "",
      batch: "2023-2027",
      placedYear: new Date().getFullYear().toString(),
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const documentFile = values.document[0];
      const videoFile = values.video_preview?.[0];

      console.log("📤 Uploading interview experience...");

      createExperience.mutate(
        {
          document: documentFile,
          video_preview: videoFile,
          studentName: values.studentName || undefined,
          college_id: values.college_id,
          company_id: values.company_id,
          batch: values.batch,
          placedYear: values.placedYear
            ? parseInt(values.placedYear)
            : undefined,
        },
        {
          onSuccess: (data) => {
            console.log("✅ Upload successful:", data);
            setShowSuccess(true);

            // Reset form
            form.reset();

            // Redirect after 2 seconds
            setTimeout(() => {
              router.push("/admin/interview-experiences");
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error("❌ Upload failed:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Upload Interview Experience
          </CardTitle>
          <CardDescription>
            Upload a PDF document and optional video preview of an interview
            experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success Alert */}
          {showSuccess && (
            <Alert className="mb-6 border-green-500/50 bg-green-500/5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="ml-2">
                <p className="font-medium text-green-700 dark:text-green-400">
                  ✅ Interview experience uploaded successfully!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting to interview experiences list...
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {createExperience.isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Upload Failed</p>
                <p className="text-sm mt-1">
                  {createExperience.error?.message ||
                    "Failed to upload interview experience"}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* PDF Document Upload */}
              <FormField
                control={form.control}
                name="document"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      PDF Document <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          {...fieldProps}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => onChange(e.target.files)}
                          disabled={createExperience.isPending}
                          className="cursor-pointer"
                        />
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload the interview experience PDF (Max: 10MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video Preview Upload (Optional) */}
              <FormField
                control={form.control}
                name="video_preview"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Video Preview{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={(e) => onChange(e.target.files)}
                          disabled={createExperience.isPending}
                          className="cursor-pointer"
                        />
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a video explanation or preview (Max: 100MB,
                      MP4/WebM/MOV)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6" />

              {/* Student Name */}
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., John Doe"
                        {...field}
                        disabled={createExperience.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Name of the student who gave the interview
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* College Selection */}
              <FormField
                control={form.control}
                name="college_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      College <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={createExperience.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="056e8651-01f5-4a08-afdf-6ec9f59563c5">
                          SCEM (Sahyadri College of Engineering)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the college</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Selection */}
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={createExperience.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="36429a2a-eb1b-46ff-bbe5-ac2a99c002b2">
                          Deloitte
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the company</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Batch */}
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Batch <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2023-2027"
                        {...field}
                        disabled={createExperience.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Format: YYYY-YYYY (e.g., 2023-2027)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Placed Year */}
              <FormField
                control={form.control}
                name="placedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placed Year (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2024"
                        {...field}
                        disabled={createExperience.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Year when the student was placed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload Progress */}
              {createExperience.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Uploading and processing...
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createExperience.isPending}
                  className="flex-1"
                >
                  {createExperience.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Interview Experience
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/interview-experiences")}
                  disabled={createExperience.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
