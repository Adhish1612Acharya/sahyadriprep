import type { NextConfig } from "next";

// API routes that embed text (EMBEDDINGS_PROVIDER=self runs the model in them).
// Keep in sync with the importers of src/lib/rag-chatbot/embedding-model-config.ts.
const EMBEDDING_ROUTES = [
  "/api/rag/chat",
  "/api/rag/process",
  "/api/interview-experiences",
  "/api/interview-experiences/youtube-videos",
];
const EMBEDDING_RUNTIME_FILES = [
  "./models/**/*",
  "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*",
];

const nextConfig: NextConfig = {
  /* config options here */
  // Native ONNX runtime: load from node_modules at runtime, never bundle.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  // File tracing can't follow onnxruntime-node's computed require() of its
  // native binding, so ship the linux-x64 binaries (what Vercel runs) and the
  // fp32 weights explicitly, only with the functions that embed.
  // Keys are matched as substrings: the "/route" suffix stops
  // "/api/interview-experiences" from also matching its child routes.
  outputFileTracingIncludes: Object.fromEntries(
    EMBEDDING_ROUTES.map((route) => [`${route}/route`, EMBEDDING_RUNTIME_FILES])
  ),
  // This route's dynamic process.cwd() file access makes the tracer sweep in
  // the project root, including the 91 MB weights it never uses.
  outputFileTracingExcludes: {
    "/api/interview-experiences/sahyadri/send/route": ["./models/**/*"],
  },
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  images: {
    remotePatterns: [
      // ✅ YouTube Thumbnails
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i9.ytimg.com",
      },
      // ✅ Supabase Storage (if you're using it)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // ✅ Company Logos
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      // Add other image hostnames if needed
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
