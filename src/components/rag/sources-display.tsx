"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Video,
  Clock,
  ExternalLink,
  PlayCircle,
  User,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { SourcesDisplay } from "@/types/rag-source-display.types";
import { cn } from "@/lib/utils";
import { Camelize } from "@/types";

interface SourcesDisplayProps {
  sources: Camelize<SourcesDisplay>;
  className?: string;
}

export function SourcesDisplayComponent({
  sources,
  className,
}: SourcesDisplayProps) {
  const totalSources =
    (sources.interviewDocuments?.length ?? 0) +
    (sources.youtubeVideos?.length ?? 0) +
    (sources.youtubeTimestamps?.length ?? 0);

  if (totalSources === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No sources available</p>
      </div>
    );
  }

  // Group timestamps by video
  const timestampsByVideo = (sources.youtubeTimestamps ?? []).reduce(
    (acc, ts) => {
      if (!acc[ts.id]) {
        acc[ts.id] = {
          videoTitle: ts.videoTitle,
          videoUrl: ts.videoUrl,
          timestamps: [],
        };
      }
      acc[ts.id].timestamps.push(ts);
      return acc;
    },
    {} as Record<
      string,
      {
        videoTitle: string;
        videoUrl: string;
        timestamps: typeof sources.youtubeTimestamps;
      }
    >,
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Interview Documents */}
      {sources.interviewDocuments && sources.interviewDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Interview Experiences ({sources.interviewDocuments.length})
          </h4>
          <div className="space-y-2">
            {sources.interviewDocuments.map((doc, index) => (
              <Link
                key={doc.id}
                href={`/interview-experiences/${doc.id}`}
                className="block"
              >
                <div className="group p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          [{index + 1}]
                        </span>
                        <h5 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {doc.title}
                        </h5>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {doc.studentName}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {doc.batch}
                        </Badge>
                        {doc.hasVideoPreview && (
                          <Badge variant="default" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Video Available
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(doc.similarity * 100).toFixed(1)}% match
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {doc.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sources.interviewDocuments &&
        sources.interviewDocuments.length > 0 &&
        ((sources.youtubeVideos && sources.youtubeVideos.length > 0) ||
          (sources.youtubeTimestamps &&
            sources.youtubeTimestamps.length > 0)) && <Separator />}

      {/* YouTube Videos (Non-Transcript) */}
      {sources.youtubeVideos && sources.youtubeVideos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Video className="h-3.5 w-3.5" />
            YouTube Videos ({sources.youtubeVideos.length})
          </h4>
          <div className="space-y-2">
            {sources.youtubeVideos.map((video, index) => (
              <Link
                key={`${video.id}-${index}`}
                href={`/interview-experiences/youtube/${video.id}`}
                className="block"
              >
                <div className="group p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          [
                          {(sources.interviewDocuments?.length ?? 0) +
                            index +
                            1}
                          ]
                        </span>
                        <h5 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {video.title}
                        </h5>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {video.contentSection}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(video.similarity * 100).toFixed(1)}% match
                        </span>
                      </div>
                    </div>
                    <PlayCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sources.youtubeVideos &&
        sources.youtubeVideos.length > 0 &&
        sources.youtubeTimestamps &&
        sources.youtubeTimestamps.length > 0 && <Separator />}

      {/* YouTube Timestamps (Grouped by Video) */}
      {Object.keys(timestampsByVideo).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Video Timestamps ({sources.youtubeTimestamps?.length ?? 0})
          </h4>
          {Object.entries(timestampsByVideo).map(
            ([videoId, videoData], videoIndex) => (
              <div key={videoId} className="space-y-2">
                <Link
                  href={`/interview-experiences/youtube/${videoId}`}
                  className="block"
                >
                  <h5 className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    {videoData.videoTitle}
                  </h5>
                </Link>
                <div className="space-y-2 pl-4 border-l-2">
                  {videoData.timestamps.map((ts, tsIndex) => {
                    const timeMatch = ts.timestampUrl.match(/[?&]t=(\d+)/);
                    const timestampSeconds = timeMatch ? timeMatch[1] : "0";

                    return (
                      <Link
                        key={`${ts.id}-${tsIndex}`}
                        href={`/interview-experiences/youtube/${videoId}?t=${timestampSeconds}`}
                        className="block"
                      >
                        <div className="group p-2.5 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground">
                                [
                                {(sources.interviewDocuments?.length ?? 0) +
                                  (sources.youtubeVideos?.length ?? 0) +
                                  videoIndex * videoData.timestamps.length +
                                  tsIndex +
                                  1}
                                ]
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs font-mono"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {ts.startTimestamp} - {ts.endTimestamp}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({Math.floor(ts.durationSeconds)}s)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {(ts.similarity * 100).toFixed(1)}% match
                              </span>
                              <PlayCircle className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {ts.excerpt}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
