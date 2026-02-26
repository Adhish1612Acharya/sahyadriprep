import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { learningCollectionApi } from "@/lib/api/learning-collection";
import { LearningCollectionCreateInput } from "@/lib/zod";
import { toast } from "sonner";

const QUERY_KEY = "learning-collections";

export const useLearningCollections = () => {
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Fetch all collections owned by the authenticated user.
   */
  const useCollectionsQuery = () =>
    useQuery({
      queryKey: [QUERY_KEY],
      queryFn: () => learningCollectionApi.getAll(),
      staleTime: 5 * 60 * 1000, // 5 min
    });

  /**
   * Fetch a single collection by ID.
   */
  const useCollectionQuery = (id: string | null) =>
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => learningCollectionApi.getById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Create a new learning collection.
   */
  const createCollectionMutation = useMutation({
    mutationFn: (input: LearningCollectionCreateInput) =>
      learningCollectionApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Collection created successfully");
    },
    onError: (error: Error) => {
      console.error("❌ Error creating learning collection:", error);
      toast.error(error.message || "Failed to create collection");
    },
  });

  /**
   * Delete a learning collection by ID.
   */
  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => learningCollectionApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [QUERY_KEY, deletedId] });
      toast.success("Collection deleted successfully");
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting learning collection:", error);
      toast.error(error.message || "Failed to delete collection");
    },
  });

  /**
   * Publish a learning collection.
   */
  const publishCollectionMutation = useMutation({
    mutationFn: (id: string) => learningCollectionApi.publish(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      toast.success("Collection published successfully");
    },
    onError: (error: Error) => {
      console.error("❌ Error publishing learning collection:", error);
      toast.error(error.message || "Failed to publish collection");
    },
  });

  return {
    // Queries (call inside component body to satisfy Rules of Hooks)
    useCollectionsQuery,
    useCollectionQuery,

    // Mutations (stable references — safe to destructure at top level)
    createCollectionMutation,
    deleteCollectionMutation,
    publishCollectionMutation,
  };
};
