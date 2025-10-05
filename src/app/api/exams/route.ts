import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Get all exams
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch exams", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    console.error("Unexpected error in GET /api/exams");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ Create a new exam
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

    const { exam_name } = requestBody;

    // Validate required fields
    if (!exam_name) {
      return NextResponse.json(
        {
          error: "Missing required field",
          required: ["exam_name"],
        },
        { status: 400 }
      );
    }

    // Validate data type
    if (typeof exam_name !== "string") {
      return NextResponse.json(
        { error: "exam_name must be a string" },
        { status: 400 }
      );
    }

    // Validate exam name length
    if (exam_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Exam name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Insert new exam
    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          exam_name: exam_name.trim(),
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
          { error: "Exam with this name already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create exam", details: error.message },
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
