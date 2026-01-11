import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyInput, CompanyUpdate } from "@/lib/zod/schema/company.schema";
import { CompanyFilters } from "@/types/services/company.types";
import { toast } from "sonner";
import { companyApi } from "@/lib/api/company";

export const useCompanies = (filters?: CompanyFilters) => {
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  // ============================================
  // QUERIES
  // ============================================

  const useCompaniesQuery = () =>
    useQuery({
      queryKey: ["companies", filters],
      queryFn: () => companyApi.getAllCompanies(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const useCompanyQuery = (id: string | null) =>
    useQuery({
      queryKey: ["company", id],
      queryFn: () => companyApi.getCompanyById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

  const useCompaniesByIndustryQuery = (industry: string | null) =>
    useQuery({
      queryKey: ["companies", "industry", industry],
      queryFn: () => companyApi.getCompaniesByIndustry(industry!),
      enabled: !!industry,
      staleTime: 5 * 60 * 1000,
    });

  const useCompanyStatsQuery = () =>
    useQuery({
      queryKey: ["companies", "stats"],
      queryFn: () => companyApi.getCompanyStats(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });

  const useTopRatedCompaniesQuery = (limit: number = 10) =>
    useQuery({
      queryKey: ["companies", "top-rated", limit],
      queryFn: () => companyApi.getTopRatedCompanies(limit),
      staleTime: 5 * 60 * 1000,
    });

  const useRecentCompaniesQuery = (days: number = 30) =>
    useQuery({
      queryKey: ["companies", "recent", days],
      queryFn: () => companyApi.getRecentCompanies(days),
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  const createCompany = useMutation({
    mutationFn: (data: CompanyInput) => companyApi.createCompany(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(`Company "${data.name}" added successfully`);
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to create company",
      });
      console.error("❌ Error creating company:", error);
    },
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyUpdate }) =>
      companyApi.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
      toast.success(`Company "${data.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to update company",
      });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: (id: string) => companyApi.deleteCompany(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.removeQueries({ queryKey: ["company", id] });
      toast.success("Company deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to delete company",
      });
    },
  });

  return {
    // Queries
    useCompaniesQuery,
    useCompanyQuery,
    useCompaniesByIndustryQuery,
    useCompanyStatsQuery,
    useTopRatedCompaniesQuery,
    useRecentCompaniesQuery,

    // Mutations
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
