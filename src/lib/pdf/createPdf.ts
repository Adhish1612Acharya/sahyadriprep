// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import { InterviewExperienceFormValues } from "@/lib/zod/interviewExperience.schema";
// import { PDF_CONFIG } from "./pdf-config";
// import { PDFGenerator } from "./pdf-generator";

// export async function createPdf(
//   data: InterviewExperienceFormValues
// ): Promise<PDFDocument> {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight]);

//   const helveticaPromise = pdfDoc.embedFont(StandardFonts.Helvetica);
//   const helveticaBoldPromise = pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   const generator = new PDFGenerator(
//     page,
//     helveticaPromise as any,
//     helveticaBoldPromise as any,
//     PDF_CONFIG.pageWidth,
//     PDF_CONFIG.pageHeight
//   );

//   // ==================== Title ====================
//   await generator.drawText("Interview Experience Submission", 20, {
//     bold: true,
//     color: rgb(0, 0, 0),
//     align: "center",
//   });
//   generator.drawSpacer(12);

//   // ==================== CANDIDATE INFORMATION ====================
//   await generator.drawSection("Candidate Information", rgb(0, 0.35, 0.65));

//   await generator.drawField("Name", data.name);
//   await generator.drawField("Email", data.email);
//   await generator.drawField("Branch", data.branch);
//   await generator.drawField("Batch", data.batch);
//   await generator.drawField("LinkedIn", data.linkedin);

//   generator.drawSpacer(10);

//   // ==================== COMPANY & ROLE INFORMATION ====================
//   await generator.drawSection("Position Details", rgb(0.2, 0.5, 0.2));

//   await generator.drawField("Company", data.company);
//   await generator.drawField("Role", data.role);
//   await generator.drawField("Placement Type", data.placementType);
//   if (data.package) {
//     await generator.drawField("Package", data.package);
//   }

//   generator.drawSpacer(10);

//   // ==================== INTERVIEW ROUNDS ====================
//   await generator.drawSection("Interview Process", rgb(0.65, 0.35, 0));

//   for (const [idx, round] of data.rounds.entries()) {
//     const roundNumber = idx + 1;

//     // Round header
//     const currentPage = generator.getPage();
//     currentPage.drawText(`Round ${roundNumber}: ${round.roundTitle}`, {
//       x: PDF_CONFIG.marginLeft,
//       y: generator.getCurrentY(),
//       size: 12,
//       font: await helveticaBoldPromise,
//       color: rgb(0.2, 0.2, 0.2),
//     });
//     generator.setCurrentY(generator.getCurrentY() - 16);

//     // Difficulty level
//     const difficultyColor =
//       round.difficulty === "Hard"
//         ? rgb(0.8, 0.2, 0.2)
//         : round.difficulty === "Medium"
//         ? rgb(0.8, 0.6, 0.2)
//         : rgb(0.2, 0.6, 0.2);

//     currentPage.drawText(`Difficulty: ${round.difficulty}`, {
//       x: PDF_CONFIG.marginLeft + 20,
//       y: generator.getCurrentY(),
//       size: 10,
//       font: await helveticaBoldPromise,
//       color: difficultyColor,
//     });
//     generator.setCurrentY(generator.getCurrentY() - 14);

//     // Description with multiline support
//     currentPage.drawText("Topics & Questions:", {
//       x: PDF_CONFIG.marginLeft + 20,
//       y: generator.getCurrentY(),
//       size: 11,
//       font: await helveticaBoldPromise,
//       color: rgb(0.2, 0.2, 0.2),
//     });
//     generator.setCurrentY(generator.getCurrentY() - 14);

//     await generator.drawMultilineText(round.description, 11, {
//       indent: 40,
//       lineHeight: 13,
//     });

//     generator.drawSpacer(10);
//   }

//   generator.drawSpacer(8);

//   // ==================== EXPERIENCE & ADVICE ====================
//   await generator.drawSection("Additional Experience", rgb(0.5, 0.2, 0.5));

//   const currentPage = generator.getPage();
//   currentPage.drawText("Project Discussion:", {
//     x: PDF_CONFIG.marginLeft,
//     y: generator.getCurrentY(),
//     size: 12,
//     font: await helveticaBoldPromise,
//     color: rgb(0.2, 0.2, 0.2),
//   });
//   generator.setCurrentY(generator.getCurrentY() - 14);

