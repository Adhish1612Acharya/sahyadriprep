import { PDFDocument, StandardFonts } from "pdf-lib";
import { InterviewExperienceFormValues } from "@/lib/zod/schema/interview-experience.schema";
import { PDF_CONFIG, FontSizes, Spacing } from "./pdf-config";
import { PDFGenerator } from "./pdf-generator";

export async function createPdf(
  data: InterviewExperienceFormValues
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight]);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const generator = new PDFGenerator(
    page,
    helvetica,
    helveticaBold,
    PDF_CONFIG.pageWidth,
    PDF_CONFIG.pageHeight
  );
  generator.setDoc(pdfDoc); // For page break logic

  // ==================== TITLE ====================
  generator.checkPageBreak();
  generator.drawText("Interview Experience Submission", FontSizes.title, {
    bold: true,
    align: "center",
  });
  generator.drawSpacer(Spacing.sectionGap + 6);

  // ==================== CANDIDATE INFORMATION ====================
  generator.checkPageBreak();
  generator.drawSection("Candidate Information");

  generator.drawField("Name", data.name);
  generator.drawField("Email", data.email);
  generator.drawField("Branch", data.branch);
  generator.drawField("Batch", data.batch);
  generator.drawField("LinkedIn", data.linkedin);

  generator.drawSpacer(Spacing.sectionGap);

  // ==================== COMPANY & ROLE INFORMATION ====================
  generator.checkPageBreak();
  generator.drawSection("Position Details");

  generator.drawField("Company", data.company);
  generator.drawField("Role", data.role);
  generator.drawField("Placement Type", data.placementType);
  if (data.package) {
    generator.drawField("Package", data.package);
  }

  generator.drawSpacer(Spacing.sectionGap);

  // ==================== INTERVIEW ROUNDS ====================
  generator.checkPageBreak();
  generator.drawSection("Interview Process");

  data.rounds.forEach((round, idx) => {
    generator.checkPageBreak();
    const roundNumber = idx + 1;

    // Round Header
    generator.drawText(`Round ${roundNumber}: ${round.roundTitle}`, 12, {
      bold: true,
      lineHeight: 16,
    });

    // Difficulty Level
    generator.drawText(`Difficulty: ${round.difficulty}`, 10, {
      bold: true,
      lineHeight: 13,
    });

    // Topics & Questions Label
    generator.drawText("Topics & Questions:", 10.5, {
      bold: true,
      lineHeight: 13,
    });

    // Description (multiline)
    generator.drawMultilineText(round.description, FontSizes.bodyText, {
      indent: 30,
      lineHeight: 12.5,
    });

    generator.drawSpacer(12);

    // Divider between rounds (if not last)
    if (idx < data.rounds.length - 1) {
      generator.drawDivider();
    }
  });

  generator.drawSpacer(Spacing.sectionGap);

  // ==================== ADDITIONAL EXPERIENCE ====================
  generator.checkPageBreak();
  generator.drawSection("Additional Experience");

  generator.drawFieldMultiline("Project Discussion", data.projectDiscussion, 0);
  generator.drawSpacer(Spacing.paragraphSpacing);

  generator.drawFieldMultiline("Resume Discussion", data.resumeDiscussion, 0);
  generator.drawSpacer(Spacing.sectionGap);

  // ==================== TIPS FOR JUNIORS ====================
  generator.checkPageBreak();
  generator.drawSection("Tips for Juniors");

  generator.drawMultilineText(data.tipsForJuniors, FontSizes.bodyText, {
    indent: 0,
    lineHeight: 12.5,
  });

  // ==================== FOOTER ====================
  generator.setCurrentY(PDF_CONFIG.marginBottom + 15);

  return pdfDoc;
}
