import { generateFileBuffer } from "@/helpers/file/file.helpers";
import { InterviewExperienceFormValues } from "../zod/interviewExperience.schema";
import { createPdf } from "./createPdf";

export async function createInterviewPdf(
  data: InterviewExperienceFormValues
): Promise<Buffer> {
  try {
    // Create PDF document
    const pdfDoc = await createPdf(data);

    // Save PDF and get bytes
    const pdfBytes = await pdfDoc.save();

    // Generate file buffer
    const fileBuffer = generateFileBuffer(pdfBytes);

    return fileBuffer;
  } catch (error) {
    console.error("Interview PDF generation failed:", error);
    throw new Error(
      `Failed to generate interview experience PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
