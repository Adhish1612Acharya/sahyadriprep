import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  deleteAuthUserById,
  isEmailAllowedForCollege,
} from "@/helpers/auth.helpers";

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

    // ✅ Step 1: Exchange code for session
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL("/auth/login?error=exchange_failed", requestUrl.origin)
      );
    }

    if (data.user) {
      const user = data.user;
      const email = user.email || "";

      // ✅ Step 2: Get college_id from user metadata (stored before OAuth redirect)
      // Or default to null for Sahyadri
      const collegeId = user.user_metadata?.college_id || null;

      // ✅ Step 3: Verify email domain against college
      const isAllowed = await isEmailAllowedForCollege(email, collegeId);

      if (!isAllowed) {
        console.error(
          `❌ Email not allowed: ${email} for college: ${
            collegeId || "sahyadri"
          }`
        );

        // Delete the user from auth (cleanup)
        try {
          await deleteAuthUserById(user.id);
          console.log(`🗑️ Deleted unauthorized user: ${user.id}`);
        } catch (deleteError) {
          console.error("Failed to delete unauthorized user:", deleteError);
        }

        // Sign out the session
        await supabase.auth.signOut();

        return NextResponse.redirect(
          new URL(
            "/auth/login?error=invalid_email&message=Please use your college email",
            requestUrl.origin
          )
        );
      }

      console.log(`✅ Email verified: ${email}`);

      // ✅ Step 4: Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, profile_completed")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // ✅ Step 5: New user - create profile
        const role = user.user_metadata?.role || "student"; // Get role from metadata or default to student

        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          role: role,
          profile_completed: false,
        });

        if (profileError) {
          console.error("❌ Failed to create profile:", profileError);
          return NextResponse.redirect(
            new URL(
              "/auth/login?error=profile_creation_failed",
              requestUrl.origin
            )
          );
        }

        console.log(`✅ Profile created for user: ${user.id} (${role})`);

        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin)
        );
      }

      // ✅ Step 6: Existing user - check if profile is completed
      if (!profile.profile_completed) {
        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin)
        );
      }

      // ✅ Step 7: Profile completed - redirect based on role
      const redirectMap = {
        student: "/",
        college_admin: "/",
        super_admin: "/admin",
      };

      const redirectTo =
        redirectMap[profile.role as keyof typeof redirectMap] || "/";

      console.log(
        `✅ User logged in: ${email} (${profile.role}) → ${redirectTo}`
      );

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
