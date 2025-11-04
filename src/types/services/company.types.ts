// ============================================
// TYPES
// ============================================

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  headquarters: string | null;
  company_size: "startup" | "small" | "medium" | "large" | "enterprise" | null;
  glassdoor_rating: number | null;
  college_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  colleges?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  college_id?: string;
}

export interface CompanyStats {
  total: number;
  byIndustry: Record<string, number>;
  bySize: Record<string, number>;
  averageRating: number;
}
