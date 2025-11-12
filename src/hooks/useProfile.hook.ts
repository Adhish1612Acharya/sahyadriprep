import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import {
  StudentProfileUpdate,
  CollegeAdminProfileUpdate,
  SuperAdminProfileUpdate,
} from "@/lib/validations/profile.schema";
import { toast } from "sonner";
// import { useToast } from "@/hooks/use-toast";

export const useProfile = () => {
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  // ============================================
  // QUERIES
  // ============================================

  const useProfileQuery = () =>
    useQuery({
      queryKey: ["profile", "me"],
      queryFn: () => profileService.getMyProfile(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    });

  // ============================================
  // MUTATIONS
  // ============================================

  const updateStudentProfile = useMutation({
    mutationFn: (data: StudentProfileUpdate) =>
      profileService.updateStudentProfile(data),
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
      profileService.updateCollegeAdminProfile(data),
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
      profileService.updateSuperAdminProfile(data),
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
    mutationFn: (file: File) => profileService.uploadAvatar(file),
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
    mutationFn: (file: File) => profileService.uploadResume(file),
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
    // Queries
    useProfileQuery,

    // Mutations
    updateStudentProfile,
    updateCollegeAdminProfile,
    updateSuperAdminProfile,
    uploadAvatar,
    uploadResume,
  };
};
