// import { PDFDocument, rgb } from "pdf-lib";
// import { PDF_CONFIG } from "./pdf-config";

// export interface DrawTextOptions {
//   bold?: boolean;
//   color?: ReturnType<typeof rgb>;
//   align?: "left" | "center" | "right";
//   maxWidth?: number;
//   lineHeight?: number;
// }

// export interface DrawMultilineTextOptions {
//   bold?: boolean;
//   color?: ReturnType<typeof rgb>;
//   indent?: number;
//   lineHeight?: number;
// }

// export class PDFGenerator {
//   private page: ReturnType<PDFDocument["addPage"]>;
//   private helvetica: Promise<ReturnType<PDFDocument["embedFont"]>>;
//   private helveticaBold: Promise<ReturnType<PDFDocument["embedFont"]>>;
//   private currentY: number;
//   private pageWidth: number;
//   private pageHeight: number;

//   constructor(
//     page: ReturnType<PDFDocument["addPage"]>,
//     helvetica: Promise<ReturnType<PDFDocument["embedFont"]>>,
//     helveticaBold: Promise<ReturnType<PDFDocument["embedFont"]>>,
//     pageWidth: number,
//     pageHeight: number
//   ) {
//     this.page = page;
//     this.helvetica = helvetica;
//     this.helveticaBold = helveticaBold;
//     this.currentY = pageHeight - PDF_CONFIG.marginTop;
//     this.pageWidth = pageWidth;
//     this.pageHeight = pageHeight;
//   }

//   async getTextWidth(
//     text: string,
//     fontSize: number,
//     isBold: boolean = false
//   ): Promise<number> {
//     const font = isBold ? await this.helveticaBold : await this.helvetica;
//     return font.widthOfTextAtSize(text, fontSize);
//   }

//   async drawText(
//     text: string,
//     fontSize: number = 11,
//     options?: DrawTextOptions
//   ): Promise<number> {
//     const {
//       bold = false,
//       color = rgb(0, 0, 0),
//       align = "left",
//       maxWidth = PDF_CONFIG.contentWidth,
//       lineHeight = fontSize * 1.5,
//     } = options || {};

//     const font = bold ? await this.helveticaBold : await this.helvetica;

//     let xPosition = PDF_CONFIG.marginLeft;

//     if (align === "center") {
//       const textWidth = await this.getTextWidth(text, fontSize, bold);
//       xPosition =
//         PDF_CONFIG.marginLeft + (PDF_CONFIG.contentWidth - textWidth) / 2;
//     } else if (align === "right") {
//       const textWidth = await this.getTextWidth(text, fontSize, bold);
//       xPosition = PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth - textWidth;
//     }

//     this.page.drawText(text, {
//       x: xPosition,
//       y: this.currentY,
//       size: fontSize,
//       font,
//       color,
//     });

//     this.currentY -= lineHeight;
//     return lineHeight;
//   }

//   async drawMultilineText(
//     text: string,
//     fontSize: number = 11,
//     options?: DrawMultilineTextOptions
//   ): Promise<number> {
//     const {
//       bold = false,
//       color = rgb(0, 0, 0),
//       indent = 0,
//       lineHeight = fontSize * 1.5,
//     } = options || {};

//     const font = bold ? await this.helveticaBold : await this.helvetica;
//     const maxWidth = PDF_CONFIG.contentWidth - indent;

//     // Split text by words to fit within max width
//     const words = text.split(" ");
//     const lines: string[] = [];
//     let currentLine = "";

//     for (const word of words) {
//       const testLine = currentLine ? `${currentLine} ${word}` : word;
//       const width = await this.getTextWidth(testLine, fontSize, bold);

//       if (width <= maxWidth) {
//         currentLine = testLine;
//       } else {
//         if (currentLine) lines.push(currentLine);
//         currentLine = word;
//       }
//     }
//     if (currentLine) lines.push(currentLine);

