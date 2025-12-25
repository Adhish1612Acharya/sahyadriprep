export type CompanySize =
  | "startup"
  | "small"
  | "medium"
  | "large"
  | "enterprise";

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  headquarters?: string;
  company_size?: CompanySize;
  glassdoor_rating?: number; // 0-5
  created_at: string;
  updated_at: string;
  college_id: string;
  created_by: string;
}
