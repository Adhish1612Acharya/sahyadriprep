import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StudentProfileUpdate,
  CollegeAdminProfileUpdate,
  SuperAdminProfileUpdate,
} from "@/lib/zod/schema/profile.schema";
import { toast } from "sonner";
import { profileApi } from "@/lib/api/profile";
// import { useToast } from "@/hooks/use-toast";

// ============================================
// QUERIES
// ============================================

export const useProfileQuery = () =>
  useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileApi.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

export const useProfile = () => {
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  // ============================================
  // MUTATIONS
  // ============================================

  const updateStudentProfile = useMutation({
    mutationFn: (data: StudentProfileUpdate) =>
      profileApi.updateStudentProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast("Profile Updated", {
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update profile",
      });
      console.error("❌ Error updating student profile:", error);
    },
  });

  const updateCollegeAdminProfile = useMutation({
    mutationFn: (data: CollegeAdminProfileUpdate) =>
      profileApi.updateCollegeAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast("Profile Updated", {
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update profile",
      });
    },
  });

  const updateSuperAdminProfile = useMutation({
    mutationFn: (data: SuperAdminProfileUpdate) =>
      profileApi.updateSuperAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast("Profile Updated", {
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update profile",
      });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast("Avatar Uploaded", {
        description: "Your profile picture has been updated",
      });
    },
    onError: (error: Error) => {
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload avatar",
      });
    },
  });

  const uploadResume = useMutation({
    mutationFn: (file: File) => profileApi.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast("Resume Uploaded", {
        description: "Your resume has been uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload resume",
      });
    },
  });

  return {
    // Mutations
    updateStudentProfile,
    updateCollegeAdminProfile,
    updateSuperAdminProfile,
    uploadAvatar,
    uploadResume,
  };
};
