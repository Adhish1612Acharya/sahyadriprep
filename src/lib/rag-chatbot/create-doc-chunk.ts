import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const create_doc_chunk = async (document: string) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const texts = await textSplitter.splitText(document);
  return texts;
};

export default create_doc_chunk;
