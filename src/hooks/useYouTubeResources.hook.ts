import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { youtubeResourceApi, CreateSegmentInput, UploadSegmentMediaInput, UploadYoutubeDirectMediaInput, CreateYouTubeMetadataInput } from "@/lib/api/youtube-resource";
import { toast } from "sonner";

const QUERY_KEY = "youtube-resources";

export const useYouTubeResources = (youtubeResourceId?: string) => {
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Fetch YouTube resource details.
   */
  const useYoutubeResourceQuery = () =>
    useQuery({
      queryKey: [QUERY_KEY, youtubeResourceId],
      queryFn: () => youtubeResourceApi.fetchResourceById(youtubeResourceId!),
      enabled: !!youtubeResourceId,
    });

  /**
   * Fetch all segments for a YouTube resource.
   */
  const useSegmentsQuery = () =>
    useQuery({
      queryKey: [QUERY_KEY, youtubeResourceId, "segments"],
      queryFn: () => youtubeResourceApi.fetchSegments(youtubeResourceId!),
      enabled: !!youtubeResourceId,
      staleTime: 5 * 1000,
    });


  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Create YouTube metadata extension.
   */
  const createMetadataMutation = (resourceId: string) => useMutation({
    mutationFn: (input: CreateYouTubeMetadataInput) =>
      youtubeResourceApi.createMetadata(resourceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-resources"] });
      toast.success("YouTube metadata linked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to link YouTube metadata");
    },
  });

  /**
   * Create a new segment.
   */
  const createSegmentMutation = useMutation({
    mutationFn: (input: CreateSegmentInput) =>
      youtubeResourceApi.createSegment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, youtubeResourceId, "segments"],
      });
      toast.success("Segment created successfully");
    },
    onError: (error: any) => {
      console.error("❌ Error creating segment:", error);
      toast.error(error.message || "Failed to create segment");
    },
  });

  /**
   * Delete a segment.
   */
  const deleteSegmentMutation = useMutation({
    mutationFn: (segmentId: string) =>
      youtubeResourceApi.deleteSegment(segmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, youtubeResourceId, "segments"],
      });
      toast.success("Segment deleted successfully");
    },
    onError: (error: any) => {
      console.error("❌ Error deleting segment:", error);
      toast.error(error.message || "Failed to delete segment");
    },
  });

  /**
   * Upload direct media for a YouTube resource.
   */
  const uploadDirectMediaMutation = useMutation({
    mutationFn: (input: UploadYoutubeDirectMediaInput) =>
      youtubeResourceApi.uploadDirectMedia(input),
    onSuccess: () => {
      // Invalidate YouTube resource details if cached separately
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, youtubeResourceId] });
      toast.success("Direct media uploaded successfully");
    },
    onError: (error: any) => {
      console.error("❌ Error uploading direct media:", error);
      toast.error(error.message || "Failed to upload direct media");
    },
  });

  /**
   * Upload media for a specific segment.
   */
  const uploadSegmentMediaMutation = useMutation({
    mutationFn: (input: UploadSegmentMediaInput) =>
      youtubeResourceApi.uploadSegmentMedia(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, youtubeResourceId, "segments"],
      });
      toast.success("Segment media uploaded successfully");
    },
    onError: (error: any) => {
      console.error("❌ Error uploading segment media:", error);
      toast.error(error.message || "Failed to upload segment media");
    },
  });

  return {
    // Queries
    useYoutubeResourceQuery,
    useSegmentsQuery,

    // Mutations
    createMetadataMutation,
    createSegmentMutation,
    deleteSegmentMutation,
    uploadDirectMediaMutation,
    uploadSegmentMediaMutation,
  };
};
