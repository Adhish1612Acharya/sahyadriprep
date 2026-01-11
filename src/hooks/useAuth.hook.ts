import { useMutation } from "@tanstack/react-query";
import {
  VerifyCollegeRequest,
  SignupRequest,
} from "@/types/services/auth.types";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authApi } from "@/lib/api/auth";

export const useAuthService = () => {
  const router = useRouter();

  // ============================================
  // MUTATIONS
  // ============================================

  const verifyCollegeEmail = useMutation({
    mutationFn: (data: VerifyCollegeRequest) =>
      authApi.verifyCollegeEmail(data),
    onSuccess: (data) => {
      console.log("✅ College email verified:");
    },
    onError: async (error: Error) => {
      console.error("❌ College email verification failed:", error);
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
   * Accepts redirectUrl for post-signup navigation
   */
  const signupWithEmail = useMutation({
    mutationFn: (data: SignupRequest & { redirectUrl?: string }) =>
      authApi.signupWithEmail(data),
    onSuccess: (data, variables) => {
      // Redirect to login with redirect param if present
      // if (variables.redirectUrl) {
      //   router.push(
      //     `/auth/login?redirect=${encodeURIComponent(
      //       variables.redirectUrl
      //     )}&success=account_created`
      //   );
      // } else {
      //   router.push("/auth/login?success=account_created");
      // }
    },
    onError: (error: Error) => {
      console.error("❌ Sign up failed:", error);
    },
  });

  /**
   * Google login/signup with redirect
   */
  const signInWithGoogle = async ({
    redirectUrl,
  }: {
    redirectUrl?: string;
  }) => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          window.location.origin
        }/auth/callback?redirect=${encodeURIComponent(redirectUrl || "/")}`,
      },
    });
  };

  return {
    verifyCollegeEmail,
    signupWithEmail,
    signInWithGoogle,
  };
};
