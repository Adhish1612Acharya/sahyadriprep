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

export interface PDFConfig {
  pageWidth: number;
  pageHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  contentWidth: number;
}
