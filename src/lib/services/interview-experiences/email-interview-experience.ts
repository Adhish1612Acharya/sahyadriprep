import { interviewExperienceSchema } from "@/lib/zod/schema/interview-experience.schema";
import { sendEmailWithAttachment } from "@/integrations/email/send-email-with-attachment";
import { ENV } from "@/config/env";
import { generateFileBuffer } from "@/helpers/file/file-downloads";
import { createInterviewPdf } from "@/features/pdf/create-interview-pdf";
import { HttpError } from "@/lib/api/http/http-error";
import { validateRequest } from "@/helpers/validation";

export async function sendInterviewExperienceEmailService(formData: FormData) {
  const data: any = {};

  formData.forEach((value, key) => {
    if (key === "rounds") {
      data[key] = JSON.parse(value as string);
    } else if (key === "resume") {
      data[key] = value; // File
    } else {
      data[key] = value;
    }
  });

  const parsed = validateRequest(interviewExperienceSchema, data);
  if (!parsed.success) {
    throw new HttpError(
      "Validation failed",
      400,
      "INTERVIEW_EXPERIENCE_VALIDATION_FAILED",
      { details: parsed.error.errors }
    );
  }

  const {
    name,
    email,
    branch,
    batch,
    linkedin,
    company,
    role,
    placementType,
    package: pkg,
  } = parsed.data;

  const emailBody = `
Candidate Information
Name: ${name}
Email: ${email}
Branch: ${branch}
Batch: ${batch}
LinkedIn: ${linkedin}

Position Details
Company: ${company}
Role: ${role}
Placement Type: ${placementType}
Package: ${pkg || "N/A"}

Please find the detailed interview experience attached as a PDF.
  `.trim();

  const pdfBuffer = await createInterviewPdf(parsed.data);

  const attachments: { filename: string; content: Buffer }[] = [
    { filename: "interview_experience.pdf", content: pdfBuffer },
  ];

  if (data.resume) {
    const resumePdfBuffer = await generateFileBuffer(data.resume as File);
    attachments.push({ filename: "resume.pdf", content: resumePdfBuffer });
  }

  await Promise.all([
    sendEmailWithAttachment({
      to: parsed.data.email,
      subject: "Your Interview Experience Submission",
      text: emailBody,
      attachments,
    }),
    sendEmailWithAttachment({
      to: ENV.SMTP_USER!,
      subject: "New Interview Experience Submission",
      text: emailBody,
      attachments,
    }),
  ]);

  return { email, name };
}
