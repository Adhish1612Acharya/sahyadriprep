import { NextRequest, NextResponse } from "next/server";
import { validate_pdf } from "@/helpers/validate-pdf.helpers";
import { validate_video } from "@/helpers/validate-video.helpers";
import { createInterviewExperienceSchema } from "@/lib/validations/interview-experience.schema";
import { save_uploaded_file, cleanup_temp_files } from "@/helpers/file.helpers";
import {
  uploadInterviewExperiencePDF,
  uploadInterviewExperienceVideo,
} from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete"; // ✅ NEW
import { UPLOAD_DIRECTORIES } from "@/constants/upload-directories.constants";
import { createClient } from "@/lib/supabase/server";
import { createClient as v_createClient } from "@/lib/vector_supabase/server";
import doc_loader from "@/lib/rag-chatbot/load-doc";
import create_doc_chunk from "@/lib/rag-chatbot/create-doc-chunk";
import embeddings from "@/lib/rag-chatbot/embedding-model-config";
import createChunkSummary from "@/helpers/generate-chunk-summary";

/**
 * GET /api/interview-experiences
 * Fetch all interview experiences with optional filters
 * Query params: company_id, college_id, batch, placed_year
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching interview experiences...");

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Extract optional filters
    const company_id = searchParams.get("company_id");
    const college_id = searchParams.get("college_id");
    const batch = searchParams.get("batch");
    const placed_year = searchParams.get("placed_year");

    // Build query with filters
    let query = supabase
      .from("interview_experiences")
      .select(
        `
        *,
        company_details:company_id(id, name, logo_url, industry),
        college_details:college_id(id, name)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (company_id) {
      query = query.eq("company_id", company_id);
    }
    if (college_id) {
      query = query.eq("college_id", college_id);
    }
    if (batch) {
      query = query.eq("batch", batch);
    }
    if (placed_year) {
      query = query.eq("placed_year", parseInt(placed_year));
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to fetch interview experiences: ${error.message}`
      );
    }

    console.log(`✅ Fetched ${data.length} interview experiences`);

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
      filters: {
        company_id: company_id || null,
        college_id: college_id || null,
        batch: batch || null,
        placed_year: placed_year || null,
      },
    });
  } catch (error: unknown) {
    console.error("❌ Error fetching interview experiences:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch interview experiences";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interview-experiences
 * Create a new interview experience (Admin upload)
 */