//     // Draw each line
//     for (const line of lines) {
//       this.page.drawText(line, {
//         x: PDF_CONFIG.marginLeft + indent,
//         y: this.currentY,
//         size: fontSize,
//         font,
//         color,
//       });
//       this.currentY -= lineHeight;
//     }

//     return lines.length * lineHeight;
//   }

//   async drawSection(
//     title: string,
//     color: ReturnType<typeof rgb> = rgb(0, 0.2, 0.4)
//   ): Promise<void> {
//     this.currentY -= 6; // Add spacing before section

//     // Draw section title with background highlight
//     const titleWidth = await this.getTextWidth(title, 14, true);
//     this.page.drawRectangle({
//       x: PDF_CONFIG.marginLeft,
//       y: this.currentY - 16,
//       width: titleWidth + 8,
//       height: 20,
//       borderColor: color,
//       borderWidth: 0,
//       color: rgb(0.95, 0.97, 1), // Light blue background
//     });

//     this.page.drawText(title, {
//       x: PDF_CONFIG.marginLeft + 4,
//       y: this.currentY - 14,
//       size: 14,
//       font: await this.helveticaBold,
//       color,
//     });

//     this.currentY -= 24;
//   }

//   drawSpacer(height: number = 8): void {
//     this.currentY -= height;
//   }

//   async drawField(
//     label: string,
//     value: string | undefined,
//     indent: number = 0
//   ): Promise<void> {
//     if (!value) return;

//     const labelText = `${label}:`;
//     this.page.drawText(labelText, {
//       x: PDF_CONFIG.marginLeft + indent,
//       y: this.currentY,
//       size: 11,
//       font: await this.helveticaBold,
//       color: rgb(0.2, 0.2, 0.2),
//     });

//     const labelWidth = await this.getTextWidth(labelText, 11, true);
//     this.page.drawText(value, {
//       x: PDF_CONFIG.marginLeft + indent + labelWidth + 6,
//       y: this.currentY,
//       size: 11,
//       font: await this.helvetica,
//       color: rgb(0.4, 0.4, 0.4),
//     });

//     this.currentY -= 18;
//   }

//   getCurrentY(): number {
//     return this.currentY;
//   }

//   setCurrentY(y: number): void {
//     this.currentY = y;
//   }

//   getPage(): ReturnType<PDFDocument["addPage"]> {
//     return this.page;
//   }
// }

import { PDFDocument, rgb } from "pdf-lib";
import { PDF_CONFIG, Colors, Spacing, FontSizes } from "./pdf-config";

export interface DrawTextOptions {
  bold?: boolean;
  align?: "left" | "center" | "right";
  lineHeight?: number;
}

export interface DrawMultilineTextOptions {
  bold?: boolean;
  indent?: number;
  lineHeight?: number;
}

export class PDFGenerator {
  private page: ReturnType<PDFDocument["addPage"]>;
  private helvetica: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  private helveticaBold: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;

  constructor(
    page: ReturnType<PDFDocument["addPage"]>,
    helvetica: Awaited<ReturnType<PDFDocument["embedFont"]>>,
    helveticaBold: Awaited<ReturnType<PDFDocument["embedFont"]>>,
    pageWidth: number,
    pageHeight: number
  ) {
    this.page = page;
    this.helvetica = helvetica;
    this.helveticaBold = helveticaBold;
    this.currentY = pageHeight - PDF_CONFIG.marginTop;
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
  }

  getTextWidth(text: string, fontSize: number, isBold: boolean = false): number {
    const font = isBold ? this.helveticaBold : this.helvetica;
    return font.widthOfTextAtSize(text, fontSize);
  }

  drawText(text: string, fontSize: number = 11, options?: DrawTextOptions): number {
    const { bold = false, align = "left", lineHeight = fontSize * 1.4 } = options || {};

    const font = bold ? this.helveticaBold : this.helvetica;
    const color = rgb(Colors.black.r, Colors.black.g, Colors.black.b);

    let xPosition = PDF_CONFIG.marginLeft;

    if (align === "center") {
      const textWidth = this.getTextWidth(text, fontSize, bold);
      xPosition = PDF_CONFIG.marginLeft + (PDF_CONFIG.contentWidth - textWidth) / 2;
    } else if (align === "right") {
      const textWidth = this.getTextWidth(text, fontSize, bold);
      xPosition = PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth - textWidth;
    }

    this.page.drawText(text, {
      x: xPosition,
      y: this.currentY,
      size: fontSize,
      font,
      color,
    });

    this.currentY -= lineHeight;
    return lineHeight;
  }

