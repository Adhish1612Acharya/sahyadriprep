import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL("/auth/login?error=exchange_failed", requestUrl.origin)
      );
    }

    if (data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, profile_completed")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        // New user - create profile with default role
        await supabase.from("profiles").insert({
          id: data.user.id,
          role: "student", // Default role
          profile_completed: false,
        });

        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin)
        );
      }

      // Check if profile is completed
      if (!profile.profile_completed) {
        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin)
        );
      }

      // Redirect based on role
      const redirectMap = {
        student: "/dashboard",
        college_admin: "/college",
        super_admin: "/admin",
      };

      const redirectTo =
        redirectMap[profile.role as keyof typeof redirectMap] || "/dashboard";

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
