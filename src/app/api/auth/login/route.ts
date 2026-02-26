import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * TEMPORARY API for Postman testing to simplify login flow.
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Validate input
    const validated = LoginSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const supabase = await createClient();

    // 2. Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    // 3. Return session data
    // Auth cookies are automatically set by the server client (middleware handles refresh)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
