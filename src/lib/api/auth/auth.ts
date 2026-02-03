import { AUTH_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpPost } from "@/lib/api/http";
import { Camelize } from "@/types";
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
    data: VerifyCollegeRequest,
  ): Promise<Camelize<VerifyCollegeResponse>> => {
    const response = await httpPost<
      Camelize<VerifyCollegeResponse>,
      VerifyCollegeRequest
    >(AUTH_ENDPOINTS.VERIFY_COLLEGE, data);

    return response;
  },

  /**
   * Sign up with email and password
   * Validates college email domain before creating account
   */
  signupWithEmail: async (
    data: SignupRequest,
  ): Promise<Camelize<SignupResponse>> => {
    const response = await httpPost<Camelize<SignupResponse>, SignupRequest>(
      AUTH_ENDPOINTS.SIGNUP(data.redirectUrl),
      data,
    );

    return response;
  },
};
