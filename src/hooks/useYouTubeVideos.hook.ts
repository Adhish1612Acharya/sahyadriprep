import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateYouTubeVideoInput,
  ProcessVideoInput,
} from "@/types/services/interview-youtube-video.types";
import { toast } from "sonner";
import { interviewSessionApi } from "@/lib/api/interview-session";

export const useInterviewYouTubeVideos = () => {
  const queryClient = useQueryClient();

  // ============================================
  // QUERIES
  // ============================================

  const videosQuery = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: () => interviewSessionApi.getAllVideos(),
    staleTime: 5 * 60 * 1000,
  });

  const useVideosByCompanyQuery = (companyId: string | null) =>
    useQuery({
      queryKey: ["youtube-videos", "company", companyId],
      queryFn: () =>
        interviewSessionApi.getAllVideos({ company_id: companyId! }),
      enabled: !!companyId,
      staleTime: 5 * 60 * 1000,
    });

  const useVideosByCollegeQuery = (collegeId: string | null) =>
    useQuery({
      queryKey: ["youtube-videos", "college", collegeId],
      queryFn: () =>
        interviewSessionApi.getAllVideos({ college_id: collegeId! }),
      enabled: !!collegeId,
      staleTime: 5 * 60 * 1000,
    });

  const useVideoQuery = (id: string | null) =>
    useQuery({
      queryKey: ["youtube-video", id],
      queryFn: () => interviewSessionApi.getVideoById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // NEW: Query to fetch AI-generated content for a video
  // Calls GET /interview-experiences/youtube-videos/:id/ai
  // ============================================
  const useAIContentQuery = (id: string | null, enabled: boolean = true) =>
    useQuery({
      queryKey: ["youtube-video-ai", id],
      queryFn: () => interviewSessionApi.getAIContent(id!),
      enabled: !!id && enabled, // ✅ Only run if id exists AND enabled is true
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  const createVideo = useMutation({
    mutationFn: (data: CreateYouTubeVideoInput) =>
      interviewSessionApi.createVideo(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
      toast("Video Added", {
        description: `YouTube video "${data.title}" has been added successfully`,
      });
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to add YouTube video",
      });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: (id: string) => interviewSessionApi.deleteVideo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
      queryClient.removeQueries({ queryKey: ["youtube-video", id] });
      toast("Video Deleted", {
        description: "YouTube video has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to delete YouTube video",
      });
    },
  });

  // ============================================
  // AI PROCESSING MUTATION
  // ============================================

  const processVideo = useMutation({
    mutationFn: async (input: { id: string } & ProcessVideoInput) => {
      return interviewSessionApi.processVideo(input.id, {
        video_id: input.video_id,
        title: input.title,
        description: input.description,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate video query to refetch with updated data
      queryClient.invalidateQueries({
        queryKey: ["youtube-video", variables.id],
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error processing video:", error);
    },
  });

  return {
    // Queries
    videosQuery,
    useVideoQuery,
    useVideosByCompanyQuery,
    useVideosByCollegeQuery,
    useAIContentQuery,

    // Mutations
    createVideo,
    deleteVideo,
    processVideo,
  };
};
