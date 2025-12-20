import { PDFDocument, rgb } from "pdf-lib";
import { PDF_CONFIG, Colors, Spacing, FontSizes } from "./pdf-config";
import { DrawMultilineTextOptions, DrawTextOptions } from "./types";

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

  setDoc(doc: PDFDocument) {
    (this.page as any).doc = doc;
  }

  getTextWidth(
    text: string,
    fontSize: number,
    isBold: boolean = false
  ): number {
    const font = isBold ? this.helveticaBold : this.helvetica;
    return font.widthOfTextAtSize(text, fontSize);
  }

  drawText(
    text: string,
    fontSize: number = 11,
    options?: DrawTextOptions
  ): number {
    const {
      bold = false,
      align = "left",
      lineHeight = fontSize * 1.4,
    } = options || {};

    const font = bold ? this.helveticaBold : this.helvetica;
    const color = rgb(Colors.black.r, Colors.black.g, Colors.black.b);

    let xPosition = PDF_CONFIG.marginLeft;

    if (align === "center") {
      const textWidth = this.getTextWidth(text, fontSize, bold);
      xPosition =
        PDF_CONFIG.marginLeft + (PDF_CONFIG.contentWidth - textWidth) / 2;
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
    fontSize: number = 11,
    options?: DrawMultilineTextOptions
  ): number {
    const {
      bold = false,
      indent = 0,
      lineHeight = fontSize * 1.7,
    } = options || {};

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
    this.currentY -= Spacing.sectionGap;

    // Draw thick horizontal line above section
    this.page.drawLine({
      start: { x: PDF_CONFIG.marginLeft, y: this.currentY },
      end: {
        x: PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth,
        y: this.currentY,
      },
      thickness: 2.5,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    this.currentY -= 18;

    // Draw section title
    this.page.drawText(title, {
      x: PDF_CONFIG.marginLeft,
      y: this.currentY,
      size: FontSizes.sectionHeader + 1,
      font: this.helveticaBold,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    // Draw subtle bottom border under section header
    this.currentY -= 14;
    this.page.drawLine({
      start: { x: PDF_CONFIG.marginLeft, y: this.currentY },
      end: {
        x: PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth,
        y: this.currentY,
      },
      thickness: 1,
      color: rgb(Colors.lightGray.r, Colors.lightGray.g, Colors.lightGray.b),
    });

    this.currentY -= 10;
  }

  drawDivider(): void {
    this.currentY -= 12;
    this.page.drawLine({
      start: { x: PDF_CONFIG.marginLeft, y: this.currentY },
      end: {
        x: PDF_CONFIG.marginLeft + PDF_CONFIG.contentWidth,
        y: this.currentY,
      },
      thickness: 1.2,
      color: rgb(Colors.mediumGray.r, Colors.mediumGray.g, Colors.mediumGray.b),
    });
    this.currentY -= 12;
  }

  drawField(
    label: string,
    value: string | undefined,
    indent: number = 0
  ): void {
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
      x: PDF_CONFIG.marginLeft + indent + labelWidth + 12,
      y: this.currentY,
      size: FontSizes.fieldValue,
      font: this.helvetica,
      color: rgb(Colors.mediumGray.r, Colors.mediumGray.g, Colors.mediumGray.b),
    });

    this.currentY -= Spacing.fieldGap + 4; // More gap after each field
  }

  drawFieldMultiline(
    label: string,
    value: string | undefined,
    indent: number = 0
  ): void {
    if (!value) return;

    // Draw label
    this.page.drawText(`${label}:`, {
      x: PDF_CONFIG.marginLeft + indent,
      y: this.currentY,
      size: FontSizes.fieldLabel,
      font: this.helveticaBold,
      color: rgb(Colors.darkGray.r, Colors.darkGray.g, Colors.darkGray.b),
    });

    this.currentY -= 16;

    // Draw value with wrapping
    this.drawMultilineText(value, FontSizes.bodyText, {
      indent: indent + 18,
      lineHeight: 14.5,
    });

    this.currentY -= Spacing.paragraphSpacing + 4;
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

  checkPageBreak(minSpace: number = 40) {
    if (this.currentY < PDF_CONFIG.marginBottom + minSpace) {
      // Add new page
      const newPage = this.page.doc.addPage([
        PDF_CONFIG.pageWidth,
        PDF_CONFIG.pageHeight,
      ]);
      this.page = newPage;
      this.currentY = PDF_CONFIG.pageHeight - PDF_CONFIG.marginTop;
    }
  }
}
