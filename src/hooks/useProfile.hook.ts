import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import {
  StudentProfileUpdate,
  CollegeAdminProfileUpdate,
  SuperAdminProfileUpdate,
} from "@/lib/validations/profile.schema";
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
      // toast({
      //   title: "✅ Profile Updated",
      //   description: "Your profile has been updated successfully",
      // });
      console.log("✅ Student profile updated");
    },
    onError: (error: Error) => {
        // toast({
        //   title: "❌ Update Failed",
        //   description: error.message || "Failed to update profile",
        //   variant: "destructive",
        // });
      console.error("❌ Error updating student profile:", error);
    },
  });

  const updateCollegeAdminProfile = useMutation({
    mutationFn: (data: CollegeAdminProfileUpdate) =>
      profileService.updateCollegeAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      // toast({
      //   title: "✅ Profile Updated",
      //   description: "Your profile has been updated successfully",
      // });
      console.log("✅ College admin profile updated");
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Update Failed",
      //   description: error.message || "Failed to update profile",
      //   variant: "destructive",
      // });
      console.error("❌ Error updating admin profile:", error);
    },
  });

  const updateSuperAdminProfile = useMutation({
    mutationFn: (data: SuperAdminProfileUpdate) =>
      profileService.updateSuperAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      // toast({
      //   title: "✅ Profile Updated",
      //   description: "Your profile has been updated successfully",
      // });
      console.log("✅ Super admin profile updated");
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Update Failed",
      //   description: error.message || "Failed to update profile",
      //   variant: "destructive",
      // });
      console.error("❌ Error updating super admin profile:", error);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      // toast({
      //   title: "✅ Avatar Uploaded",
      //   description: "Your profile picture has been updated",
      // });
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Upload Failed",
      //   description: error.message || "Failed to upload avatar",
      //   variant: "destructive",
      // });
    },
  });

  const uploadResume = useMutation({
    mutationFn: (file: File) => profileService.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      // toast({
      //   title: "✅ Resume Uploaded",
      //   description: "Your resume has been uploaded successfully",
      // });
    },
    onError: (error: Error) => {
      // toast({
      //   title: "❌ Upload Failed",
      //     description: error.message || "Failed to upload resume",
      //   variant: "destructive",
      // });
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
