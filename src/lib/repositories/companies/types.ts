import { Company } from "@/models";

export interface CompanyWithColleges extends Company {
  colleges: {
    id: string;
    name: string;
  } | null;
}

export interface UpdateCompanyInput {
  name?: string;
  logo_url?: string | null;
  website?: string | null;
  industry?: string | null;
  headquarters?: string | null;
  company_size?: "startup" | "small" | "medium" | "large" | "enterprise";
  glassdoor_rating?: number | null;
}

export type CompanyLight = Pick<
  Company,
  "id" | "name" | "college_id" | "created_by"
>;

export interface CompanyListFilters {
  collegeId?: string;
  search?: string;
  industry?: string;
}

export interface CreateCompanyInput {
  name: string;
  logo_url?: string | null;
  website?: string | null;
  industry?: string | null;
  headquarters?: string | null;
  company_size?: "startup" | "small" | "medium" | "large" | "enterprise" | null;
  glassdoor_rating?: number | null;
  college_id: string;
  created_by: string;
}
