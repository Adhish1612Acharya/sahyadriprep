import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Get all modules or modules filtered by subject_id
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subject_id");

    let query = supabase
      .from("modules")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by subject_id if provided
    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch modules", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    console.error("Unexpected error in GET /api/modules");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ Create a new module
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { subject_id, module_name } = requestBody;

    // Validate required fields
    if (!subject_id || !module_name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["subject_id", "module_name"],
        },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof subject_id !== "string" || typeof module_name !== "string") {
      return NextResponse.json(
        { error: "subject_id and module_name must be strings" },
        { status: 400 }
      );
    }

    // Validate module name length
    if (module_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Module name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Check if subject exists
    const { error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subject_id)
      .single();

    if (subjectError && subjectError.code === "PGRST116") {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (subjectError) {
      console.error("Subject verification error:", subjectError);
      return NextResponse.json(
        { error: "Failed to verify subject" },
        { status: 500 }
      );
    }

    // Insert new module
    const { data, error } = await supabase
      .from("modules")
      .insert([
        {
          subject_id,
          module_name: module_name.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // Handle specific database errors
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "Module with this name already exists for this subject" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create module", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
