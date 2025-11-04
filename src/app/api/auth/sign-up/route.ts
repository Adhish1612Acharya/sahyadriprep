import { NextRequest, NextResponse } from "next/server";
import {
  enforceCollegeEmailOrReject,
  createUserWithProfile,
} from "@/helpers/auth.helpers";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "college_admin"]),
  college_id: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("✅ Signup request received");
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password, role, college_id } = parsed.data;

    // ✅ Step 1: Validate email domain
    const rejectResponse = await enforceCollegeEmailOrReject(email, college_id);
    if (rejectResponse) return rejectResponse;

    // ✅ Step 2: Create user + profile (with automatic rollback)
    const result = await createUserWithProfile({
      email,
      password,
      role,
      college_id,
      email_confirm: true, // Auto-confirm email
    });

    if (!result.success) {
      console.error("❌ Signup failed:", result.error);

      // Handle specific error cases
      if (result.error?.includes("already registered")) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 500 }
      );
    }

    console.log(`✅ User created successfully: ${result?.user?.email}`);

    // ✅ Step 3: Return success
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please complete your profile.",
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
