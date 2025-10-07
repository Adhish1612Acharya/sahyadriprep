import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const doc_loader = async (
  filePath = "C:\\Users\\Adhish\\Documents\\webdev\\sahyadriprep\\Deloitte_Interview_Experience(Aditi_Naik).pdf"
) => {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const doc = await loader.load();
  return doc[0].pageContent; // Return all pages in the PDF single object within an array
};

export default doc_loader;
