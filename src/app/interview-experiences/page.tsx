"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewExperiences } from "@/hooks/useInterviewExperiences.hook";
import { useCompanies } from "@/hooks/useCompanies.hook";
import { useAuth } from "@/contexts/auth-context"; // ✅ Import useAuth
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Filter,
  Building2,
  School,
  Calendar,
  FileText,
  Video,
  AlertCircle,
  X,
} from "lucide-react";
import Image from "next/image";

export default function InterviewExperiencesPage() {
  const router = useRouter();
  const { isAdmin } = useAuth(); // ✅ Get admin status from context
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch companies
  const { useCompaniesQuery } = useCompanies();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompaniesQuery();

  // Fetch experiences based on filters
  const {
    useExperiencesQuery,
    // useExperiencesByCompanyQuery,
    // useExperiencesByBatchQuery,
  } = useInterviewExperiences();

  // Determine which query to use
  const allQuery = useExperiencesQuery();
  // const companyQuery = useExperiencesByCompanyQuery(
  //   selectedCompanyId !== "all" ? selectedCompanyId : null
  // );
  // const batchQuery = useExperiencesByBatchQuery(batchFilter || null);

  // Select the active query based on active filters
  const activeQuery = allQuery;
  const { data: experiences, isLoading, isError, error } = activeQuery;

  // Filter by search query (client-side)
  const filteredExperiences = experiences?.filter((exp) => {
    const matchesSearch =
      !searchQuery ||
      exp.seniorStudent?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exp.companyDetails?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exp.collegeDetails?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exp.seniorStudent?.batch
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCompany =
      selectedCompanyId === "all" || exp.companyId === selectedCompanyId;

    const matchesBatch =
      !batchFilter ||
      exp.seniorStudent?.batch
        ?.toLowerCase()
        .includes(batchFilter.toLowerCase());

    return matchesSearch && matchesCompany && matchesBatch;
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCompanyId("all");
    setBatchFilter("");
    setSearchQuery("");
  };

  // Check if any filter is active
  const hasActiveFilters =
    selectedCompanyId !== "all" || batchFilter || searchQuery;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Interview Experiences</h1>
          <p className="text-muted-foreground mt-1">
            Browse documented experiences shared by placed students
          </p>
        </div>
        {/* ✅ Only show Add button for admins */}
        {isAdmin && (
          <Button
            onClick={() => router.push("/admin/interview-experiences/add")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Experience
          </Button>
        )}
      </div>

      {/* Filters */}
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
                Clear All Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Company Filter */}
            <div className="relative">
              <Select
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
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
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
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
              {selectedCompanyId !== "all" && (
                <button
                  onClick={() => setSelectedCompanyId("all")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Batch Filter */}
            <div className="relative">
              <Input
                placeholder="Filter by Batch (e.g., 2023-2027)"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              />
              {batchFilter && (
                <button
                  onClick={() => setBatchFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCompanyId !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Company:{" "}
                  {companies.find((c) => c.id === selectedCompanyId)?.name}
                  <button
                    onClick={() => setSelectedCompanyId("all")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {batchFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Batch: {batchFilter}
                  <button
                    onClick={() => setBatchFilter("")}
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

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white dark:bg-gray-950 shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="p-6 flex-1 space-y-4">
                  <Skeleton className="h-6 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
                <div className="p-4 flex justify-end">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load interview experiences: {error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      {!isLoading && !isError && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredExperiences?.length || 0} experience(s)
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* Experiences List */}
      {!isLoading &&
      !isError &&
      filteredExperiences &&
      filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp) => (
            <Card
              key={exp.id}
              className="rounded-xl shadow hover:shadow-lg transition cursor-pointer flex flex-col h-full"
              onClick={() => router.push(`/interview-experiences/${exp.id}`)}
            >
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col gap-2 flex-1">
                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-xl font-bold mb-1 truncate">
                      {exp.seniorStudent?.name || "Anonymous"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {exp.companyDetails?.name} • {exp.seniorStudent?.batch}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-xs mt-2">
                    {exp.companyDetails?.name && (
                      <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {exp.companyDetails?.name}
                      </span>
                    )}
                    {exp.collegeDetails?.name && (
                      <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <School className="h-3 w-3 text-muted-foreground" />
                        {exp.collegeDetails.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Batch: {exp.seniorStudent?.batch}
                    </span>
                    {exp.seniorStudent?.placedYear && (
                      <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        Placed: {exp.seniorStudent?.placedYear}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.documentMediaId && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Document
                      </Badge>
                    )}
                    {exp.videoMediaId && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Video className="h-3 w-3" />
                        Video
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Company Logo */}
                {exp.companyDetails?.logoUrl && (
                  <div className="mt-4 flex justify-end">
                    <Image
                      src={exp.companyDetails.logoUrl}
                      alt={exp.companyDetails.name}
                      width={48}
                      height={48}
                      className="object-contain rounded-lg border"
                      unoptimized
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading &&
        !isError && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No experiences found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No interview experiences available yet"}
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                isAdmin && (
                  <Button
                    onClick={() =>
                      router.push("/admin/interview-experiences/add")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Experience
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* Announcement Card */}
      <Card className="mb-6 mt-6">
        <CardContent>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="font-semibold text-primary text-base">
              More Senior interview experiences and Placement Officer sessions
              will be uploaded soon. Stay tuned on our WhatsApp group for
              updates!
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
