import { NextRequest, NextResponse } from "next/server";
import { interviewExperienceSchema } from "@/lib/zod/interviewExperience.schema";

import { sendEmailWithAttachment } from "@/lib/email/send-email-with-attachment";
import { generateFileBuffer } from "@/helpers/file/file.helpers";
import { createInterviewPdf } from "@/lib/pdf/createInterviewPdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
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

    // Validate with Zod
    const parsed = interviewExperienceSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Prepare email body with candidate and position details
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

    // Generate PDF
    const pdfBuffer = await createInterviewPdf(parsed.data);

    let resumePdfBuffer = null;
    const attachments = [
      { filename: "interview_experience.pdf", content: pdfBuffer },
    ];

    if (data.resume) {
      resumePdfBuffer = await generateFileBuffer(data.resume);
      attachments.push({ filename: "resume.pdf", content: resumePdfBuffer });
    }

    // Send email to senior and SahyadriPrep
    await Promise.all([
      sendEmailWithAttachment({
        to: parsed.data.email,
        subject: "Your Interview Experience Submission",
        text: emailBody,
        attachments,
      }),
      sendEmailWithAttachment({
        to: process.env.SMTP_USER!,
        subject: "New Interview Experience Submission",
        text: emailBody,
        attachments,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
