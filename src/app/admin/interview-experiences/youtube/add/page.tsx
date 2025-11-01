"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  Youtube,
  CheckCircle,
  Info,
  Building2,
} from "lucide-react";
import { useInterviewYouTubeVideos } from "@/hooks/useYouTubeVideos.hook";
import { useCompanies } from "@/hooks/useCompanies.hook";
// import { useToast } from "@/hooks/use-toast";

// ============================================
// ZOD SCHEMA
// ============================================

const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&.*)?$/;

const uploadYouTubeVideoSchema = z.object({
  video_url: z
    .string()
    .min(1, "YouTube URL is required")
    .regex(youtubeUrlRegex, "Please enter a valid YouTube URL"),
  company_id: z.string().min(1, "Please select a company"),
  college_id: z.string().min(1, "Please select a college"),
});

type UploadYouTubeVideoFormData = z.infer<typeof uploadYouTubeVideoSchema>;

// ============================================
// COMPONENT
// ============================================

export default function UploadYouTubeVideoPage() {
  const router = useRouter();
  //   const { toast } = useToast();
  const { createVideo } = useInterviewYouTubeVideos();

  // Fetch companies using the custom hook
  const { useCompaniesQuery } = useCompanies();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompaniesQuery();

  // ============================================
  // FORM SETUP
  // ============================================

  const form = useForm<UploadYouTubeVideoFormData>({
    resolver: zodResolver(uploadYouTubeVideoSchema),
    defaultValues: {
      video_url: "",
      company_id: "",
      college_id: "",
    },
  });

  // ============================================
  // FORM SUBMIT HANDLER
  // ============================================

  const onSubmit = (data: UploadYouTubeVideoFormData) => {
    createVideo.mutate(data, {
      onSuccess: (videoData) => {
        // toast({
        //   title: "✅ Success",
        //   description: `Video "${videoData.title}" uploaded successfully! Processing transcript...`,
        // });

        // Reset form
        form.reset();

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/interview-experiences/youtube/${videoData.id}`);
        }, 2000);
      },
      onError: (error: Error) => {
        // toast({
        //   title: "❌ Error",
        //   description: error.message || "Failed to upload video",
        //   variant: "destructive",
        // });
      },
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Youtube className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Upload YouTube Interview Experience
              </CardTitle>
              <CardDescription className="mt-1">
                Add a YouTube video with interview experience content
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Success Alert */}
          {createVideo.isSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Video uploaded successfully! Processing transcript and
                embeddings... Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* YouTube URL Field */}
              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      YouTube Video URL <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                        disabled={createVideo.isPending}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the full YouTube video URL (e.g.,
                      https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Select Field - Dynamic */}
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
                      disabled={createVideo.isPending || isLoadingCompanies}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingCompanies
                                ? "Loading companies..."
                                : "Select a company"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCompanies ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">
                              Loading companies...
                            </span>
                          </div>
                        ) : companies.length === 0 ? (
                          <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                            No companies found. Please add companies first.
                          </div>
                        ) : (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              <div className="flex items-center gap-2">
                                {company.logo_url ? (
                                  <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="h-5 w-5 rounded object-contain"
                                  />
                                ) : (
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>{company.name}</span>
                                {company.industry && (
                                  <span className="text-xs text-muted-foreground">
                                    ({company.industry})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the company related to this interview
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* College Select Field */}
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
                      disabled={createVideo.isPending}
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
                    <FormDescription>
                      Select the college of the interviewer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Info Box */}
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    What happens after upload?
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1.5 ml-6 list-disc">
                    <li>Video metadata will be fetched from YouTube</li>
                    <li>Transcript will be extracted automatically</li>
                    <li>Content will be chunked into 5-minute segments</li>
                    <li>AI summaries will be generated for each chunk</li>
                    <li>
                      Vector embeddings will be created for semantic search
                    </li>
                    <li>Processing may take 30-60 seconds</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  createVideo.isPending ||
                  createVideo.isSuccess ||
                  isLoadingCompanies
                }
              >
                {createVideo.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading & Processing...
                  </>
                ) : createVideo.isSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Success! Redirecting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Supported URLs:</strong> youtube.com/watch?v=... or
            youtu.be/...
          </p>
          <p>
            <strong>Requirements:</strong> Video must have captions/subtitles
            enabled for transcript extraction
          </p>
          <p>
            <strong>Processing Time:</strong> Typically 30-60 seconds depending
            on video length
          </p>
          <p>
            <strong>Company Selection:</strong> Only companies from your college
            are shown
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
