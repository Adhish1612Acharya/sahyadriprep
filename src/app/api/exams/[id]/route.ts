import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Get exam by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid exam ID provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);

      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Failed to fetch exam", details: error.message },
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

// ✅ Update exam
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid exam ID provided" },
        { status: 400 }
      );
    }

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

    // Check if exam exists before updating
    const { error: fetchError } = await supabase
      .from("exams")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify exam existence" },
        { status: 500 }
      );
    }

    // Update the exam
    const { data, error } = await supabase
      .from("exams")
      .update({
        exam_name: exam_name.trim(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);

      // Handle specific database errors
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "Exam with this name already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to update exam", details: error.message },
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

// ✅ Delete exam
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid exam ID provided" },
        { status: 400 }
      );
    }

    // Check if exam exists before deleting
    const { data: existingExam, error: fetchError } = await supabase
      .from("exams")
      .select("id, exam_name")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify exam existence" },
        { status: 500 }
      );
    }

    // Check for related records (optional - depends on your business logic)
    const { data: relatedResources, error: resourceCheckError } = await supabase
      .from("resources")
      .select("id")
      .eq("exam_id", id)
      .limit(1);

    if (resourceCheckError) {
      console.error("Resource check error:", resourceCheckError);
      return NextResponse.json(
        { error: "Failed to check related records" },
        { status: 500 }
      );
    }

    if (relatedResources && relatedResources.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete exam with existing resources",
          details: "Please delete all related resources first",
        },
        { status: 409 }
      );
    }

    // Delete the exam
    const { error } = await supabase.from("exams").delete().eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete exam", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Exam deleted successfully",
        deleted_exam: existingExam.exam_name,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
