import { NextRequest, NextResponse } from "next/server";
import { createAuthUser } from "@/lib/services/auth/auth-user-lifecycle.service";
import { z } from "zod";
import { enforceCollegeEmailOrReject } from "@/lib/services/auth/auth-college.service";
import { createClient } from "@/lib/supabase/server";
import { validatePassword } from "@/helpers/validation/validate-password";

// ✅ Email + Role validation
const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["student", "college_admin"]),
  college_id: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    const redirect = request.nextUrl.searchParams.get("redirect");

    console.log(
      "🚀 Signup request received for email:",
      body.email,
      "with redirect:",
      redirect
    );

    // ✅ Basic validation
    if (!parsed.success) {
      const errors = parsed.error.format();

      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: {
            email: errors.email?._errors?.[0],
            password: errors.password?._errors?.[0],
            role: errors.role?._errors?.[0],
          },
        },
        { status: 400 }
      );
    }

    const { email, password, role, college_id } = parsed.data;

    // ✅ Validate password using helper
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Password does not meet requirements",
          details: {
            password: passwordValidation.errors[0], // First error
            allErrors: passwordValidation.errors,
          },
          passwordRequirements: {
            minLength: "At least 8 characters",
            lowercase: "One lowercase letter (a-z)",
            uppercase: "One uppercase letter (A-Z)",
            digit: "One digit (0-9)",
            symbol: "One symbol (!@#$%^&*)",
          },
          unmetRequirements: {
            minLength: !passwordValidation.requirements.minLength,
            lowercase: !passwordValidation.requirements.hasLowercase,
            uppercase: !passwordValidation.requirements.hasUppercase,
            digit: !passwordValidation.requirements.hasDigit,
            symbol: !passwordValidation.requirements.hasSymbol,
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // ✅ Step 1: Validate email domain
    if (role === "student") {
      const rejectResponse = await enforceCollegeEmailOrReject(
        supabase,
        email,
        college_id
      );
      if (rejectResponse) return rejectResponse;
    }

    // ✅ Step 2: Create user
    // const result = await createUserWithProfile({
    //   email,
    //   password,
    //   role,
    //   college_id,
    //   email_confirm: false, // Auto-confirm email
    // });

    const result = await createAuthUser(supabase, {
      email,
      password,
      role,
      college_id,
      email_confirm: false,
      redirectUrl: redirect || undefined,
    });

    if (!result.success) {
      console.error("❌ Signup failed:", result.error);

      // Handle specific error cases
      const errorMsg = result.error?.message || result.error;

      if (
        errorMsg?.toLowerCase().includes("already registered") ||
        errorMsg?.toLowerCase().includes("duplicate key") ||
        errorMsg?.toLowerCase().includes("user already exists")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Email already registered",
            details: "This email is already associated with an account",
          },
          { status: 409 }
        );
      }

      if (
        errorMsg?.toLowerCase().includes("password") ||
        errorMsg?.toLowerCase().includes("invalid password")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid password",
            details: errorMsg,
          },
          { status: 400 }
        );
      }

      // Handle invalid email domain
      if (
        errorMsg?.toLowerCase().includes("invalidemaildomain") ||
        errorMsg?.toLowerCase().includes("invalid email domain")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email domain",
            details: "Please sign up with your college email",
          },
          { status: 403 }
        );
      }

      // Default error response
      return NextResponse.json(
        {
          success: false,
          error: "Signup failed",
          details: errorMsg,
        },
        { status: 500 }
      );
    }

    // ✅ Step 3: Return success
    return NextResponse.json(
      {
        success: true,
        message:
          "Account created! Please check your email to confirm your account.",
        user: result.user,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Unexpected signup error:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? e.message : undefined,
      },
      { status: 500 }
    );
  }
}
