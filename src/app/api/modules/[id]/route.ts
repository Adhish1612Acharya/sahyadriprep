import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Get module by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid module ID provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("modules")
      .select(
        `
        *,
        subjects (
          id,
          subject_code,
          subject_name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);

      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { error: "Module not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch module", details: error.message },
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

// ✅ Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid module ID provided" },
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

    // Check if module exists before updating
    const { error: fetchError } = await supabase
      .from("modules")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify module existence" },
        { status: 500 }
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

    // Update the module
    const { data, error } = await supabase
      .from("modules")
      .update({
        subject_id,
        module_name: module_name.trim(),
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
          { error: "Module with this name already exists for this subject" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to update module", details: error.message },
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

// ✅ Delete module
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid module ID provided" },
        { status: 400 }
      );
    }

    // Check if module exists before deleting
    const { data: existingModule, error: fetchError } = await supabase
      .from("modules")
      .select("id, module_name")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify module existence" },
        { status: 500 }
      );
    }

    // Check for related records (optional - depends on your business logic)
    const { data: relatedResources, error: resourceCheckError } = await supabase
      .from("resources")
      .select("id")
      .eq("module_id", id)
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
          error: "Cannot delete module with existing resources",
          details: "Please delete all related resources first",
        },
        { status: 409 }
      );
    }

    // Delete the module
    const { error } = await supabase.from("modules").delete().eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete module", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Module deleted successfully",
        deleted_module: existingModule.module_name,
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
