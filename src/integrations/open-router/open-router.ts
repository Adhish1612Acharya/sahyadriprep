import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: "<OPENROUTER_API_KEY>",
});

// Stream the response to get reasoning tokens in usage
const stream = await openrouter.chat.send({
  model: "openai/gpt-oss-120b:free",
  messages: [
    {
      role: "user",
      content: "How many r's are in the word 'strawberry'?",
    },
  ],
  stream: true,
});

let response = "";
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    response += content;
    process.stdout.write(content);
  }

  // Usage information comes in the final chunk
  if (chunk.usage) {
    console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
  }
}
