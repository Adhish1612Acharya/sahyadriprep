import { fetchAuthProfileByUserId } from "@/lib/services/profiles";
import { CreateInterviewExperienceResult } from "@/lib/services/interview-experiences";
import { HttpError } from "@/lib/api/http";
import { NextRequest } from "next/server";
import {
  RollbackContext,
  rollbackInterviewCreation,
} from "@/integrations/cloudinary";
import { cleanup_temp_files } from "@/helpers/file";
import { SupabaseClient } from "@supabase/supabase-js";

import { fetchCompanyLightForCollege } from "@/lib/services/companies";
import {
  createInterviewExperienceMediaRecords,
  deleteOwnMediaForCollegeByIdService,
  updateInterviewExperienceMediaMetadata,
} from "@/lib/services/media";
import { processInterviewExperiencePdfToChunks } from "@/lib/services/rag";
import {
  uploadInterviewFilesToCloudinary,
  deleteInterviewExperienceFilesFromCloudinary,
} from "@/lib/services/cloudinary";
import {
  createInterviewExperienceService,
  validateInterviewUpload,
  saveTempInterviewExperienceFiles,
  getOwnInterviewExperienceForCollege,
  deleteOwnInterviewExperienceForCollegeService,
} from "@/lib/services/interview-experiences";
import { getMediaByIdService } from "@/lib/services/media";
import { deleteVectorEmbeddingsForInterviewExperienceService } from "@/lib/services/vector-store";

export async function createInterviewExperienceOrchestrator(
  request: NextRequest,
  supabase: SupabaseClient,
  vectorSupabase: SupabaseClient,
  userId: string
): Promise<CreateInterviewExperienceResult> {
  const ctx: RollbackContext = {
    tempFiles: [],
    cloudinaryAssets: [],
    mediaIds: [],
    supabase,
  };

  try {
    // 1. VALIDATION
    const {
      documentFile: pdfFile,
      videoFile,
      data: validatedData,
    } = await validateInterviewUpload(request);

    const userAuthProfile = await fetchAuthProfileByUserId(supabase, userId);

    const collegeId = userAuthProfile.college_id;

    const company = await fetchCompanyLightForCollege(
      supabase,
      validatedData.companyId,
      collegeId
    );

    // 2. TEMP FILES
    const tempFilePathsResult = await saveTempInterviewExperienceFiles(
      pdfFile,
      videoFile
    );

    if (
      tempFilePathsResult.success === false ||
      tempFilePathsResult.experiencePdfFilePath === null
    ) {
      throw new HttpError(
        tempFilePathsResult.error || "Failed to save temporary files",
        500,
        "TEMP_FILE_SAVE_FAILED"
      );
    }

    const pdfPath = tempFilePathsResult.experiencePdfFilePath;
    const videoPath = tempFilePathsResult.experienceVideoOverviewFilePath;

    const tempFilePaths = Array.of(pdfPath, videoPath).filter(
      (path): path is string => path !== null
    );

    ctx.tempFiles.push(...tempFilePaths);

    // 3. CLOUDINARY
    const cloudinaryResult = await uploadInterviewFilesToCloudinary(
      pdfPath,
      videoPath,
      {
        studentName: validatedData.studentName!,
        batch: validatedData.batch,
        companyName: company.name,
      }
    );
    if (!cloudinaryResult.success || !cloudinaryResult.assets.pdf) {
      throw new HttpError(cloudinaryResult.error!, 500, "CLOUDINARY_FAILED");
    }

    // Convert CloudinaryAssets → CloudinaryAsset[]
    ctx.cloudinaryAssets.push(cloudinaryResult.assets?.pdf);
    if (cloudinaryResult.assets.video) {
      ctx.cloudinaryAssets.push(cloudinaryResult.assets.video);
    }

    // 4. MEDIA RECORDS
    const { pdfMediaId, videoMediaId } =
      await createInterviewExperienceMediaRecords(
        supabase,
        cloudinaryResult.assets,
        userId,
        collegeId
      );

    // 5. INTERVIEW EXPERIENCE
    const newInterviewExperience = await createInterviewExperienceService(
      supabase,
      {
        student_name: validatedData.studentName,
        college_id: collegeId,
        company_id: validatedData.companyId,
        batch: validatedData.batch,
        placed_year: validatedData.placedYear,
        document_media_id: pdfMediaId,
        video_media_id: videoMediaId,
        source: "admin_upload",
        created_by: userId,
      }
    );
    const experienceId = newInterviewExperience.id;

    // 6. MEDIA METADATA
    await Promise.all([
      updateInterviewExperienceMediaMetadata(
        supabase,
        pdfMediaId,
        experienceId,
        validatedData.studentName!,
        "document"
      ),
      videoMediaId
        ? updateInterviewExperienceMediaMetadata(
            supabase,
            videoMediaId,
            experienceId,
            validatedData.studentName!,
            "video"
          )
        : Promise.resolve(),
    ]);

    // 7. RAG PROCESSING (partial success)
    let ragStatus: "COMPLETED" | "FAILED" | "" = "COMPLETED";
    let ragChunksCount = 0;
    try {
      const ragChunks = await processInterviewExperiencePdfToChunks(
        vectorSupabase,
        pdfPath,
        experienceId,
        pdfMediaId,
        videoMediaId,
        cloudinaryResult.assets.pdf.fileName || "Untitled Document",
        validatedData,
        collegeId
      );
      ragChunksCount = ragChunks.length;
    } catch (ragError) {
      ragStatus = "FAILED";
      console.error("RAG processing failed:", ragError);
    }

    await cleanup_temp_files(tempFilePaths);

    return {
      experienceId,
      pdfMediaId,
      videoMediaId,
      ragStatus,
      ragChunksCount,
    };
  } catch (error: any) {
    await rollbackInterviewCreation(ctx);
    throw error;
  }
}

