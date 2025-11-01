import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/company.service";
import { CompanyInput, CompanyUpdate } from "@/lib/validations/company.schema";
import { CompanyFilters } from "@/types/services/company.service";
// import { useToast } from "@/hooks/use-toast";

export const useCompanies = (filters?: CompanyFilters) => {
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  // ============================================
  // QUERIES
  // ============================================

  const useCompaniesQuery = () =>
    useQuery({
      queryKey: ["companies", filters],
      queryFn: () => companyService.getAllCompanies(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const useCompanyQuery = (id: string | null) =>
    useQuery({
      queryKey: ["company", id],
      queryFn: () => companyService.getCompanyById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

  const useCompaniesByIndustryQuery = (industry: string | null) =>
    useQuery({
      queryKey: ["companies", "industry", industry],
      queryFn: () => companyService.getCompaniesByIndustry(industry!),
      enabled: !!industry,
      staleTime: 5 * 60 * 1000,
    });

  const useCompanyStatsQuery = () =>
    useQuery({
      queryKey: ["companies", "stats"],
      queryFn: () => companyService.getCompanyStats(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });

  const useTopRatedCompaniesQuery = (limit: number = 10) =>
    useQuery({
      queryKey: ["companies", "top-rated", limit],
      queryFn: () => companyService.getTopRatedCompanies(limit),
      staleTime: 5 * 60 * 1000,
    });

  const useRecentCompaniesQuery = (days: number = 30) =>
    useQuery({
      queryKey: ["companies", "recent", days],
      queryFn: () => companyService.getRecentCompanies(days),
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  const createCompany = useMutation({
    mutationFn: (data: CompanyInput) => companyService.createCompany(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      // toast({
      //   title: "✅ Success",
      //   description: `Company "${data.name}" added successfully`,
      // });
      console.log("✅ Company created:", data.name);
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Error",
      //   description: error.message || "Failed to add company",
      //   variant: "destructive",
      // });
      console.error("❌ Error creating company:", error);
    },
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyUpdate }) =>
      companyService.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
      // toast({
      //   title: "✅ Success",
      //   description: `Company "${data.name}" updated successfully`,
      // });
      console.log("✅ Company updated:", data.name);
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Error",
      //   description: error.message || "Failed to update company",
      //   variant: "destructive",
      // });
      console.error("❌ Error updating company:", error);
    },
  });

  const deleteCompany = useMutation({
    mutationFn: (id: string) => companyService.deleteCompany(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.removeQueries({ queryKey: ["company", id] });
      // toast({
      //   title: "✅ Success",
      //   description: "Company deleted successfully",
      // });
      console.log("✅ Company deleted");
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Error",
      //   description: error.message || "Failed to delete company",
      //   variant: "destructive",
      // });
      console.error("❌ Error deleting company:", error);
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
