import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Fetch all subjects
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subjects", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ Create a new subject
export async function POST(req: Request) {
  try {
    const supabase = await createClient(); // Fresh instance per request

    const { subject_code, subject_name, academic_year, engineering_year } =
      await req.json();

    // Validate required fields
    if (!subject_code || !subject_name || !academic_year || !engineering_year) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: [
            "subject_code",
            "subject_name",
            "academic_year",
            "engineering_year",
          ],
        },
        { status: 400 }
      );
    }

    // Validate data types
    if (
      typeof academic_year !== "number" ||
      typeof engineering_year !== "number"
    ) {
      return NextResponse.json(
        { error: "academic_year and engineering_year must be numbers" },
        { status: 400 }
      );
    }

    // Insert new subject
    const { data, error } = await supabase
      .from("subjects")
      .insert([
        {
          subject_code: subject_code.trim().toUpperCase(),
          subject_name: subject_name.trim(),
          academic_year,
          engineering_year,
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
          { error: "Subject code already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create subject", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);

    // Handle JSON parsing errors
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
