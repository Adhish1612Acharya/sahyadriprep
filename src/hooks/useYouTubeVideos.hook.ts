import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateYouTubeVideoInput,
  ProcessVideoInput,
} from "@/types/services/interview-youtube-video.types";
import { youtubeService } from "@/services/interview-youtube-video.service";
// import { useToast } from "@/hooks/use-toast";

export const useInterviewYouTubeVideos = () => {
  const queryClient = useQueryClient();
  //   const { toast } = useToast();

  // ============================================
  // QUERIES
  // ============================================

  const videosQuery = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: () => youtubeService.getAllVideos(),
    staleTime: 5 * 60 * 1000,
  });

  const useVideosByCompanyQuery = (companyId: string | null) =>
    useQuery({
      queryKey: ["youtube-videos", "company", companyId],
      queryFn: () => youtubeService.getAllVideos({ company_id: companyId! }),
      enabled: !!companyId,
      staleTime: 5 * 60 * 1000,
    });

  const useVideosByCollegeQuery = (collegeId: string | null) =>
    useQuery({
      queryKey: ["youtube-videos", "college", collegeId],
      queryFn: () => youtubeService.getAllVideos({ college_id: collegeId! }),
      enabled: !!collegeId,
      staleTime: 5 * 60 * 1000,
    });

  const useVideoQuery = (id: string | null) =>
    useQuery({
      queryKey: ["youtube-video", id],
      queryFn: () => youtubeService.getVideoById(id!),
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
      queryFn: () => youtubeService.getAIContent(id!),
      enabled: !!id && enabled, // ✅ Only run if id exists AND enabled is true
      staleTime: 5 * 60 * 1000,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  const createVideo = useMutation({
    mutationFn: (data: CreateYouTubeVideoInput) =>
      youtubeService.createVideo(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
      //   toast({
      //     title: "✅ Success",
      //     description: `Video "${data.title}" added successfully`,
      //   });
    },
    onError: (error: Error) => {
      //   toast({
      //     title: "❌ Error",
      //     description: error.message || "Failed to add video",
      //     variant: "destructive",
      //   });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: (id: string) => youtubeService.deleteVideo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
      queryClient.removeQueries({ queryKey: ["youtube-video", id] });
      //   toast({
      //     title: "✅ Success",
      //     description: "Video deleted successfully",
      //   });
    },
    onError: (error: Error) => {
      //   toast({
      //     title: "❌ Error",
      //     description: error.message || "Failed to delete video",
      //     variant: "destructive",
      //   });
    },
  });

  // ============================================
  // AI PROCESSING MUTATION
  // ============================================

  const processVideo = useMutation({
    mutationFn: async (input: { id: string } & ProcessVideoInput) => {
      return youtubeService.processVideo(input.id, {
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

      console.log("✅ Video processed successfully:", {
        transcript_length: data.transcript.text.length,
        segments: data.segments.length,
        flashcards: data.flashcards.length,
        tips: data.tips.length,
      });

      //   toast({
      //     title: "✅ Success",
      //     description: "Video processed successfully with AI!",
      //   });
    },
    onError: (error: Error) => {
      console.error("❌ Error processing video:", error);

      //   toast({
      //     title: "❌ Error",
      //     description: error.message || "Failed to process video",
      //     variant: "destructive",
      //   });
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
