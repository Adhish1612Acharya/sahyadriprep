import { NextRequest } from "next/server";
import { InterviewUploadData } from "./types";
import { HttpError } from "@/lib/api/http";
import { validate_pdf, validate_video, validateRequest } from "@/helpers/validation";
import { createInterviewExperienceSchema } from "@/lib/zod";

export async function validateInterviewUpload(request: NextRequest): Promise<{
  documentFile: File;
  videoFile: File | null;
  data: InterviewUploadData;
}> {
  const formData = await request.formData();

  // 1. Document validation (REQUIRED)
  const documentFile = formData.get("document") as File;
  if (!documentFile) {
    throw new HttpError("Document file is required", 400, "NO_DOCUMENT");
  }

  const pdfValidation = validate_pdf(documentFile);
  if (!pdfValidation.valid) {
    throw new HttpError(pdfValidation.error!, 400, "INVALID_PDF");
  }

  // 2. Video validation (OPTIONAL)
  const videoFile = formData.get("videoPreview") as File | null;
  if (videoFile) {
    const videoValidation = validate_video(videoFile);
    if (!videoValidation.valid) {
      throw new HttpError(videoValidation.error!, 400, "INVALID_VIDEO");
    }
  }

  // 3. Form data schema (Zod)
  const rawData: InterviewUploadData = {
    studentName: formData.get("studentName") as string | null,
    batch: formData.get("batch") as string,
    placedYear: formData.get("placedYear")
      ? parseInt(formData.get("placedYear") as string)
      : undefined,
    companyId: formData.get("companyId") as string,
    source: "admin_upload",
  };

  const validationResult = validateRequest(
    createInterviewExperienceSchema,
    rawData
  );

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new HttpError(
      firstError?.message ?? "Invalid form data",
      400,
      "INVALID_FORM_DATA",
      { details: validationResult.error.format() }
    );
  }

  return {
    documentFile,
    videoFile,
    data: validationResult.data,
  };
}
