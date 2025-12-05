// export interface PDFConfig {
//   pageWidth: number;
//   pageHeight: number;
//   marginLeft: number;
//   marginRight: number;
//   marginTop: number;
//   marginBottom: number;
//   contentWidth: number;
// }

// export const PDF_CONFIG: PDFConfig = {
//   pageWidth: 595,
//   pageHeight: 842,
//   marginLeft: 50,
//   marginRight: 50,
//   marginTop: 40,
//   marginBottom: 40,
//   contentWidth: 495,
// };

export interface PDFConfig {
  pageWidth: number;
  pageHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  contentWidth: number;
}

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
  black: { r: 0, g: 0, b: 0 },          // #000000
  darkGray: { r: 0.15, g: 0.15, b: 0.15 }, // #262626
  mediumGray: { r: 0.4, g: 0.4, b: 0.4 },  // #666666
  lightGray: { r: 0.85, g: 0.85, b: 0.85 }, // #D9D9D9
  veryLightGray: { r: 0.95, g: 0.95, b: 0.95 }, // #F2F2F2
};

// Spacing constants
export const Spacing = {
  sectionGap: 16,      // Between sections
  fieldGap: 12,        // Between fields
  lineSpacing: 14,     // Between lines
  paragraphSpacing: 8, // Between paragraphs
};

// Font sizes
export const FontSizes = {
  title: 22,
  sectionHeader: 13,
  fieldLabel: 11,
  fieldValue: 10.5,
  bodyText: 10.5,
};
