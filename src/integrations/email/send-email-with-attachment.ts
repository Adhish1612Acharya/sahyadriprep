import { ENV } from "@/config/env";
import nodemailer from "nodemailer";

export async function sendEmailWithAttachment({
  to,
  subject,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  attachments: { filename: string; content: Buffer }[];
}) {
  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SahyadriPrep" <no-reply@sahyadriprep.com>`,
    to,
    subject,
    text,
    attachments,
  });
}