export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];
  const uploadedCloudinaryAssets: Array<{
    publicId: string;
    resourceType: "image" | "video" | "raw";
  }> = []; // ✅ Track uploaded Cloudinary assets

  try {
    console.log("🚀 Starting interview experience upload...");

    const supabase = await createClient();
    const vector_supabase = await v_createClient();

    // ✅ Step 1: Parse FormData
    const formData = await request.formData();
    const file = formData.get("document") as File | null;
    const videoFile = formData.get("video_preview") as File | null;

    // ✅ Step 2: Validate file exists and is PDF
    if (!file) {
      return NextResponse.json(
        { error: "Document file is required" },
        { status: 400 }
      );
    }

    const fileValidation = validate_pdf(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    console.log(
      `📄 Received PDF: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
    );

    // ✅ Step 2.5: Validate video if provided
    if (videoFile) {
      const videoValidation = validate_video(videoFile);
      if (!videoValidation.valid) {
        return NextResponse.json(
          { error: videoValidation.error },
          { status: 400 }
        );
      }
      console.log(
        `🎬 Received Video: ${videoFile.name} (${(
          videoFile.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );
    }

    // ✅ Step 3: Save files temporarily
    const tempFilePath = await save_uploaded_file(file, {
      subdirectory: UPLOAD_DIRECTORIES.INTERVIEW_EXPERIENCES,
    });
    tempFiles.push(tempFilePath);
    console.log(`💾 Saved PDF to temp: ${tempFilePath}`);

    let tempVideoPath: string | null = null;
    if (videoFile) {
      tempVideoPath = await save_uploaded_file(videoFile, {
        subdirectory: UPLOAD_DIRECTORIES.INTERVIEW_EXPERIENCES + "/videos",
      });

      if (tempVideoPath) {
        tempFiles.push(tempVideoPath);
      }

      console.log(`💾 Saved Video to temp: ${tempVideoPath}`);
    }

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
    };

    const validationResult = createInterviewExperienceSchema.safeParse(rawData);

    if (!validationResult.success) {
      await cleanup_temp_files(tempFiles);
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

    // Run sequentially (safer for rate limits). Add tiny delay between calls.
    const summaries: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const s = await createChunkSummary(chunks[i]);
      summaries.push(s);
      await new Promise((r) => setTimeout(r, 150)); // small throttle
    }

    console.log("Summaries created : ", summaries);

    // ✅ UPDATED: Generate embeddings for summaries instead of chunks
    console.log("🧠 Generating embeddings for summaries...");
    const summaryEmbeddings = await embeddings.embedDocuments(summaries);
    console.log(`   Generated ${summaryEmbeddings.length} summary embeddings`);

    const { data: company_data } = await supabase
      .from("companies")
      .select("name")
      .eq("id", validatedData.company_id)
      .single();

    // ✅ Step 6: Get current user (for created_by)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ✅ Step 7: Upload PDF to Cloudinary
    console.log("☁️ Uploading PDF to Cloudinary...");
    const cloudinaryResult = await uploadInterviewExperiencePDF(tempFilePath, {
      student_name: validatedData.student_name,
      company_name: company_data?.name || "unknown_company",
      batch: validatedData.batch,
    });

    if (!cloudinaryResult.success) {
      throw new Error(
        `Cloudinary PDF upload failed: ${cloudinaryResult.error}`
      );
    }

    // ✅ Track uploaded PDF for cleanup on error
    uploadedCloudinaryAssets.push({
      publicId: cloudinaryResult.publicId!,
      resourceType: "raw",
    });

    console.log(`   ✅ PDF Uploaded: ${cloudinaryResult.secureUrl}`);

    // ✅ Step 7.5: Upload Video to Cloudinary (if provided)
    let videoCloudinaryResult = null;
    let video_media_id = null;

    if (videoFile && tempVideoPath) {
      console.log("☁️ Uploading Video to Cloudinary...");
      videoCloudinaryResult = await uploadInterviewExperienceVideo(
        tempVideoPath,
        {
          student_name: validatedData.student_name,
          company_name: company_data?.name || "unknown_company",
          batch: validatedData.batch,
        }
      );

      if (!videoCloudinaryResult.success) {
        console.warn(`⚠️ Video upload failed: ${videoCloudinaryResult.error}`);
        // Continue anyway - video is optional
      } else {
        // ✅ Track uploaded video for cleanup on error
        uploadedCloudinaryAssets.push({
          publicId: videoCloudinaryResult.publicId!,
          resourceType: "video",
        });

        console.log(`   ✅ Video Uploaded: ${videoCloudinaryResult.secureUrl}`);

        // Create media record for video
        const { data: video_media_data, error: video_media_error } =
          await supabase
            .from("media")
            .insert({
              url: videoCloudinaryResult.secureUrl!,
              public_id: videoCloudinaryResult.publicId!,
              file_name: videoFile.name,
              file_type: videoCloudinaryResult.format,
              file_size: videoCloudinaryResult.bytes,
              uploaded_by: user?.id,
            })
            .select("id")
            .single();

        if (video_media_error) {
          throw new Error(
            `Failed to create video media record: ${video_media_error.message}`
          );
        }

        video_media_id = video_media_data.id;
        console.log(`   Video media created: ${video_media_id}`);
      }
    }

    // ✅ Step 8: Create PDF media record
    console.log("💿 Creating PDF media record...");
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

    if (media_error) {
      throw new Error(
        `Failed to create PDF media record: ${media_error.message}`
      );
    }

    const media_id = media_data.id;
    console.log(`   PDF Media created: ${media_id}`);

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
        document_media_id: media_id, // ✅ Fixed column name
        video_media_id: video_media_id,
        source: "admin_upload",
        created_by: user?.id,
      })
      .select("id")
      .single();

    if (experienceError) {
      throw new Error(
        `Failed to create interview experience: ${experienceError.message}`
      );
    }

    const experience_id = experienceData.id;
    console.log(`   Experience created: ${experience_id}`);

    // ✅ Step 10: Store embeddings in vector DB
    console.log("🗄️ Storing embeddings in vector DB...");
    const chunksToInsert = chunks.map((chunk, index) => ({
      content: chunk,
      summary: summaries[index],
      content_type: "interview_experience",
      embedding: summaryEmbeddings[index],
      chunk_index: index,
      token_count: chunk.split(" ").length,
      metadata: {
        total_document_chunks_count: chunks.length,
        interview_experience_id: experience_id,
        document_media_id: media_id,
        video_media_id: video_media_id,
        document_title: file.name,
        student_name: validatedData.student_name,
        company_id: validatedData.company_id,
        college_id: validatedData.college_id,
        batch: validatedData.batch,
        has_video_preview: !!video_media_id,
        summary_length: summaries[index].length,
      },
    }));

    const { error: chunksError } = await vector_supabase
      .from("content_chunks")
      .insert(chunksToInsert);

    if (chunksError) {
      throw new Error(`Failed to store embeddings: ${chunksError.message}`);
    }

    console.log(`   ✅ Stored ${chunksToInsert.length} chunks`);

    // ✅ Step 11: Cleanup temp files
    await cleanup_temp_files(tempFiles);
    console.log("🗑️ Cleaned up temp files");

    // ✅ Success response
    return NextResponse.json(
      {
        success: true,
        message: "Interview experience created successfully",
        data: {
          experience_id,
          media_id,
          video_media_id,
          college_id: validatedData.college_id,
          company_id: validatedData.company_id,
          chunks_stored: chunks.length,
          cloudinary_url: cloudinaryResult.secureUrl,
          video_url: videoCloudinaryResult?.secureUrl || null,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Error creating interview experience:", error);

    // ✅ Cleanup Cloudinary uploads on error
    if (uploadedCloudinaryAssets.length > 0) {
      console.log("🧹 Rolling back Cloudinary uploads...");
      for (const asset of uploadedCloudinaryAssets) {
        try {
          const deleteResult = await deleteFromCloudinary(
            asset.publicId,
            asset.resourceType
          );
          if (deleteResult.success) {
            console.log(
              `   ✅ Deleted ${asset.resourceType}: ${asset.publicId}`
            );
          } else {
            console.warn(
              `   ⚠️ Failed to delete ${asset.resourceType}: ${asset.publicId} - ${deleteResult.error}`
            );
          }
        } catch (deleteError) {
          console.error(
            `   ❌ Error deleting ${asset.resourceType}: ${asset.publicId}`,
            deleteError
          );
        }
      }
    }

    // ✅ Cleanup temp files on error
    await cleanup_temp_files(tempFiles);

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
