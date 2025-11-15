"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  Building2,
  Calendar,
  Youtube,
  Sparkles,
} from "lucide-react";
import { YouTubeVideo } from "@/types/services/interview-youtube-video.types";
import { formatDuration } from "@/helpers/youtube/youtube-video.helpers";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface VideoCardProps {
  video: YouTubeVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/interview-experiences/youtube/${video.id}`);
  };

  // ✅ Handler to open YouTube link in new tab
  const handleYouTubeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    window.open(`https://youtu.be/${video.video_id}`, "_blank");
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <Image
          src={
            video.thumbnail_url ||
            `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`
          }
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />

        {/* Duration Badge */}
        {video.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white hover:bg-black/90">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        )}

        {/* ✅ AI Processing Badge - Top Left */}
        {video.ai_process_done && (
          <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground hover:bg-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <Play className="h-8 w-8 text-primary fill-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {video.description}
          </p>
        )}

        {/* ✅ PRIMARY ACTION - Watch Interview Button (Most Prominent) */}
        <Button size="sm" className="w-full mb-3" onClick={handleClick}>
          <Play className="h-4 w-4 mr-2" />
          Watch Interview
        </Button>

        {/* ✅ Badges Row - YouTube + Company (Below the main button) */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* YouTube Badge - Smaller, less prominent */}
          <Badge
            variant="outline"
            className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition-all text-xs"
            onClick={handleYouTubeClick}
            title="Watch on YouTube"
          >
            <Youtube className="h-3 w-3 mr-1" />
            YouTube
          </Badge>

          {/* Company Badge */}
          {video.companies && (
            <Badge variant="secondary" className="text-xs">
              {video.companies.logo_url && (
                <Image
                  src={video.companies.logo_url}
                  alt={video.companies.name}
                  width={16}
                  height={16}
                  className="rounded mr-1"
                />
              )}
              <Building2 className="h-3 w-3 mr-1" />
              {video.companies.name}
            </Badge>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(video.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
