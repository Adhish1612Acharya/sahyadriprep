import { useMutation } from "@tanstack/react-query";
import {
  VerifyCollegeRequest,
  SignupRequest,
} from "@/types/services/auth.types";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { createClient } from "@/lib/supabase/client";

export const useAuthService = () => {
  const router = useRouter();

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Verify college email after OAuth sign-in
   * If invalid, signs out user and deletes auth account
   */
  const verifyCollegeEmail = useMutation({
    mutationFn: (data: VerifyCollegeRequest) =>
      authService.verifyCollegeEmail(data),
    onSuccess: (data) => {
      console.log("✅ College email verified:");
    },
    onError: async (error: Error) => {
      console.error("❌ College email verification failed:", error);

      // If email not allowed, sign out and redirect
      if (
        error.message.includes("InvalidEmail") ||
        error.message.includes("not allowed")
      ) {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login?error=invalid_college_email");
      }
    },
  });

  /**
   * Sign up with email and password
   * Validates college email domain before account creation
   */
  const signupWithEmail = useMutation({
    mutationFn: (data: SignupRequest) => authService.signupWithEmail(data),
    onSuccess: (data) => {
      // You can redirect to login or dashboard here
      router.push("/auth/login?success=account_created Verify your email");
    },
    onError: (error: Error) => {
      console.error("❌ Sign up failed:",error);
    },
  });

  return {
    // Mutations
    verifyCollegeEmail,
    signupWithEmail,
  };
};
