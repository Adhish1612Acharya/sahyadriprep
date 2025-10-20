import { NextRequest, NextResponse } from "next/server";
import { validatePDF } from "@/helpers/validation/validatePdf.helpers";
import { createInterviewExperienceSchema } from "@/schema/create-interview-experience.schema";
import { saveUploadedFile, cleanupTempFiles } from "@/helpers/file.helpers";
import { uploadInterviewExperiencePDF } from "@/lib/cloudinary/upload";
import { UPLOAD_DIRECTORIES } from "@/constants/upload-directories.constants";
import { createClient } from "@/lib/supabase/server";
import doc_loader from "@/lib/rag-chatbot/load-doc";
import create_doc_chunk from "@/lib/rag-chatbot/create-doc-chunk";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";

/**
 * POST /api/interview-experiences
 * Create a new interview experience (Admin upload)
 */
export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    console.log("🚀 Starting interview experience upload...");

    const supabase = await createClient();

    // ✅ Step 1: Parse FormData
    const formData = await request.formData();
    const file = formData.get("document") as File | null;

    // ✅ Step 2: Validate file exists and is PDF
    if (!file) {
      return NextResponse.json(
        { error: "Document file is required" },
        { status: 400 }
      );
    }

    const fileValidation = validatePDF(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    console.log(
      `📄 Received PDF: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
    );

    // ✅ Step 3: Save file temporarily
    const tempFilePath = await saveUploadedFile(file, {
      subdirectory: UPLOAD_DIRECTORIES.INTERVIEW_EXPERIENCES,
    });
    tempFiles.push(tempFilePath);
    console.log(`💾 Saved to temp: ${tempFilePath}`);

    // ✅ Step 4: Validate form data with Zod
    const rawData = {
      student_name: formData.get("studentName") as string | null,
      college_id: formData.get("college_id") as string,
      batch: formData.get("batch") as string,
      placed_year: formData.get("placedYear")
        ? parseInt(formData.get("placedYear") as string)
        : undefined,
      company_id: formData.get("company_id") as string,
      source: "admin_upload",
      //   position: formData.get("position") as string | null,
      //   experienceText: formData.get("experienceText") as string | null,
      //   result: formData.get("result") as string | null,
      //   salaryOffered: formData.get("salaryOffered")
      //     ? parseFloat(formData.get("salaryOffered") as string)
      //     : undefined,
    };

    const validationResult = createInterviewExperienceSchema.safeParse(rawData);

    if (!validationResult.success) {
      await cleanupTempFiles(tempFiles);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    console.log("✅ Validation passed");

    // ✅ Step 5: Process PDF (Load, Chunk, Embed)
    console.log("📖 Loading PDF content...");
    const documentContent = await doc_loader(tempFilePath);

    console.log("✂️ Chunking document...");
    const chunks = await create_doc_chunk(documentContent);
    console.log(`   Created ${chunks.length} chunks`);

    console.log("🧠 Generating embeddings...");
    const documentEmbeddings = await embeddings.embedDocuments(chunks);
    console.log(`   Generated ${documentEmbeddings.length} embeddings`);

    const { data: company_data } = await supabase
      .from("companies")
      .select("name")
      .eq("id", validatedData.company_id)
      .single();

    // ✅ Step 6: Upload to Cloudinary
    console.log("☁️ Uploading to Cloudinary...");
    const cloudinaryResult = await uploadInterviewExperiencePDF(tempFilePath, {
      student_name: validatedData.student_name,
      company_name: company_data?.name || "unknown_company",
      batch: validatedData.batch,
    });

    if (!cloudinaryResult.success) {
      throw new Error(`Cloudinary upload failed: ${cloudinaryResult.error}`);
    }

    console.log(`   ✅ Uploaded: ${cloudinaryResult.secureUrl}`);

    // ✅ Step 7: Get current user (for created_by)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ✅ Step 8: Create media record
    console.log("💿 Creating media record...");
    const { data: media_data, error: media_error } = await supabase
      .from("media")
      .insert({
        url: cloudinaryResult.secureUrl!,
        public_id: cloudinaryResult.publicId!,
        file_name: file.name,
        file_type: cloudinaryResult.format,
        file_size: cloudinaryResult.bytes,
        uploaded_by: user?.id,
      })
      .select("id")
      .single();

    if (media_error) throw media_error;
    const media_id = media_data.id;
    console.log(`   Media created: ${media_id}`);

    // ✅ Step 9: Create interview experience record
    console.log("📝 Creating interview experience...");
    const { data: experienceData, error: experienceError } = await supabase
      .from("interview_experiences")
      .insert({
        student_id: null,
        student_name: validatedData.student_name || null,
        college_id: validatedData.college_id,
        company_id: validatedData.company_id,
        batch: validatedData.batch,
        placed_year: validatedData.placed_year,
        media_id: media_id,
        source: "admin_upload",
        created_by: user?.id,
      })
      .select("id")
      .single();

    if (experienceError) throw experienceError;
    const experience_id = experienceData.id;
    console.log(`   Experience created: ${experience_id}`);

    // ✅ Step 10: Store embeddings in vector DB
    console.log("🗄️ Storing embeddings in vector DB...");
    const chunksToInsert = chunks.map((chunk, index) => ({
      content: chunk,
      content_type: "interview_experience",
      embedding: documentEmbeddings[index],
      chunk_index: index,
      token_count: chunk.split(" ").length,
      metadata: {
        total_document_chunks_count: chunks.length,
        interview_experience_id: experience_id,
        media_id: media_id,
        document_title: file.name,
        student_name: validatedData.student_name,
        company_id: validatedData.company_id,
        college_id: validatedData.college_id,
        batch: validatedData.batch,
        // position: validatedData.position,
      },
    }));

    const { error: chunksError } = await supabase
      .from("content_chunks")
      .insert(chunksToInsert);

    if (chunksError) throw chunksError;
    console.log(`   ✅ Stored ${chunksToInsert.length} chunks`);

    // ✅ Step 11: Cleanup temp files
    await cleanupTempFiles(tempFiles);
    console.log("🗑️ Cleaned up temp files");

    // ✅ Success response
    return NextResponse.json(
      {
        success: true,
        message: "Interview experience created successfully",
        data: {
          experience_id,
          media_id,
          college_id: validatedData.college_id,
          company_id: validatedData.company_id,
          chunksStored: chunks.length,
          cloudinaryUrl: cloudinaryResult.secureUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Error creating interview experience:", error);

    // Cleanup temp files on error
    await cleanupTempFiles(tempFiles);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Failed to create interview experience";
    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: message,
        details: process.env.NODE_ENV === "development" ? stack : undefined,
      },
      { status: 500 }
    );
  }
}
