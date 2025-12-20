import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as fs from "fs";


export async function doc_loader(
  filePath: string
) {
  try {
    console.log("🔍 Attempting to load PDF from:", filePath);

    // ✅ Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    // ✅ Check file stats
    const stats = fs.statSync(filePath);
    console.log("📊 File size:", Math.round(stats.size / 1024), "KB");

    if (stats.size === 0) {
      throw new Error("PDF file is empty");
    }

    // ✅ Load PDF with better configuration
    const loader = new PDFLoader(filePath, {
      splitPages: false,
      parsedItemSeparator: " ", // Add separator for parsed items
    });

    console.log("📖 Loading document...");
    const docs = await loader.load();

    console.log("📄 Loaded documents count:", docs.length);

    if (!docs || docs.length === 0) {
      throw new Error(
        "PDF loader returned empty array - PDF might be corrupted or password protected"
      );
    }

    // ✅ Log each document for debugging
    docs.forEach((doc, index) => {
      console.log(`📑 Document ${index}:`, {
        pageContentLength: doc.pageContent?.length || 0,
        metadata: doc.metadata,
        contentPreview:
          doc.pageContent?.substring(0, 200) + "..." || "No content",
      });
    });

    // ✅ Combine all pages if multiple documents
    if (docs.length === 1) {
      return docs[0].pageContent;
    } else {
      // Multiple pages - combine them
      const combinedContent = docs
        .map((doc) => doc.pageContent)
        .filter((content) => content && content.trim().length > 0)
        .join("\n\n--- PAGE BREAK ---\n\n");

      console.log("📝 Combined content length:", combinedContent.length);
      return combinedContent;
    }
  } catch (error: any) {
    console.error("❌ Error in doc_loader:", error.message);

    // ✅ Try alternative loading approaches
    console.log("🔄 Trying alternative loading method...");

    try {
      // Alternative 1: Load with splitPages: true
      const alternativeLoader = new PDFLoader(filePath, {
        splitPages: true,
      });

      const altDocs = await alternativeLoader.load();
      console.log("📄 Alternative method loaded:", altDocs.length, "pages");

      if (altDocs && altDocs.length > 0) {
        const combinedContent = altDocs
          .map((doc) => doc.pageContent)
          .filter((content) => content && content.trim().length > 0)
          .join("\n\n--- PAGE BREAK ---\n\n");

        return combinedContent;
      }
    } catch (altError: any) {
      console.error("❌ Alternative loading also failed:", altError.message);
    }

    throw error;
  }
};