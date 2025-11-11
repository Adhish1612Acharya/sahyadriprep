"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Building2, Calendar } from "lucide-react";
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

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <Image
          src={video.thumbnail_url || "/placeholder-video.jpg"}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
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

        {/* Company Badge */}
        {video.companies && (
          <Badge variant="secondary" className="mb-3">
            <Building2 className="h-3 w-3 mr-1" />
            {video.companies.name}
          </Badge>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(video.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Action Button */}
        <Button size="sm" className="w-full" onClick={handleClick}>
          <Play className="h-4 w-4 mr-2" />
          Watch Interview
        </Button>
      </CardContent>
    </Card>
  );
}
