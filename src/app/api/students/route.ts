import { NextRequest, NextResponse } from "next/server";
import { toCamelCase } from "@/helpers/transformers";
import { requireAdmin } from "@/lib/services/auth/auth-guards.service";
import { getStudentsForCurrentCollegeAdmin } from "@/lib/services/students";
import { createClient } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/server";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const supabase = await createClient();

    const { user } = await requireAdmin(supabase);

    const students = await getStudentsForCurrentCollegeAdmin(supabase, user.id);

    return NextResponse.json(
      {
        success: true,
        data: toCamelCase(students),
      },
      { status: 200 }
    );
  });
}
