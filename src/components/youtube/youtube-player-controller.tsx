"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Clock } from "lucide-react";
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
  segments: VideoSegment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  jumpToTimestamp: number | null;
  onPlayerReady?: () => void;
}

// ✅ YouTube API callback declaration (YT type comes from project's global types)
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: (() => void) | undefined;
  }
}

export function YouTubePlayerController({
  videoId,
  title,
  segments,
  currentTime,
  onTimeUpdate,
  jumpToTimestamp,
  onPlayerReady,
}: YouTubePlayerControllerProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // ✅ Initialize YouTube Player API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load YouTube API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up API ready callback
    window.onYouTubeIframeAPIReady = () => {
      console.log("✅ YouTube IFrame API Ready");
      initializePlayer();
    };

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.warn("Error destroying player:", e);
        }
      }
    };
  }, []); // Only run once on mount

  // ✅ Re-initialize player when videoId changes
  useEffect(() => {
    if (isReady && player && videoId) {
      console.log("🔄 Loading new video:", videoId);
      player.loadVideoById(videoId);
    }
  }, [videoId, isReady]);

  const initializePlayer = () => {
    if (!playerContainerRef.current || !window.YT) {
      console.warn("⚠️ Player container or YT API not available");
      return;
    }

    try {
      console.log("🎬 Initializing YouTube player with videoId:", videoId);

      const ytPlayer = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        } as any,
        events: {
          onReady: (event: any) => {
            console.log("✅ YouTube Player Ready");
            setPlayer(event.target);
            setDuration(event.target.getDuration());
            setVolume(event.target.getVolume());
            setIsReady(true);

            if (onPlayerReady) {
              onPlayerReady();
            }
          },
          onStateChange: (event: any) => {
            const isPlayingNow = event.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(isPlayingNow);
            console.log("🎵 Player state changed:", event.data);
          },
          onError: (event: any) => {
            console.error("❌ YouTube Player Error:", event.data);
          },
        } as any,
      });
    } catch (error) {
      console.error("❌ Error initializing player:", error);
    }
  };

  // ✅ Handle external jump requests
  useEffect(() => {
    if (
      jumpToTimestamp !== null &&
      jumpToTimestamp !== undefined &&
      player &&
      isReady
    ) {
      console.log("🎯 Jumping to timestamp:", jumpToTimestamp);
      jumpToTime(jumpToTimestamp);
    }
  }, [jumpToTimestamp, player, isReady]);

  // ✅ Update current segment based on time
  useEffect(() => {
    if (!player || !isReady || segments.length === 0) return;

    const interval = setInterval(() => {
      try {
        if (player.getCurrentTime) {
          const time = player.getCurrentTime();
          setLocalCurrentTime(time);
          onTimeUpdate?.(time);

          const segmentIdx = segments.findIndex(
            (seg) => time >= seg.start_time && time <= seg.end_time
          );
          setCurrentSegmentIndex(segmentIdx >= 0 ? segmentIdx : null);
        }
      } catch (e) {
        console.warn("Error getting current time:", e);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, isReady, segments, onTimeUpdate]);

  const jumpToTime = (seconds: number) => {
    if (!player || !isReady) {
      console.warn("⚠️ Player not ready for seeking");
      return;
    }

    try {
      player.seekTo(seconds, true);
      setLocalCurrentTime(seconds);
      if (!isPlaying) {
        player.playVideo();
      }
    } catch (error) {
      console.error("❌ Error seeking:", error);
    }
  };

  const togglePlay = () => {
    if (!player || !isReady) return;

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch (error) {
      console.error("❌ Error toggling play:", error);
    }
  };

  const toggleMute = () => {
    if (!player || !isReady) return;

    try {
      if (isMuted) {
        player.unMute();
        player.setVolume(volume);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("❌ Error toggling mute:", error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!player || !isReady) return;

    try {
      const newVolume = value[0];
      setVolume(newVolume);
      player.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        player.unMute();
        setIsMuted(false);
      }
    } catch (error) {
      console.error("❌ Error changing volume:", error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !player || !isReady) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    jumpToTime(newTime);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current || !player || !isReady) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const dragX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, dragX / rect.width));
    const newTime = percentage * duration;

    setLocalCurrentTime(newTime);
  };

  const handleProgressMouseUp = () => {
    if (isDragging && player && isReady) {
      try {
        player.seekTo(localCurrentTime, true);
      } catch (error) {
        console.error("❌ Error seeking on drag end:", error);
      }
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleProgressMouseUp);
      return () =>
        document.removeEventListener("mouseup", handleProgressMouseUp);
    }
  }, [isDragging, localCurrentTime]);

  const getSegmentColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "technical":
        return "bg-blue-500 hover:bg-blue-600";
      case "behavioral":
        return "bg-green-500 hover:bg-green-600";
      case "project":
        return "bg-purple-500 hover:bg-purple-600";
      case "hr":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const progressPercent =
    duration > 0 ? (localCurrentTime / duration) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {/* ✅ Player container - YouTube API will replace this div */}
          <div
            ref={playerContainerRef}
            className="w-full h-full"
            id="youtube-player"
          />

          {/* Loading state */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-sm">Loading player...</div>
            </div>
          )}

          {/* Current Segment Overlay */}
          {isReady &&
            currentSegmentIndex !== null &&
            segments[currentSegmentIndex] && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md rounded-lg p-3 text-white shadow-xl border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      getSegmentColor(
                        segments[currentSegmentIndex].category
                      ).split(" ")[0]
                    )}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {segments[currentSegmentIndex].category ||
                      "Current Section"}
                  </span>
                  <span className="text-xs text-white/60 ml-auto">
                    {formatTimestamp(segments[currentSegmentIndex].start_time)}{" "}
                    - {formatTimestamp(segments[currentSegmentIndex].end_time)}
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-2">
                  {segments[currentSegmentIndex].title}
                </p>
              </div>
            )}
        </div>

        {/* Custom Controls */}
        <div className="bg-background p-4 space-y-4">
          {/* Enhanced Progress Bar with Segments */}
          <div className="space-y-2">
            {/* Segment Labels (above progress bar) */}
            {segments.length > 0 && duration > 0 && (
              <div className="relative h-6">
                {segments.map((segment, index) => {
                  const startPercent = (segment.start_time / duration) * 100;
                  const widthPercent =
                    ((segment.end_time - segment.start_time) / duration) * 100;
                  const showLabel = widthPercent > 8;

                  return (
                    <div
                      key={index}
                      className="absolute top-0 h-full flex items-center justify-center"
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    >
                      {showLabel && (
                        <span className="text-[10px] font-medium text-muted-foreground truncate px-1">
                          {segment.category || `Segment ${index + 1}`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Progress Bar Container */}
            <div
              ref={progressBarRef}
              className="relative h-3 bg-muted rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressClick}
              onMouseDown={() => setIsDragging(true)}
              onMouseMove={handleProgressDrag}
            >
              {/* Segment Background */}
              {segments.length > 0 && duration > 0 && (
                <>
                  {segments.map((segment, index) => {
                    const startPercent = (segment.start_time / duration) * 100;
                    const widthPercent =
                      ((segment.end_time - segment.start_time) / duration) *
                      100;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "absolute h-full transition-all opacity-30",
                          getSegmentColor(segment.category).split(" ")[0],
                          currentSegmentIndex === index && "opacity-50"
                        )}
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      />
                    );
                  })}
                </>
              )}

              {/* Progress Fill */}
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Scrubber Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
              />

              {/* Segment Dividers */}
              {segments.length > 0 && duration > 0 && (
                <>
                  {segments.slice(1).map((segment, index) => {
                    const startPercent = (segment.start_time / duration) * 100;

                    return (
                      <div
                        key={index}
                        className="absolute top-0 bottom-0 w-[2px] bg-background"
                        style={{ left: `${startPercent}%` }}
                      />
                    );
                  })}
                </>
              )}
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-mono">
                {formatTimestamp(localCurrentTime)}
              </span>
              <span className="font-mono">{formatTimestamp(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={!isReady}
              className="h-9 w-9"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={!isReady}
                className="h-8 w-8"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-20 hidden md:block">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) =>
                    handleVolumeChange([parseInt(e.target.value)])
                  }
                  disabled={!isReady}
                  className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
            </div>

            <div className="flex-1" />

            {/* Time Display */}
            <div className="text-sm text-muted-foreground font-mono hidden sm:block">
              {formatTimestamp(localCurrentTime)} / {formatTimestamp(duration)}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(`https://youtu.be/${videoId}`, "_blank")
              }
              className="h-8"
            >
              <Maximize className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Full Screen</span>
            </Button>
          </div>
        </div>

        {/* Segments Quick Jump Grid */}
        {segments.length > 0 && (
          <div className="border-t bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Video Segments</p>
              <span className="text-xs text-muted-foreground">
                {segments.length} sections
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {segments.map((segment, index) => (
                <button
                  key={index}
                  onClick={() => jumpToTime(segment.start_time)}
                  disabled={!isReady}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed",
                    currentSegmentIndex === index
                      ? "bg-accent ring-2 ring-primary"
                      : "bg-background hover:bg-accent border"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-12 rounded-full flex-shrink-0",
                      getSegmentColor(segment.category).split(" ")[0]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate mb-1">
                      {segment.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatTimestamp(segment.start_time)}
                      </span>
                      {segment.category && (
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {segment.category}
                        </span>
                      )}
                    </div>
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
