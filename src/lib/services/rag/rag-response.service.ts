import { generateRAGResponse } from "@/features/rag";
import { GenerateRAGResponseParams } from "./types";

export async function generateRAGResponseService({
  message,
  context,
  responseStartTime,
}: GenerateRAGResponseParams): Promise<{
  message: string;
  responseTime: number;
}> {
  console.log("🤖 Generating AI response...");

  const aiResponse = await generateRAGResponse(message, context);
  const responseTime = Date.now() - responseStartTime;

  console.log(`✅ AI response generated (${responseTime}ms)`);

  return {
    message: aiResponse.content,
    responseTime,
  };
}
