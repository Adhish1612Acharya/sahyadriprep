"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewExperiences } from "@/hooks/useInterviewExperiences.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";

type FilterType = "all" | "company" | "college" | "batch";

export default function InterviewExperiencesPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    useExperiencesQuery,
    useExperiencesByCompanyQuery,
    useExperiencesByCollegeQuery,
    useExperiencesByBatchQuery,
  } = useInterviewExperiences();

  // Determine which query to use based on filter
  const allQuery = useExperiencesQuery();
  const companyQuery = useExperiencesByCompanyQuery(
    filterType === "company" && filterValue ? filterValue : null
  );
  const collegeQuery = useExperiencesByCollegeQuery(
    filterType === "college" && filterValue ? filterValue : null
  );
  const batchQuery = useExperiencesByBatchQuery(
    filterType === "batch" && filterValue ? filterValue : null
  );

  // Select the active query
  const activeQuery =
    filterType === "company"
      ? companyQuery
      : filterType === "college"
      ? collegeQuery
      : filterType === "batch"
      ? batchQuery
      : allQuery;

  const { data: experiences, isLoading, isError, error } = activeQuery;

  console.log("Experiences Data:", experiences);

  // Filter by search query
  const filteredExperiences = experiences?.filter((exp: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      exp.student_name?.toLowerCase().includes(query) ||
      exp.companies?.name?.toLowerCase().includes(query) ||
      exp.colleges?.name?.toLowerCase().includes(query) ||
      exp.batch?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Interview Experiences</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all interview experiences
          </p>
        </div>
        <Button onClick={() => router.push("/admin/interview-experiences/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Experience
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
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
            </div>

            {/* Filter Type */}
            <Select
              value={filterType}
              onValueChange={(val) => {
                setFilterType(val as FilterType);
                setFilterValue("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experiences</SelectItem>
                <SelectItem value="company">By Company</SelectItem>
                <SelectItem value="college">By College</SelectItem>
                <SelectItem value="batch">By Batch</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Value */}
            {filterType !== "all" && (
              <Input
                placeholder={
                  filterType === "company"
                    ? "Enter company UUID..."
                    : filterType === "college"
                    ? "Enter college UUID..."
                    : "Enter batch (e.g., 2023-2027)..."
                }
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}
          </div>

          {/* Active Filter Badge */}
          {filterType !== "all" && filterValue && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filter:
              </span>
              <Badge variant="secondary">
                {filterType}: {filterValue}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterValue("");
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
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
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredExperiences?.length || 0} experience(s)
        </div>
      )}

      {/* Experiences List */}
      {!isLoading &&
      !isError &&
      filteredExperiences &&
      filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredExperiences.map((exp: any) => (
            <Card
              key={exp.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/interview-experiences/${exp.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-semibold">
                        {exp.student_name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exp.companies?.name} • {exp.batch}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{exp.company_details?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span>{exp.college_details?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Batch: {exp.batch}</span>
                      </div>
                      {exp.placed_year && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Placed: {exp.placed_year}</span>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {exp.document_media_id && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          PDF Available
                        </Badge>
                      )}

                      {exp.video_media_id && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Video className="h-3 w-3" />
                          Video Available
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Company Logo */}
                  {exp.companies?.logo_url && (
                    <div className="ml-4">
                      <img
                        src={exp.companies.logo_url}
                        alt={exp.companies.name}
                        className="h-16 w-16 object-contain rounded-lg border"
                      />
                    </div>
                  )}
                </div>
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
                {searchQuery || filterValue
                  ? "Try adjusting your filters"
                  : "Get started by adding your first interview experience"}
              </p>
              <Button
                onClick={() => router.push("/admin/interview-experiences/add")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Experience
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
