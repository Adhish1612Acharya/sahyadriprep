import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function create_doc_chunk(document: string) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 75,
    separators: ["\n\n", "\n", ".", "!", "?"],
  });
  const texts = await textSplitter.splitText(document);
  return texts;
};


