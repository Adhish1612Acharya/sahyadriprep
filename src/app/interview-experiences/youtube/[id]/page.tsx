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
import type { ProcessVideoResponse } from "@/services/interview-youtube-video.service";

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { useVideoQuery, deleteVideo, processVideo } =
    useInterviewYouTubeVideos();
  const { data: video, isLoading } = useVideoQuery(videoId);

  const [activeTab, setActiveTab] = useState("overview");
  const [aiData, setAiData] = useState<ProcessVideoResponse | null>(null);

  // ✅ NEW: Ref for the iframe to control playback
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ✅ NEW: Function to jump to timestamp
  const jumpToTimestamp = (seconds: number) => {
    if (iframeRef.current && video) {
      // Method 1: Update iframe src with timestamp
      const newSrc = `https://www.youtube.com/embed/${
        video.video_id
      }?start=${Math.floor(seconds)}&autoplay=1`;
      iframeRef.current.src = newSrc;

      // Scroll to video player
      iframeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleProcess = () => {
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
          setAiData(data);
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
          The video you're looking for doesn't exist or has been removed.
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

          {/* Delete Button */}
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
                  This will permanently delete this video. This action cannot be
                  undone.
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
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${video.video_id}?enablejsapi=1`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
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
                    data={aiData?.flashcards}
                    onJumpTo={jumpToTimestamp}
                  />
                </TabsContent>

                <TabsContent value="tips" className="mt-4">
                  <AITipsPanel data={aiData?.tips} onJumpTo={jumpToTimestamp} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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

              {aiData ? (
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
                    onClick={handleProcess}
                    disabled={processVideo.isPending}
                  >
                    {processVideo.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reprocessing...
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
                  onClick={handleProcess}
                  disabled={processVideo.isPending}
                >
                  {processVideo.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Process with AI
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

// ============================================
// AI FEATURE PANELS
// ============================================

function AIOverviewPanel({ data }: { data?: any }) {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>AI-generated overview will appear here</p>
        <p className="text-sm mt-2">
          Click "Process with AI" to generate insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="font-semibold mb-2">Summary</h3>
        <p className="text-muted-foreground">{data.summary}</p>
      </div>

      <Separator />

      {/* Key Points */}
      <div>
        <h3 className="font-semibold mb-3">Key Points</h3>
        <ul className="space-y-2">
          {data.key_points?.map((point: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Topics */}
      <div>
        <h3 className="font-semibold mb-3">Topics Covered</h3>
        <div className="flex flex-wrap gap-2">
          {data.topics?.map((topic: string, index: number) => (
            <Badge key={index} variant="secondary">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Meta */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Difficulty: </span>
          <Badge variant="outline">{data.difficulty_level}</Badge>
        </div>
      </div>

      {data.recommended_for && data.recommended_for.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Recommended For</h3>
            <div className="flex flex-wrap gap-2">
              {data.recommended_for.map((audience: string, index: number) => (
                <Badge key={index} variant="outline">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AISegmentsPanel({
  data,
  onJumpTo,
}: {
  data?: any[];
  onJumpTo: (seconds: number) => void;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Video segments will appear here</p>
        <p className="text-sm mt-2">
          AI will divide the video into logical sections
        </p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {data.map((segment: any, index: number) => (
        <Card key={index} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">
                    Segment {segment.segment_number}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(segment.start_time)} -{" "}
                    {formatTime(segment.end_time)}
                  </span>
                </div>
                <h4 className="font-semibold">{segment.title}</h4>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onJumpTo(segment.start_time)}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Jump to
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {segment.description}
            </p>
            {segment.key_concepts && segment.key_concepts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {segment.key_concepts.map((concept: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AIFlashcardsPanel({
  data,
  onJumpTo,
}: {
  data?: any[];
  onJumpTo: (seconds: number) => void;
}) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Flashcards will appear here</p>
        <p className="text-sm mt-2">AI-generated Q&A for quick revision</p>
      </div>
    );
  }

  const toggleFlip = (index: number) => {
    setFlipped((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {data.map((flashcard: any, index: number) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleFlip(index)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Category & Difficulty */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{flashcard.category}</Badge>
                  <Badge
                    variant={
                      flashcard.difficulty === "hard"
                        ? "destructive"
                        : flashcard.difficulty === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {flashcard.difficulty}
                  </Badge>
                </div>
                {flashcard.timestamp !== null && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpTo(flashcard.timestamp);
                    }}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    {Math.floor(flashcard.timestamp / 60)}:
                    {(flashcard.timestamp % 60).toString().padStart(2, "0")}
                  </Button>
                )}
              </div>

              {/* Question */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Question:</p>
                <p className="font-medium">{flashcard.question}</p>
              </div>

              {/* Answer (revealed on flip) */}
              {flipped.has(index) && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Answer:</p>
                  <p className="text-muted-foreground">{flashcard.answer}</p>
                </div>
              )}

              {/* Flip indicator */}
              <div className="text-center text-sm text-muted-foreground">
                {flipped.has(index)
                  ? "Click to hide answer"
                  : "Click to reveal answer"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AITipsPanel({
  data,
  onJumpTo,
}: {
  data?: any[];
  onJumpTo: (seconds: number) => void;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Key tips will appear here</p>
        <p className="text-sm mt-2">Important takeaways and best practices</p>
      </div>
    );
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
        return "destructive";
      case "important":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-3">
      {data.map((tip: any, index: number) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  tip.importance === "critical"
                    ? "text-red-500"
                    : tip.importance === "important"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tip.category}</Badge>
                    <Badge variant={getImportanceColor(tip.importance)}>
                      {tip.importance}
                    </Badge>
                  </div>
                  {tip.timestamp !== null && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onJumpTo(tip.timestamp)}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      {Math.floor(tip.timestamp / 60)}:
                      {(tip.timestamp % 60).toString().padStart(2, "0")}
                    </Button>
                  )}
                </div>
                <p className="font-medium">{tip.tip_text}</p>
                {tip.context && (
                  <p className="text-sm text-muted-foreground">{tip.context}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
