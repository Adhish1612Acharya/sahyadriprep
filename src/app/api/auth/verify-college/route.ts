import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowedForCollege } from "@/lib/services/auth/auth-college.service";
import { deleteAuthUserById } from "@/lib/services/auth/auth-user-lifecycle.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, college_id } = body as {
      user_id: string;
      college_id?: string | null;
    };

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // fetch user via admin API
    const { data: userData, error } = await supabase.auth.admin.getUserById(
      user_id
    );
    if (error || !userData.user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const email = userData.user.email || "";
    const allowed = await isEmailAllowedForCollege(
      supabase,
      email,
      college_id ?? null
    );

    if (!allowed) {
      // delete the auth user (server side)
      await deleteAuthUserById(user_id);
      return NextResponse.json(
        {
          success: false,
          error: "InvalidEmail",
          message: "OAuth email not allowed for selected college",
        },
        { status: 403 }
      );
    }

    // allowed -> respond OK (client can proceed to create profile)
    return NextResponse.json(
      { success: true, user: { id: userData.user.id, email } },
      { status: 200 }
    );
  } catch (e) {
    console.error("verify-college error", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
