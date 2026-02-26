"use client";

import { useParams, useRouter } from "next/navigation";
import { useYouTubeResources } from "@/hooks/useYouTubeResources.hook";
import { useLearningResources } from "@/hooks/useLearningResources.hook";
import { YouTubePlayerController } from "@/components/youtube/youtube-player-controller";
import { YouTubeDirectMediaManager } from "@/components/youtube/youtube-direct-media-manager";
import { YouTubeSegmentationManager } from "@/components/youtube/youtube-segmentation-manager";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings, 
  Info, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Youtube,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function YouTubeStudioPage() {
  const { id: collectionId, resourceId } = useParams() as { id: string, resourceId: string };
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(0);

  const { useYoutubeResourceQuery, useSegmentsQuery } = useYouTubeResources(resourceId);
  
  const { data: youtubeResource, isLoading: isYoutubeLoading } = useYoutubeResourceQuery();
  const { data: segments, isLoading: isSegmentsLoading } = useSegmentsQuery();

  if (isYoutubeLoading || isSegmentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing Studio Workspace...</p>
      </div>
    );
  }

  if (!youtubeResource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Resource Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const isPublishable = youtubeResource.isPublishable;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(`/manage-collections/${collectionId}/resources`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                <h1 className="text-lg font-bold tracking-tight">YouTube Studio Workspace</h1>
                {isPublishable ? (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Ready to Publish
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending Requirements
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm">
              Preview Student View
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Player and Info */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <YouTubePlayerController 
              videoId={youtubeResource.youtubeVideoId}
              title="Lecture Video"
              segments={segments?.map(s => ({
                title: s.title,
                start_time: s.startTime,
                end_time: s.endTime,
                summary: s.description || "",
              })) || []}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              jumpToTimestamp={null}
            />

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Resource Metadata
                </CardTitle>
                <Button variant="ghost" size="sm">
                  Edit Details
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Video ID</p>
                    <p className="text-sm font-mono truncate">{youtubeResource.youtubeVideoId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Duration</p>
                    <p className="text-sm">{youtubeResource.durationSeconds ? `${Math.floor(youtubeResource.durationSeconds / 60)}m ${youtubeResource.durationSeconds % 60}s` : "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                    <p className="text-sm font-medium">{isPublishable ? "Ready" : "Incomplete"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Created At</p>
                    <p className="text-sm">{new Date(youtubeResource.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {!isPublishable && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3 mt-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold">Publication Requirements Not Met</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 opacity-80">
                        <li>Attach at least 1 video-wide resource (PDF/Image)</li>
                        <li><strong>OR</strong> define at least 2 segments/chapters</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Management Tabs */}
          <div className="lg:col-span-12 xl:col-span-5">
            <Tabs defaultValue="segments" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="segments" className="text-sm">
                  Chapters & Notes
                </TabsTrigger>
                <TabsTrigger value="media" className="text-sm">
                  Video-Wide Media
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="segments" className="mt-0 focus-visible:outline-none">
                  <YouTubeSegmentationManager youtubeResourceId={resourceId} />
                </TabsContent>
                
                <TabsContent value="media" className="mt-0 focus-visible:outline-none">
                  <YouTubeDirectMediaManager 
                    youtubeResourceId={resourceId} 
                    directMedia={youtubeResource.directMedia || []} 
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
}
