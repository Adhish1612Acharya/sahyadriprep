import { axiosClient } from "@/lib/axiosClient";
import { COMPANY_ENDPOINTS } from "@/constants/api-endpoints.constants";
import {
  Company,
  CompanyFilters,
  CompanyStats,
} from "@/types/services/company.service";
import { CompanyInput, CompanyUpdate } from "@/lib/validations/company.schema";

// ============================================
// SERVICE
// ============================================

/**
 * Company Service
 */
export const companyService = {
  /**
   * Fetch all companies with optional filters
   */
  getAllCompanies: async (filters?: CompanyFilters): Promise<Company[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.industry) params.append("industry", filters.industry);
    if (filters?.college_id) params.append("college_id", filters.college_id);

    const response = await axiosClient.get<Company[]>(
      `${COMPANY_ENDPOINTS.BASE}?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Get company by ID
   */
  getCompanyById: async (id: string): Promise<Company> => {
    const response = await axiosClient.get<Company>(
      COMPANY_ENDPOINTS.BY_ID(id)
    );

    return response.data;
  },

  /**
   * Create a new company
   */
  createCompany: async (input: CompanyInput): Promise<Company> => {
    const response = await axiosClient.post<{
      message: string;
      data: Company;
    }>(COMPANY_ENDPOINTS.BASE, input);

    return response.data.data;
  },

  /**
   * Update an existing company
   */
  updateCompany: async (id: string, input: CompanyUpdate): Promise<Company> => {
    const response = await axiosClient.patch<{
      message: string;
      data: Company;
    }>(COMPANY_ENDPOINTS.BY_ID(id), input);

    return response.data.data;
  },

  /**
   * Delete a company
   */
  deleteCompany: async (id: string): Promise<void> => {
    await axiosClient.delete<{ message: string }>(COMPANY_ENDPOINTS.BY_ID(id));
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Search companies by name
   */
  searchCompanies: async (query: string): Promise<Company[]> => {
    return companyService.getAllCompanies({ search: query });
  },

  /**
   * Get companies by industry
   */
  getCompaniesByIndustry: async (industry: string): Promise<Company[]> => {
    return companyService.getAllCompanies({ industry });
  },

  /**
   * Get companies by size
   */
  getCompaniesBySize: async (
    size: "startup" | "small" | "medium" | "large" | "enterprise"
  ): Promise<Company[]> => {
    const companies = await companyService.getAllCompanies();
    return companies.filter((company) => company.company_size === size);
  },

  /**
   * Get companies grouped by industry
   */
  getCompaniesGroupedByIndustry: async (): Promise<
    Record<string, Company[]>
  > => {
    const companies = await companyService.getAllCompanies();

    const grouped = companies.reduce((acc, company) => {
      const industry = company.industry || "Other";
      if (!acc[industry]) {
        acc[industry] = [];
      }
      acc[industry].push(company);
      return acc;
    }, {} as Record<string, Company[]>);

    return grouped;
  },

  /**
   * Get top-rated companies
   */
  getTopRatedCompanies: async (limit: number = 10): Promise<Company[]> => {
    const companies = await companyService.getAllCompanies();

    return companies
      .filter((company) => company.glassdoor_rating !== null)
      .sort((a, b) => (b.glassdoor_rating || 0) - (a.glassdoor_rating || 0))
      .slice(0, limit);
  },

  /**
   * Get company statistics
   */
  getCompanyStats: async (): Promise<CompanyStats> => {
    const companies = await companyService.getAllCompanies();

    const byIndustry = companies.reduce((acc, company) => {
      const industry = company.industry || "Other";
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySize = companies.reduce((acc, company) => {
      const size = company.company_size || "unknown";
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRatings = companies.reduce(
      (sum, company) => sum + (company.glassdoor_rating || 0),
      0
    );
    const companiesWithRating = companies.filter(
      (c) => c.glassdoor_rating !== null
    ).length;
    const averageRating =
      companiesWithRating > 0 ? totalRatings / companiesWithRating : 0;

    return {
      total: companies.length,
      byIndustry,
      bySize,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  },

  /**
   * Get recent companies (last 30 days)
   */
  getRecentCompanies: async (days: number = 30): Promise<Company[]> => {
    const companies = await companyService.getAllCompanies();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return companies.filter((company) => {
      const createdAt = new Date(company.created_at);
      return createdAt >= cutoffDate;
    });
  },

  /**
   * Generate company logo URL using Clearbit
   */
  generateClearbitLogo: (domain: string): string => {
    // Extract domain from website URL if full URL is provided
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    return `https://logo.clearbit.com/${cleanDomain}`;
  },

  /**
   * Get company size label
   */
  getCompanySizeLabel: (size: Company["company_size"]): string => {
    const sizeLabels: Record<string, string> = {
      startup: "Startup (1-50 employees)",
      small: "Small (51-200 employees)",
      medium: "Medium (201-1000 employees)",
      large: "Large (1001-10000 employees)",
      enterprise: "Enterprise (10000+ employees)",
    };
    return sizeLabels[size || ""] || "Unknown";
  },

  /**
   * Get company size badge color
   */
  getCompanySizeBadgeClass: (size: Company["company_size"]): string => {
    const sizeColors: Record<string, string> = {
      startup: "bg-purple-100 text-purple-800",
      small: "bg-blue-100 text-blue-800",
      medium: "bg-green-100 text-green-800",
      large: "bg-orange-100 text-orange-800",
      enterprise: "bg-red-100 text-red-800",
    };
    return sizeColors[size || ""] || "bg-gray-100 text-gray-800";
  },
};
