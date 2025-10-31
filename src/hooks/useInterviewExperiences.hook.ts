import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { interviewExperienceService } from "@/services/interview-experience.service";

import { CreateInterviewExperienceInput } from "@/types/services/interview-experience.types";

export const useInterviewExperiences = () => {
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Fetch all interview experiences
   */
  const useExperiencesQuery = () =>
    useQuery({
      queryKey: ["interview-experiences"],
      queryFn: () => interviewExperienceService.getAll(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  /**
   * Fetch single interview experience by ID
   */
  const useExperienceQuery = (id: string | null) =>
    useQuery({
      queryKey: ["interview-experience", id],
      queryFn: () => interviewExperienceService.getById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

  /**
   * Fetch interview experiences by company
   */
  const useExperiencesByCompanyQuery = (companyId: string | null) =>
    useQuery({
      queryKey: ["interview-experiences", "company", companyId],
      queryFn: () => interviewExperienceService.getByCompany(companyId!),
      enabled: !!companyId,
      staleTime: 5 * 60 * 1000,
    });

  /**
   * Fetch interview experiences by college
   */
  const useExperiencesByCollegeQuery = (collegeId: string | null) =>
    useQuery({
      queryKey: ["interview-experiences", "college", collegeId],
      queryFn: () => interviewExperienceService.getByCollege(collegeId!),
      enabled: !!collegeId,
      staleTime: 5 * 60 * 1000,
    });

  /**
   * Fetch interview experiences by batch
   */
  const useExperiencesByBatchQuery = (batch: string | null) =>
    useQuery({
      queryKey: ["interview-experiences", "batch", batch],
      queryFn: () => interviewExperienceService.getByBatch(batch!),
      enabled: !!batch,
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Create new interview experience
   */
  const createExperience = useMutation({
    mutationFn: (input: CreateInterviewExperienceInput) =>
      interviewExperienceService.create(input),
    onSuccess: () => {
      // Invalidate all experience queries to refetch
      queryClient.invalidateQueries({
        queryKey: ["interview-experiences"],
      });

      console.log("✅ Interview experience created successfully");
    },
    onError: (error: Error) => {
      console.error("❌ Error creating interview experience:", error);
    },
  });

  /**
   * Delete interview experience
   */
  const deleteExperience = useMutation({
    mutationFn: (id: string) => interviewExperienceService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.invalidateQueries({
        queryKey: ["interview-experiences"],
      });
      queryClient.removeQueries({
        queryKey: ["interview-experience", deletedId],
      });

      console.log("✅ Interview experience deleted successfully");
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting interview experience:", error);
    },
  });

  return {
    // Queries
    useExperiencesQuery,
    useExperienceQuery,
    useExperiencesByCompanyQuery,
    useExperiencesByCollegeQuery,
    useExperiencesByBatchQuery,

    // Mutations
    createExperience,
    deleteExperience,
  };
};
