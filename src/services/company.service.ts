import { COMPANY_ENDPOINTS } from "@/constants/api-endpoints.constants";
import {
  Company,
  CompanyFilters,
  CompanyStats,
} from "@/types/services/company.types";
import { CompanyInput, CompanyUpdate } from "@/lib/zod/schema/company.schema";
import { httpGet, httpPost, httpPatch, httpDelete } from "@/lib/api/http";

export const companyService = {
  getAllCompanies: async (filters?: CompanyFilters): Promise<Company[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.industry) params.append("industry", filters.industry);
    if (filters?.college_id) params.append("college_id", filters.college_id);

    const url =
      params.toString().length > 0
        ? `${COMPANY_ENDPOINTS.BASE}?${params.toString()}`
        : COMPANY_ENDPOINTS.BASE;

    const response = await httpGet<Company[]>(url);
    return response;
  },

  getCompanyById: async (id: string): Promise<Company> => {
    const response = await httpGet<Company>(COMPANY_ENDPOINTS.BY_ID(id));
    return response;
  },

  createCompany: async (input: CompanyInput): Promise<Company> => {
    const response = await httpPost<
      { message: string; data: Company },
      CompanyInput
    >(COMPANY_ENDPOINTS.BASE, input);
    return response.data;
  },

  updateCompany: async (id: string, input: CompanyUpdate): Promise<Company> => {
    const response = await httpPatch<
      { message: string; data: Company },
      CompanyUpdate
    >(COMPANY_ENDPOINTS.BY_ID(id), input);
    return response.data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    await httpDelete<{ message: string }>(COMPANY_ENDPOINTS.BY_ID(id));
  },

  // Utility methods

  searchCompanies: async (query: string): Promise<Company[]> => {
    const response = await companyService.getAllCompanies({ search: query });
    return response;
  },

  getCompaniesByIndustry: async (industry: string): Promise<Company[]> => {
    const response = await companyService.getAllCompanies({ industry });
    return response;
  },

  getCompaniesBySize: async (
    size: "startup" | "small" | "medium" | "large" | "enterprise"
  ): Promise<Company[]> => {
    const response = await companyService.getAllCompanies();
    return response.filter((company) => company.company_size === size);
  },

  getCompaniesGroupedByIndustry: async (): Promise<
    Record<string, Company[]>
  > => {
    const response = await companyService.getAllCompanies();
    return response.reduce((acc, company) => {
      const industry = company.industry || "Other";
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(company);
      return acc;
    }, {} as Record<string, Company[]>);
  },

  getTopRatedCompanies: async (limit: number = 10): Promise<Company[]> => {
    const response = await companyService.getAllCompanies();
    return response
      .filter((company) => company.glassdoor_rating !== null)
      .sort((a, b) => (b.glassdoor_rating || 0) - (a.glassdoor_rating || 0))
      .slice(0, limit);
  },

  getCompanyStats: async (): Promise<CompanyStats> => {
    const response = await companyService.getAllCompanies();

    const byIndustry = response.reduce((acc, company) => {
      const industry = company.industry || "Other";
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySize = response.reduce((acc, company) => {
      const size = company.company_size || "unknown";
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRatings = response.reduce(
      (sum, company) => sum + (company.glassdoor_rating || 0),
      0
    );
    const companiesWithRating = response.filter(
      (c) => c.glassdoor_rating !== null
    ).length;
    const averageRating =
      companiesWithRating > 0 ? totalRatings / companiesWithRating : 0;

    return {
      total: response.length,
      byIndustry,
      bySize,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  },

  getRecentCompanies: async (days: number = 30): Promise<Company[]> => {
    const response = await companyService.getAllCompanies();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return response.filter((company) => {
      const createdAt = new Date(company.created_at);
      return createdAt >= cutoffDate;
    });
  },

  generateClearbitLogo: (domain: string): string => {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    return `https://logo.clearbit.com/${cleanDomain}`;
  },

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
