import { requireAdmin } from "@/lib/services/auth/auth-guards.service";
import { getStudentsForCurrentCollegeAdmin } from "@/lib/services/students/student.service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const auth = await requireAdmin(supabase);
  if (auth.error) return auth.error;

  const { user } = auth;

  try {
    const students = await getStudentsForCurrentCollegeAdmin(
      supabase,
      user!.id
    );
    
    return NextResponse.json(
      { success: true, data: students },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error in GET /api/students:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Failed to load students" },
      { status: 500 }
    );
  }
}
