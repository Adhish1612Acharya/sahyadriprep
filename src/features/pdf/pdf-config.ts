import { PDFConfig } from "./types";

export const PDF_CONFIG: PDFConfig = {
  pageWidth: 595, // A4 width in points
  pageHeight: 842, // A4 height in points
  marginLeft: 40,
  marginRight: 40,
  marginTop: 35,
  marginBottom: 30,
  contentWidth: 515, // 595 - 40 - 40
};

// Professional color palette - Black & Grays only
export const Colors = {
  black: { r: 0, g: 0, b: 0 }, // #000000
  darkGray: { r: 0.15, g: 0.15, b: 0.15 }, // #262626
  mediumGray: { r: 0.4, g: 0.4, b: 0.4 }, // #666666
  lightGray: { r: 0.85, g: 0.85, b: 0.85 }, // #D9D9D9
  veryLightGray: { r: 0.95, g: 0.95, b: 0.95 }, // #F2F2F2
};

// Spacing constants
export const Spacing = {
  sectionGap: 24, // More space between sections
  fieldGap: 16, // More space between fields
  lineSpacing: 16, // More space between lines
  paragraphSpacing: 12, // More space between paragraphs
};

// Font sizes
export const FontSizes = {
  title: 24,
  sectionHeader: 15,
  fieldLabel: 12,
  fieldValue: 11,
  bodyText: 11,
};