export async function deleteInterviewExperienceOrchestrator(
  supabase: SupabaseClient,
  vectorSupabase: SupabaseClient,
  userId: string,
  collegeId: string,
  interviewExperienceId: string
): Promise<{
  success: boolean;
  data: { id: string; deleted_at: string };
  warnings?: string[];
}> {
  const mediaIds: string[] = [];
  const cloudinaryAssets: {
    pdf: { publicId: string; resourceType: "raw" };
    video?: { publicId: string; resourceType: "video" };
  } = { pdf: null!, video: undefined };

  try {
    // 1. LOAD ASSETS (before any delete)
    const experience = await getOwnInterviewExperienceForCollege(
      supabase,
      interviewExperienceId,
      collegeId,
      userId
    );

    if (experience.document_media_id) {
      const pdfMedia = await getMediaByIdService(
        supabase,
        experience.document_media_id
      );
      cloudinaryAssets.pdf = {
        publicId: pdfMedia.public_id,
        resourceType: "raw",
      };
      mediaIds.push(experience.document_media_id);
    }

    if (experience.video_media_id) {
      const videoMedia = await getMediaByIdService(
        supabase,
        experience.video_media_id
      );
      cloudinaryAssets.video = {
        publicId: videoMedia.public_id,
        resourceType: "video",
      };
      mediaIds.push(experience.video_media_id);
    }

    await deleteOwnInterviewExperienceForCollegeService(
      supabase,
      interviewExperienceId,
      userId,
      collegeId
    );

    for (const mediaId of mediaIds) {
      await deleteOwnMediaForCollegeByIdService(
        supabase,
        mediaId,
        collegeId,
        userId
      );
    }

    await deleteVectorEmbeddingsForInterviewExperienceService(
      vectorSupabase,
      interviewExperienceId
    );

    // 3. CLEANUP ASSETS (fire-and-forget - no FK dependency)
    const cloudinaryResult = await deleteInterviewExperienceFilesFromCloudinary(
      cloudinaryAssets
    );

    return {
      success: true,
      data: { id: interviewExperienceId, deleted_at: new Date().toISOString() },
      warnings:
        cloudinaryResult.results.pdf.success &&
        (!cloudinaryAssets.video || cloudinaryResult.results.video?.success)
          ? undefined
          : ["Cloudinary partial failure"],
    };
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    } else {
      throw new HttpError(
        `Delete failed: ${error.message}`,
        500,
        "DELETE_FAILED"
      );
    }
  }
}
