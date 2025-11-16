"use client";

import { useInterviewYouTubeVideos } from "@/hooks/useYouTubeVideos.hook";
import { useCompanies } from "@/hooks/useCompanies.hook";
import { useAuth } from "@/contexts/auth-context"; // ✅ Import useAuth
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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Video,
  Search,
  Filter,
  X,
  Building2,
  Plus,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function YouTubeVideosPage() {
  const { isAdmin } = useAuth(); // ✅ Get admin status
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompanyId, setFilterCompanyId] = useState<string>("all");

  // Fetch companies
  const { useCompaniesQuery } = useCompanies();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompaniesQuery();

  // Fetch videos based on company filter
  const { videosQuery, useVideosByCompanyQuery } = useInterviewYouTubeVideos();

  // Use the appropriate query based on filter
  const allVideosQuery = videosQuery;
  const companyVideosQuery = useVideosByCompanyQuery(
    filterCompanyId !== "all" ? filterCompanyId : null
  );

  // Select the active query
  const activeQuery =
    filterCompanyId !== "all" ? companyVideosQuery : allVideosQuery;

  const { data: videos, isLoading: isLoadingVideos, error } = activeQuery;

  // Client-side search filtering
  const filteredVideos = videos?.filter((video) => {
    if (!searchTerm) return true;

    const query = searchTerm.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query) ||
      video.companies?.name?.toLowerCase().includes(query)
    );
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterCompanyId("all");
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm || filterCompanyId !== "all";

  const isLoading = isLoadingVideos || isLoadingCompanies;

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-500 mb-4">
          Error loading videos: {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ✅ Channel Attribution Section */}
      <Alert className="mb-6 border-red-500/50 bg-red-500/5">
        <Youtube className="h-4 w-4 text-red-500" />
        <AlertDescription className="ml-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-foreground mb-1">
                Video Source: Prof. Rashmi Bhandary Placement Channel
              </p>
              <p className="text-sm text-muted-foreground">
                All videos are sourced from{" "}
                <strong> Prof. Rashmi Bhandary&apos;s YouTube channel</strong>{" "}
                and are used here for educational purposes with proper
                attribution.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 border-red-500 text-red-500 hover:bg-red-500/10 cursor-pointer"
              onClick={() =>
                window.open("https://www.youtube.com/@RashmiBhandary", "_blank")
              }
            >
              <Youtube className="h-4 w-4 mr-2" />
              Visit Channel
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview Sessions</h1>
          <p className="text-muted-foreground">
            Watch real interview experiences recorded by placement cell
          </p>
        </div>
        {/* ✅ Only show Add button for admins */}
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/interview-experiences/youtube/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Link>
          </Button>
        )}
      </div>
      {/* Filters Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, description, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Company Filter */}
            <div className="relative">
              <Select
                value={filterCompanyId}
                onValueChange={setFilterCompanyId}
                disabled={isLoadingCompanies}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCompanies
                        ? "Loading companies..."
                        : "Filter by Company"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        {company.logo_url ? (
                          <Image
                            src={company.logo_url}
                            alt={company.name}
                            width={16}
                            height={16}
                            className="object-contain rounded"
                            unoptimized
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{company.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterCompanyId !== "all" && (
                <button
                  onClick={() => setFilterCompanyId("all")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterCompanyId !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Company:{" "}
                  {companies.find((c) => c.id === filterCompanyId)?.name}
                  <button
                    onClick={() => setFilterCompanyId("all")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredVideos?.length || 0} of {videos?.length || 0} videos
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Reset Filters
          </Button>
        )}
      </div>
      {/* Loading Skeletons (for initial load and company filter change) */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow"
            >
              {/* Thumbnail skeleton */}
              <Skeleton className="w-full aspect-video" />
              <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <Skeleton className="h-6 w-3/4" />
                {/* Description skeleton */}
                <Skeleton className="h-4 w-2/3" />
                {/* Badges row skeleton */}
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                {/* Button skeleton */}
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Videos Grid */}
      {!isLoading && filteredVideos && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
      {!isLoading && filteredVideos && filteredVideos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? "No videos found" : "No videos yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "No interview videos available at the moment"}
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearAllFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              // ✅ Only show Add button for admins in empty state
              isAdmin && (
                <Button asChild>
                  <Link href="/admin/interview-experiences/youtube/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Video
                  </Link>
                </Button>
              )
            )}
          </CardContent>
        </Card>
      )}
      {/* Info Card about more videos and WhatsApp group */}
      <Card className="mb-6 mt-6">
        <CardContent>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="font-semibold text-primary text-base">
              More Senior interview experiences and Placement Officer sessions
              will be uploaded soon.
              <br />
              Stay tuned on our WhatsApp group for updates!
            </span>
            <a
              href="https://chat.whatsapp.com/HtZFz8GepZf9rzCDhl8vuI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 rounded bg-green-500 text-white font-medium hover:bg-green-600 transition"
            >
              Join WhatsApp Group
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
