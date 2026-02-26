import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  learningResourceApi,
  DirectMediaUploadInput,
} from "@/lib/api/learning-resource";
import { LearningResourceCreateInput } from "@/lib/zod";
import { toast } from "sonner";

const QUERY_KEY = "learning-resources";

export const useLearningResources = (collectionId?: string) => {
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Fetch all resources for a given collection.
   * Only runs when collectionId is provided.
   */
  const useResourcesQuery = () =>
    useQuery({
      queryKey: [QUERY_KEY, collectionId],
      queryFn: () => learningResourceApi.fetchResourcesByCollection(collectionId!),
      enabled: !!collectionId,
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Create a new resource registry entry (metadata, no file).
   */
  const createResourceMutation = useMutation({
    mutationFn: (input: LearningResourceCreateInput) =>
      learningResourceApi.createResource(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, collectionId] });
      toast.success("Resource created successfully");
    },
    onError: (error: Error) => {
      console.error("❌ Error creating resource:", error);
      toast.error(error.message || "Failed to create resource");
    },
  });

  /**
   * Upload a direct media file and attach it to a resource.
   * On success the resource is automatically marked as publishable.
   */
  const uploadDirectMediaMutation = useMutation({
    mutationFn: (input: DirectMediaUploadInput) =>
      learningResourceApi.uploadDirectMedia(input),
    onSuccess: (result) => {
      // Invalidate both the collection's resource list and any per-resource cache
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, collectionId] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, result.resource.id],
      });
      toast.success("Media uploaded and resource is now publishable");
    },
    onError: (error: Error) => {
      console.error("❌ Error uploading direct media:", error);
      toast.error(error.message || "Failed to upload media");
    },
  });

  return {
    // Queries
    useResourcesQuery,

    // Mutations
    createResourceMutation,
    uploadDirectMediaMutation,
  };
};
