"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/hooks/useCompanies.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Star,
  Search,
  Filter,
  X,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Industry options for filtering
const INDUSTRIES = [
  "tech",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Consulting",
  "E-commerce",
  "Education",
  "Telecommunications",
  "Automotive",
  "Retail",
  "Energy",
  "Real Estate",
  "Media & Entertainment",
  "Other",
];

// Company size options
const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-50)" },
  { value: "small", label: "Small (51-200)" },
  { value: "medium", label: "Medium (201-1000)" },
  { value: "large", label: "Large (1001-10000)" },
  { value: "enterprise", label: "Enterprise (10000+)" },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");

  // Fetch companies with filters
  const { useCompaniesQuery } = useCompanies();
  const { data: allCompanies = [], isLoading, error } = useCompaniesQuery();

  // Filter companies based on search, industry, and size
  const filteredCompanies = allCompanies.filter((company) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.headquarters?.toLowerCase().includes(searchQuery.toLowerCase());

    // Industry filter
    const matchesIndustry =
      industryFilter === "all" || company.industry === industryFilter;

    // Size filter
    const matchesSize =
      sizeFilter === "all" || company.company_size === sizeFilter;

    return matchesSearch && matchesIndustry && matchesSize;
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setIndustryFilter("all");
    setSizeFilter("all");
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery || industryFilter !== "all" || sizeFilter !== "all";

  // Get company size badge class
  const getCompanySizeBadgeClass = (size: string | null) => {
    const sizeColors: Record<string, string> = {
      startup:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      small: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      medium:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      large:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      enterprise: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      sizeColors[size || ""] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    );
  };

  // Get company size label
  const getCompanySizeLabel = (size: string | null) => {
    const sizeLabel = COMPANY_SIZES.find((s) => s.value === size);
    return sizeLabel?.label.split(" ")[0] || "Unknown";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Explore companies for which placement experiences and content are
              available
            </h1>
            <p className="text-muted-foreground mb-4">
              More company experiences, Senior interview stories, and Placement
              Officer sessions will be added soon.
              <br />
              Stay tuned on our WhatsApp group for updates!
            </p>
            <a
              href="https://chat.whatsapp.com/HtZFz8GepZf9rzCDhl8vuI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 rounded bg-green-500 text-white font-medium hover:bg-green-600 transition"
            >
              Join WhatsApp Group
            </a>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
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

            {/* Industry Filter */}
            <div className="relative">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {industryFilter !== "all" && (
                <button
                  onClick={() => setIndustryFilter("all")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Size Filter */}
            <div className="relative">
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sizeFilter !== "all" && (
                <button
                  onClick={() => setSizeFilter("all")}
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
              {industryFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Industry: {industryFilter}
                  <button
                    onClick={() => setIndustryFilter("all")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {sizeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Size:{" "}
                  {COMPANY_SIZES.find((s) => s.value === sizeFilter)?.label}
                  <button
                    onClick={() => setSizeFilter("all")}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load companies: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      {!isLoading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredCompanies.length} of {allCompanies.length}{" "}
            companies
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* Companies Grid */}
      {!isLoading &&
      !error &&
      filteredCompanies &&
      filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="group hover:shadow-lg transition-all"
              //   onClick={() => router.push(`/companies/${company.id}`)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-contain border"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {company.industry || "Industry not specified"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Location */}
                {company.headquarters && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{company.headquarters}</span>
                  </div>
                )}

                {/* Company Size */}
                {company.company_size && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="secondary"
                      className={getCompanySizeBadgeClass(company.company_size)}
                    >
                      {getCompanySizeLabel(company.company_size)}
                    </Badge>
                  </div>
                )}

                {/* Glassdoor Rating */}
                {company.glassdoor_rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {company.glassdoor_rating}
                    </span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                )}

                {/* Website Link */}
                {company.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(company.website || "", "_blank");
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters ? "No companies found" : "No companies yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Companies that hire from our college will appear here"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
