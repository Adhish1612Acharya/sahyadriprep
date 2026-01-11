import { AUTH_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpPost } from "@/lib/api/http";
import {
  SignupRequest,
  SignupResponse,
  VerifyCollegeRequest,
  VerifyCollegeResponse,
} from "@/types/services/auth.types";

export const authApi = {
  /**
   * Verify if user's email is allowed for the selected college
   * Used after OAuth sign-in
   */
  verifyCollegeEmail: async (
    data: VerifyCollegeRequest
  ): Promise<VerifyCollegeResponse> => {
    const response = await httpPost<VerifyCollegeResponse, VerifyCollegeRequest>(
      AUTH_ENDPOINTS.VERIFY_COLLEGE,
      data
    );

    return response;
  },

  /**
   * Sign up with email and password
   * Validates college email domain before creating account
   */
  signupWithEmail: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await httpPost<SignupResponse, SignupRequest>(
      AUTH_ENDPOINTS.SIGNUP(data.redirectUrl),
      data
    );

    return response;
  },
};
