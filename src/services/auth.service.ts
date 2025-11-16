import { AUTH_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { axiosClient } from "@/lib/axiosClient";
import {
  SignupRequest,
  SignupResponse,
  VerifyCollegeRequest,
  VerifyCollegeResponse,
} from "@/types/services/auth.types";

const authService = {
  /**
   * Verify if user's email is allowed for the selected college
   * Used after OAuth sign-in
   */
  verifyCollegeEmail: async (
    data: VerifyCollegeRequest
  ): Promise<VerifyCollegeResponse> => {
    try {
      const response = await axiosClient.post<VerifyCollegeResponse>(
        AUTH_ENDPOINTS.VERIFY_COLLEGE,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to verify college email");
    }
  },

  /**
   * Sign up with email and password
   * Validates college email domain before creating account
   */
  signupWithEmail: async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      const response = await axiosClient.post<SignupResponse>(
        AUTH_ENDPOINTS.SIGNUP(data.redirectUrl),
        data
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign up");
    }
  },
};

export default authService;