//   await generator.drawMultilineText(data.projectDiscussion, 11, {
//     indent: 20,
//     lineHeight: 13,
//   });

//   generator.drawSpacer(8);

//   currentPage.drawText("Resume Discussion:", {
//     x: PDF_CONFIG.marginLeft,
//     y: generator.getCurrentY(),
//     size: 12,
//     font: await helveticaBoldPromise,
//     color: rgb(0.2, 0.2, 0.2),
//   });
//   generator.setCurrentY(generator.getCurrentY() - 14);

//   await generator.drawMultilineText(data.resumeDiscussion, 11, {
//     indent: 20,
//     lineHeight: 13,
//   });

//   generator.drawSpacer(12);

//   // ==================== TIPS FOR JUNIORS ====================
//   await generator.drawSection("Tips for Juniors", rgb(0, 0.5, 0.4));

//   await generator.drawMultilineText(data.tipsForJuniors, 11, {
//     indent: 10,
//     lineHeight: 13,
//   });

//   // ==================== Footer ====================
//   generator.setCurrentY(PDF_CONFIG.marginBottom + 10);

//   return pdfDoc;
// }


import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { InterviewExperienceFormValues } from "@/lib/zod/interviewExperience.schema";
import { PDF_CONFIG, FontSizes, Spacing, Colors } from "./pdf-config";
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

  // ==================== TITLE ====================
  generator.drawText("Interview Experience Submission", FontSizes.title, {
    bold: true,
    align: "center",
  });
  generator.drawSpacer(18);

  // ==================== CANDIDATE INFORMATION ====================
  generator.drawSection("Candidate Information");

  generator.drawField("Name", data.name);
  generator.drawField("Email", data.email);
  generator.drawField("Branch", data.branch);
  generator.drawField("Batch", data.batch);
  generator.drawField("LinkedIn", data.linkedin);

  generator.drawSpacer(Spacing.sectionGap);

  // ==================== COMPANY & ROLE INFORMATION ====================
  generator.drawSection("Position Details");

  generator.drawField("Company", data.company);
  generator.drawField("Role", data.role);
  generator.drawField("Placement Type", data.placementType);
  if (data.package) {
    generator.drawField("Package", data.package);
  }

  generator.drawSpacer(Spacing.sectionGap);

  // ==================== INTERVIEW ROUNDS ====================
  generator.drawSection("Interview Process");

  data.rounds.forEach((round, idx) => {
    const roundNumber = idx + 1;

    // Round Header
    const roundHeaderText = `Round ${roundNumber}: ${round.roundTitle}`;
    page.drawText(roundHeaderText, {
      x: PDF_CONFIG.marginLeft,
      y: generator.getCurrentY(),
      size: 11,
      font: helveticaBold,
      color: rgb(Colors.black.r, Colors.black.g, Colors.black.b),
    });
    generator.setCurrentY(generator.getCurrentY() - 16);

    // Difficulty Level
    const difficultyText = `Difficulty: ${round.difficulty}`;
    page.drawText(difficultyText, {
      x: PDF_CONFIG.marginLeft + 15,
      y: generator.getCurrentY(),
      size: 10,
      font: helveticaBold,
      color: rgb(Colors.mediumGray.r, Colors.mediumGray.g, Colors.mediumGray.b),
    });
    generator.setCurrentY(generator.getCurrentY() - 13);

    // Topics & Questions Label
    page.drawText("Topics & Questions:", {
      x: PDF_CONFIG.marginLeft + 15,
      y: generator.getCurrentY(),
      size: 10.5,
      font: helveticaBold,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });
    generator.setCurrentY(generator.getCurrentY() - 13);

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
  generator.drawSection("Additional Experience");

  // Project Discussion
  generator.drawFieldMultiline("Project Discussion", data.projectDiscussion, 0);
  generator.drawSpacer(Spacing.paragraphSpacing);

  // Resume Discussion
  generator.drawFieldMultiline("Resume Discussion", data.resumeDiscussion, 0);
  generator.drawSpacer(Spacing.sectionGap);

  // ==================== TIPS FOR JUNIORS ====================
  generator.drawSection("Tips for Juniors");

  generator.drawMultilineText(data.tipsForJuniors, FontSizes.bodyText, {
    indent: 0,
    lineHeight: 12.5,
  });

  // ==================== FOOTER ====================
  generator.setCurrentY(PDF_CONFIG.marginBottom + 15);

  return pdfDoc;
}
