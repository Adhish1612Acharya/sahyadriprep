export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  headquarters: string | null;
  company_size: string | null;
  glassdoor_rating: number | null;
  college_id: string | null;
}
