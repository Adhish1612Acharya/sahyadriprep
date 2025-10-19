import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const create_doc_chunk = async (document: string) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 75,
    separators: ["\n\n", "\n", ".", "!", "?"],
  });
  const texts = await textSplitter.splitText(document);
  return texts;
};

export default create_doc_chunk;
