"use client";

import { useInterviewYouTubeVideos } from "@/hooks/useYouTubeVideos.hook";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  FileText,
  BookOpen,
  Lightbulb,
  ListChecks,
  AlertCircle,
  CheckCircle,
  PlayCircle,
} from "lucide-react";
import { formatDuration } from "@/helpers/youtube-video.helpers";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ProcessVideoResponse } from "@/types/services/interview-youtube-video.types";
import {
  AIOverviewPanel,
  AISegmentsPanel,
  AIFlashcardsPanel,
  AITipsPanel,
} from "@/components/youtube/ai-panels";
import { useAuth } from "@/contexts/auth-context";

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { isAdmin } = useAuth();

  const { useVideoQuery, deleteVideo, processVideo, useAIContentQuery } =
    useInterviewYouTubeVideos();

  const { data: video, isLoading } = useVideoQuery(videoId);

  const [activeTab, setActiveTab] = useState("overview");
  const [aiData, setAiData] = useState<ProcessVideoResponse | null>(null);
  const [showAIContent, setShowAIContent] = useState(false);
  const [enableAIQuery, setEnableAIQuery] = useState(false); // ✅ NEW: Control query execution

  // ✅ FIX: Pass videoId and enableAIQuery flag
  const {
    data: savedAI,
    isLoading: isAIContentLoading,
    refetch: refetchAI,
  } = useAIContentQuery(videoId, enableAIQuery);

  // ✅ NEW: Ref for the iframe to control playback
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ✅ NEW: Function to jump to timestamp
  const jumpToTimestamp = (seconds: number) => {
    if (iframeRef.current && video) {
      const newSrc = `https://www.youtube.com/embed/${
        video.video_id
      }?start=${Math.floor(seconds)}&autoplay=1`;
      iframeRef.current.src = newSrc;
      iframeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ✅ UPDATED: Handle "Get AI Insights" button click
  const handleGetAIInsights = async () => {
    if (!video) return;

    setShowAIContent(true);

    // If video is already processed, fetch from DB
    if (video.ai_process_done) {
      try {
        setEnableAIQuery(true); // ✅ Enable the query
        const result = await refetchAI();

        console.log("Fetched AI content from DB:", result);
        if (result.data) {
          const hydrated = {
            overview: result.data.overview?.data ?? null,
            segments: result.data.segments?.data ?? [],
            flashcards: result.data.flashcards?.data ?? [],
            tips: result.data.tips?.data ?? [],
          } as unknown as ProcessVideoResponse;
          setAiData(hydrated);
        }
      } catch (e) {
        console.error("Failed to fetch AI content:", e);
      }
    } else {
      // If not processed, trigger AI processing
      processVideo.mutate(
        {
          id: video.id,
          video_id: video.video_id,
          title: video.title,
          description: video.description || undefined,
        },
        {
          onSuccess: (data) => {
            console.log("Raw process response:", data);

            // ✅ FIX: The response from processVideo already returns the correct structure
            // data = { overview: {...}, segments: [...], flashcards: [...], tips: [...] }
            setAiData(data);
            setShowAIContent(true);
          },
        }
      );
    }
  };

  // ✅ UPDATED: Handle "Regenerate" button click (always calls processVideo)
  const handleRegenerate = () => {
    if (!video) return;

    processVideo.mutate(
      {
        id: video.id,
        video_id: video.video_id,
        title: video.title,
        description: video.description || undefined,
      },
      {
        onSuccess: (data) => {
          console.log("Regenerate response:", data);

          // ✅ FIX: The response from processVideo already returns the correct structure
          setAiData(data);
          setShowAIContent(true);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteVideo.mutate(videoId, {
      onSuccess: () => {
        router.push("/interview-experiences/youtube");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-12 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Video not found</h2>
        <p className="text-muted-foreground mb-4">
          The video youre looking for doesnt exist or has been removed.
        </p>
        <Button onClick={() => router.push("/interview-experiences/youtube")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Videos
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/interview-experiences/youtube")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Videos
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{video.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {video.companies && (
                <Badge variant="secondary" className="text-sm">
                  <Building2 className="h-3 w-3 mr-1" />
                  {video.companies.name}
                </Badge>
              )}

              {video.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(video.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this video. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteVideo.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteVideo.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Processing Status Alerts */}
      {processVideo.isPending && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-medium">Processing video with AI...</p>
              <p className="text-sm text-muted-foreground">
                This may take 30-60 seconds. Generating overview, segments,
                flashcards, and tips.
              </p>
              <Progress value={33} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {processVideo.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <p className="font-medium">Failed to process video</p>
            <p className="text-sm mt-1">
              {processVideo.error?.message ||
                "An error occurred while processing the video. Please try again."}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {aiData && !processVideo.isPending && (
        <Alert className="mb-6 border-green-500/50 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="ml-2">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✨ AI processing completed successfully!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Generated {aiData.segments.length} segments,{" "}
              {aiData.flashcards.length} flashcards, and {aiData.tips.length}{" "}
              tips.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Video Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* YouTube Player */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                {videoId ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.video_id}?rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <p>Invalid YouTube URL</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {video.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Features Tabs */}
          {showAIContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">
                      <FileText className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="segments">
                      <ListChecks className="h-4 w-4 mr-2" />
                      Segments
                    </TabsTrigger>
                    <TabsTrigger value="flashcards">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Flashcards
                    </TabsTrigger>
                    <TabsTrigger value="tips">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Key Tips
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <AIOverviewPanel data={aiData?.overview} />
                  </TabsContent>

                  <TabsContent value="segments" className="mt-4">
                    <AISegmentsPanel
                      data={aiData?.segments}
                      onJumpTo={jumpToTimestamp}
                    />
                  </TabsContent>

                  <TabsContent value="flashcards" className="mt-4">
                    <AIFlashcardsPanel
                      data={
                        aiData?.flashcards
                          ? aiData.flashcards.map((f) => ({
                              ...f,
                              timestamp: f.timestamp ?? 0,
                            }))
                          : undefined
                      }
                      onJumpTo={jumpToTimestamp}
                    />
                  </TabsContent>

                  <TabsContent value="tips" className="mt-4">
                    <AITipsPanel
                      data={
                        aiData?.tips
                          ? (aiData.tips.map((t) => ({
                              ...t,
                              importance:
                                t.importance === "helpful"
                                  ? "moderate"
                                  : t.importance,
                            })) as any)
                          : undefined
                      }
                      onJumpTo={jumpToTimestamp}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {video.colleges && (
                <div>
                  <p className="text-sm font-medium mb-1">College</p>
                  <p className="text-sm text-muted-foreground">
                    {video.colleges.name}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium mb-1">Video ID</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {video.video_id}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-1">Added</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(video.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <Separator />

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(video.video_url, "_blank")}
              >
                Watch on YouTube
              </Button>
            </CardContent>
          </Card>

          {/* Process Video Card */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Extract insights, create flashcards, and get AI-powered
                summaries from this interview video.
              </p>

              {showAIContent && aiData ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                    <p className="font-medium text-foreground mb-2">
                      ✅ Already Processed
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• {aiData.segments.length} segments</li>
                      <li>• {aiData.flashcards.length} flashcards</li>
                      <li>• {aiData.tips.length} tips</li>
                    </ul>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={processVideo.isPending}
                  >
                    {processVideo.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleGetAIInsights}
                  disabled={processVideo.isPending || isAIContentLoading}
                >
                  {processVideo.isPending || isAIContentLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {video.ai_process_done ? "Loading..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Insights
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