  drawMultilineText(
    text: string,
    fontSize: number = 10.5,
    options?: DrawMultilineTextOptions
  ): number {
    const { bold = false, indent = 0, lineHeight = fontSize * 1.5 } = options || {};

    const font = bold ? this.helveticaBold : this.helvetica;
    const maxWidth = PDF_CONFIG.contentWidth - indent;
    const color = rgb(Colors.black.r, Colors.black.g, Colors.black.b);

    // Split text by words to fit within max width
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = this.getTextWidth(testLine, fontSize, bold);

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw each line
    for (const line of lines) {
      this.page.drawText(line, {
        x: PDF_CONFIG.marginLeft + indent,
        y: this.currentY,
        size: fontSize,
        font,
        color,
      });
      this.currentY -= lineHeight;
    }

    return lines.length * lineHeight;
  }

  drawSection(title: string): void {
    // Top spacing
    this.currentY -= Spacing.sectionGap / 2;

    // Draw horizontal line above section
    this.page.drawLine({
      start: { x: PDF_CONFIG.marginLeft, y: this.currentY },
      end: { x: PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth, y: this.currentY },
      thickness: 1.5,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    this.currentY -= 12;

    // Draw section title
    this.page.drawText(title, {
      x: PDF_CONFIG.marginLeft,
      y: this.currentY,
      size: FontSizes.sectionHeader,
      font: this.helveticaBold,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    this.currentY -= 18;

    // Bottom spacing
    this.currentY -= 2;
  }

  drawDivider(): void {
    this.currentY -= 8;
    this.page.drawLine({
      start: { x: PDF_CONFIG.marginLeft, y: this.currentY },
      end: { x: PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth, y: this.currentY },
      thickness: 0.8,
      color: rgb(Colors.lightGray.r, Colors.lightGray.g, Colors.lightGray.b),
    });
    this.currentY -= 8;
  }

  drawField(label: string, value: string | undefined, indent: number = 0): void {
    if (!value) return;

    const labelText = `${label}:`;
    const labelWidth = this.getTextWidth(labelText, FontSizes.fieldLabel, true);

    // Draw label
    this.page.drawText(labelText, {
      x: PDF_CONFIG.marginLeft + indent,
      y: this.currentY,
      size: FontSizes.fieldLabel,
      font: this.helveticaBold,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    // Draw value
    this.page.drawText(value, {
      x: PDF_CONFIG.marginLeft + indent + labelWidth + 8,
      y: this.currentY,
      size: FontSizes.fieldValue,
      font: this.helvetica,
      color: rgb(Colors.mediumGray.r, Colors.mediumGray.g, Colors.mediumGray.b),
    });

    this.currentY -= Spacing.fieldGap;
  }

  drawFieldMultiline(label: string, value: string | undefined, indent: number = 0): void {
    if (!value) return;

    // Draw label
    this.page.drawText(`${label}:`, {
      x: PDF_CONFIG.marginLeft + indent,
      y: this.currentY,
      size: FontSizes.fieldLabel,
      font: this.helveticaBold,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    this.currentY -= 14;

    // Draw value with wrapping
    this.drawMultilineText(value, FontSizes.bodyText, {
      indent: indent + 15,
      lineHeight: 12.5,
    });

    this.currentY -= Spacing.paragraphSpacing;
  }

  drawSpacer(height: number = 8): void {
    this.currentY -= height;
  }

  getCurrentY(): number {
    return this.currentY;
  }

  setCurrentY(y: number): void {
    this.currentY = y;
  }

  getPage(): ReturnType<PDFDocument["addPage"]> {
    return this.page;
  }
}
