"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/helpers/youtube-video.helpers";

interface VideoSegment {
  title: string;
  start_time: number;
  end_time: number;
  summary: string;
  category?: string;
}

interface YouTubePlayerControllerProps {
  videoId: string;
  title: string;
  segments?: VideoSegment[];
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

export function YouTubePlayerController({
  videoId,
  title,
  segments = [],
  currentTime = 0,
  onTimeUpdate,
}: YouTubePlayerControllerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(
    null
  );

  // Initialize YouTube Player API
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      const ytPlayer = new window.YT.Player(iframeRef.current, {
        videoId: videoId,
        playerVars: {
          controls: 0, // Hide default controls
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: any) => {
            // @ts-ignore
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  // Update current segment based on time
  useEffect(() => {
    if (segments.length === 0) return;

    const interval = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        onTimeUpdate?.(time);

        // Find current segment
        const segmentIdx = segments.findIndex(
          (seg) => time >= seg.start_time && time <= seg.end_time
        );
        setCurrentSegmentIndex(segmentIdx >= 0 ? segmentIdx : null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player, segments, onTimeUpdate]);

  const jumpToTime = (seconds: number) => {
    if (player && player.seekTo) {
      player.seekTo(seconds, true);
      player.playVideo();
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const getSegmentColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "technical":
        return "bg-blue-500";
      case "behavioral":
        return "bg-green-500";
      case "project":
        return "bg-purple-500";
      case "hr":
        return "bg-orange-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <div ref={iframeRef} className="w-full h-full" />

          {/* Current Segment Overlay */}
          {currentSegmentIndex !== null && segments[currentSegmentIndex] && (
            <div className="absolute bottom-16 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    getSegmentColor(segments[currentSegmentIndex].category)
                  )}
                />
                <span className="text-xs font-semibold uppercase">
                  {segments[currentSegmentIndex].category || "Section"}
                </span>
              </div>
              <p className="text-sm font-medium">
                {segments[currentSegmentIndex].title}
              </p>
            </div>
          )}
        </div>

        {/* Custom Controls */}
        <div className="bg-background p-4 space-y-3">
          {/* Progress Bar with Segments */}
          <div className="relative">
            {/* Segment Markers */}
            {segments.length > 0 && (
              <div className="relative h-8 mb-2 bg-muted rounded-lg overflow-hidden">
                {segments.map((segment, index) => {
                  const startPercent = (segment.start_time / duration) * 100;
                  const widthPercent =
                    ((segment.end_time - segment.start_time) / duration) * 100;

                  return (
                    <button
                      key={index}
                      onClick={() => jumpToTime(segment.start_time)}
                      className={cn(
                        "absolute h-full transition-all hover:opacity-80 group",
                        getSegmentColor(segment.category),
                        currentSegmentIndex === index && "ring-2 ring-white"
                      )}
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      title={segment.title}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap text-white">
                          {formatTimestamp(segment.start_time)} -{" "}
                          {segment.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Time Display */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{formatTimestamp(currentTime)}</span>
              <span>{formatTimestamp(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={!player}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(`https://youtu.be/${videoId}`, "_blank")
              }
            >
              <Maximize className="h-4 w-4 mr-2" />
              Full Screen
            </Button>
          </div>
        </div>

        {/* Segments Legend */}
        {segments.length > 0 && (
          <div className="border-t bg-muted/30 p-4">
            <p className="text-sm font-semibold mb-2">Quick Jump</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {segments.map((segment, index) => (
                <button
                  key={index}
                  onClick={() => jumpToTime(segment.start_time)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-left hover:bg-accent transition-colors",
                    currentSegmentIndex === index && "bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-8 rounded-full",
                      getSegmentColor(segment.category)
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {segment.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(segment.start_time)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
