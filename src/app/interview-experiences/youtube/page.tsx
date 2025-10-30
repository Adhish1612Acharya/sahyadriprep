"use client";

import { useInterviewYouTubeVideos } from "@/hooks/useYouTubeVideos.hook";
import { VideoCard } from "@/components/youtube/video-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Video, Search, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function YouTubeVideosPage() {
  const { videosQuery } = useInterviewYouTubeVideos();
  const { data: videos, isLoading, error } = videosQuery;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState<string>("all");

  // Filter videos based on search and company
  const filteredVideos = videos?.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      filterCompany === "all" || video.company_id === filterCompany;

    return matchesSearch && matchesCompany;
  });

  // Get unique companies for filter
  const companies = Array.from(
    new Set(videos?.map((v) => v.companies?.name).filter(Boolean))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-500 mb-4">Error loading videos</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview Experiences</h1>
          <p className="text-muted-foreground">
            Watch real interview experiences from placed students
          </p>
        </div>

        <Button asChild>
          <Link href="/youtube-videos/add">
            <Video className="h-4 w-4 mr-2" />
            Add Video
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Company Filter */}
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company!}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredVideos?.length || 0} of {videos?.length || 0} videos
      </div>

      {/* Videos Grid */}
      {filteredVideos && filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm || filterCompany !== "all"
              ? "No videos found"
              : "No videos yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterCompany !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding your first interview experience video"}
          </p>
          {!searchTerm && filterCompany === "all" && (
            <Button asChild>
              <Link href="/youtube-videos/add">
                <Video className="h-4 w-4 mr-2" />
                Add Video
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
