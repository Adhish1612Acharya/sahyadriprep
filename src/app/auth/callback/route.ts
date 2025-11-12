import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  deleteAuthUserById,
  isEmailAllowedForCollege,
  syncProfileToMetadata,
  updateUserMetadata,
} from "@/helpers/auth/auth.helpers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const error_description = requestUrl.searchParams.get("error_description");

  // ✅ Handle OAuth errors
  if (error) {
    console.error("❌ OAuth error:", error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(
        error_description || error
      )}`
    );
  }

  if (code) {
    const supabase = await createClient();

    // ✅ Step 1: Exchange code for session
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("❌ Code exchange failed:", exchangeError);
      await supabase.auth.signOut();

      return NextResponse.redirect(
        `${
          requestUrl.origin
        }/auth/login?error=auth_callback_failed&details=${encodeURIComponent(
          exchangeError.message
        )}`
      );
    }

    if (data.user) {
      const user = data.user;
      const email = user.email || "";

      // ✅ SPECIAL CASE: Password Reset Flow
      if (type === "recovery") {
        console.log(`🔑 Password recovery session created for: ${email}`);
        return NextResponse.redirect(
          new URL("/auth/reset-password", requestUrl.origin)
        );
      }

      // ✅ SPECIAL CASE: Email Confirmation Flow
      if (type === "signup" || type === "email") {
        console.log(`✅ Email confirmed for: ${email}`);

        const syncResult = await syncProfileToMetadata(user.id);
        if (!syncResult.success) {
          console.warn("⚠️ Failed to sync profile after email confirmation");
        }

        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      // ✅ NORMAL OAUTH FLOW (Google, GitHub, etc.)
      console.log(`🔄 Processing OAuth login for: ${email}`);

      const collegeId = user.user_metadata?.college_id || null;

      // ✅ Step 2: Check if user exists in profiles (could be an admin)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role,  profile_completed")
        .eq("id", user.id)
        .single();

      // ✅ Step 3: Verify email domain against college
      const isAllowed = await isEmailAllowedForCollege(email, collegeId);

      if (!isAllowed) {
        console.error(
          `❌ Email not allowed: ${email} for college: ${
            collegeId || "sahyadri"
          }`
        );

        // ✅ Check if this is an existing admin user
        if (existingProfile) {
          const isAdmin =
            existingProfile.role === "college_admin" ||
            existingProfile.role === "super_admin";

          if (isAdmin) {
            console.log(
              `⚠️ Admin user attempted OAuth login: ${email} (${existingProfile.role})`
            );

            // ✅ Don't delete admin users, just sign them out
            await supabase.auth.signOut();

            return NextResponse.redirect(
              new URL(
                "/auth/login?error=oauth_not_supported&message=Admin accounts cannot use Google login. Please use email and password.",
                requestUrl.origin
              )
            );
          }
        }

        // ✅ Not an admin - safe to delete the OAuth account
        console.log(`🗑️ Deleting unauthorized OAuth user: ${email}`);

        try {
          await deleteAuthUserById(user.id);
          console.log(`✅ Deleted unauthorized user: ${user.id}`);
        } catch (deleteError) {
          console.error("❌ Failed to delete unauthorized user:", deleteError);
        }

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
        const role = user.user_metadata?.role || "student";

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

        // ✅ Step 5.1: Sync profile to metadata cache
        const syncResult = await updateUserMetadata(user.id, {
          role: role,
          college_id: collegeId,
          profile_completed: false,
        });

        if (!syncResult.success) {
          console.warn(
            "⚠️ Failed to sync profile to metadata:",
            syncResult.error
          );
        } else {
          console.log(`✅ Profile metadata synced for user: ${user.id}`);
        }

        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin)
        );
      }

      // ✅ Step 6: Existing user - sync profile to metadata if needed
      const metadataRole = user.user_metadata?.role;
      const metadataProfileCompleted = user.user_metadata?.profile_completed;

      if (
        metadataRole !== profile.role ||
        metadataProfileCompleted !== profile.profile_completed
      ) {
        console.log(`🔄 Metadata out of sync for user ${user.id}, syncing...`);

        const syncResult = await syncProfileToMetadata(user.id);

        if (!syncResult.success) {
          console.warn(
            "⚠️ Failed to sync profile to metadata:",
            syncResult.error
          );
        } else {
          console.log(`✅ Profile metadata synced for user: ${user.id}`);
        }
      }

      // ✅ Step 7: Check if profile is completed
      if (!profile.profile_completed) {
        return NextResponse.redirect(
          new URL("/auth/complete-profile", requestUrl.origin)
        );
      }

      // ✅ Step 8: Profile completed - redirect based on role
      const redirectMap = {
        student: "/",
        college_admin: "/admin/dashboard",
        super_admin: "/admin/dashboard",
      };

      const redirectTo =
        redirectMap[profile.role as keyof typeof redirectMap] || "/";

      console.log(
        `✅ User logged in: ${email} (${profile.role}) → ${redirectTo}`
      );

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  if (token && type === "recovery") {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (error) {
        console.error("❌ Recovery verification failed:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=recovery_failed`
        );
      }

      console.log("✅ Recovery token verified");

      return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`);
    } catch (e: any) {
      console.error("❌ Unexpected error during recovery:", e);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=recovery_failed`
      );
    }
  }

  if (token && type === "signup") {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "signup",
      });

      if (error) {
        console.error("❌ Email verification failed:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=verification_failed`
        );
      }

      console.log("✅ Email verified");

      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (e: any) {
      console.error("❌ Unexpected error during verification:", e);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=verification_failed`
      );
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
