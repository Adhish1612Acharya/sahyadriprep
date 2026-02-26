"use client";

import { useYouTubeResources } from "@/hooks/useYouTubeResources.hook";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Paperclip, 
  Clock, 
  ChevronRight, 
  GripVertical,
  Loader2,
  FilePlus,
  ArrowRight
} from "lucide-react";
import { YouTubeSegmentForm } from "@/components/forms/youtube-segment-form";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface YouTubeSegmentationManagerProps {
  youtubeResourceId: string;
}

export function YouTubeSegmentationManager({
  youtubeResourceId,
}: YouTubeSegmentationManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState<string | null>(null); // segmentId
  const [mediaLabel, setMediaLabel] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const { 
    useSegmentsQuery, 
    createSegmentMutation, 
    deleteSegmentMutation,
    uploadSegmentMediaMutation
  } = useYouTubeResources(youtubeResourceId);

  const { data: segments, isLoading } = useSegmentsQuery();

  const handleCreateSegment = async (data: any) => {
    try {
      await createSegmentMutation.mutateAsync({
        ...data,
        youtubeResourceId,
      });
      setIsAddOpen(false);
    } catch (error) {}
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMediaOpen || !mediaFile) return;

    try {
      await uploadSegmentMediaMutation.mutateAsync({
        youtubeResourceId,
        segmentId: isMediaOpen,
        label: mediaLabel,
        file: mediaFile,
      });
      setIsMediaOpen(null);
      setMediaLabel("");
      setMediaFile(null);
    } catch (error) {}
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Video Segments (Chapters)</h3>
          <p className="text-sm text-muted-foreground">
            Break the video into chapters and attach specific notes to each.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Segment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video Segment</DialogTitle>
              <DialogDescription>
                Define the start and end times to create a chapter students can jump to.
              </DialogDescription>
            </DialogHeader>
            <YouTubeSegmentForm 
              onSubmit={handleCreateSegment} 
              isLoading={createSegmentMutation.isPending}
              defaultStartTime={segments && segments.length > 0 ? segments[segments.length-1].endTime : 0}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !segments || segments.length === 0 ? (
        <Card className="bg-muted/30 border-dashed py-12 text-center">
          <CardContent className="flex flex-col items-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground max-w-[250px]">
              No segments created. Add at least <strong>2 segments</strong> to make this video publishable via segmentation.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddOpen(true)}>
              Define First Segment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={segments.length >= 2 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}
            >
              {segments.length} / 2 required for publishing
            </Badge>

            {segments.length < 2 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                (Need {2 - segments.length} more)
              </p>
            )}
          </div>
          
          <div className="grid gap-4">
            {segments.map((segment) => (
              <Card key={segment.id} className="relative group overflow-hidden border-l-4 border-l-primary/30 hover:border-l-primary transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Timestamp Badge */}
                    <div className="bg-muted/30 px-4 py-6 flex flex-col items-center justify-center min-w-[100px] border-r">
                      <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Start</span>
                      <span className="text-lg font-mono font-bold">{formatSeconds(segment.startTime)}</span>
                      <div className="h-4 w-px bg-muted-foreground/20 my-1" />
                      <span className="text-sm font-mono text-muted-foreground">{formatSeconds(segment.endTime)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-lg">{segment.title}</h4>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteSegmentMutation.mutate(segment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {segment.description || "No description provided."}
                      </p>
                      
                      {/* Media Attachments */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {/* Dummy list for now */}
                        <Badge variant="outline" className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 cursor-pointer border-primary/20" onClick={() => setIsMediaOpen(segment.id)}>
                          <FilePlus className="h-3 w-3" />
                          Attach Notes
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Media Attachment Dialog */}
      <Dialog open={!!isMediaOpen} onOpenChange={(open) => !open && setIsMediaOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Media to Segment</DialogTitle>
            <DialogDescription>
              Upload a file that specifically pertains to this chapter of the video.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMedia} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="media-label">Label</Label>
              <Input 
                id="media-label"
                placeholder="e.g., Code Snippet for this section" 
                value={mediaLabel}
                onChange={(e) => setMediaLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-file">File</Label>
              <Input 
                id="media-file"
                type="file"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={uploadSegmentMediaMutation.isPending}
            >
              {uploadSegmentMediaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Attach to Segment"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
