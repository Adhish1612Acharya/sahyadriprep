function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const ENV = {
  // Supabase (app)
  NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  ),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),

  // API / site URLs
  NEXT_PUBLIC_API_URL: requireEnv("NEXT_PUBLIC_API_URL"),
  NEXT_PUBLIC_SITE_URL: requireEnv("NEXT_PUBLIC_SITE_URL"),

  // Vector store Supabase (can be same or different project)
  VECTOR_STORE_SUPABASE_URL: requireEnv("VECTOR_STORE_SUPABASE_URL"),
  VECTOR_STORE_SUPABASE_PUBLISHABLE_KEY: requireEnv(
    "VECTOR_STORE_SUPABASE_PUBLISHABLE_KEY"
  ),

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: requireEnv(
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
  ),
  CLOUDINARY_API_KEY: requireEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: requireEnv("CLOUDINARY_API_SECRET"),

  // Hugging Face / embeddings
  HF_API_KEY: requireEnv("HF_API_KEY"),
  NEXT_PUBLIC_HF_MODEL_NAME: requireEnv("NEXT_PUBLIC_HF_MODEL_NAME"),
  NEXT_PUBLIC_HF_PROVIDER: requireEnv("NEXT_PUBLIC_HF_PROVIDER"),

  // Email service
  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: requireEnv("SMTP_PORT"),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),

  // Groq
  GROQ_API_KEY: requireEnv("GROQ_API_KEY"),

  // YouTube
  YOUTUBE_API_KEY: requireEnv("YOUTUBE_API_KEY"),
  YOUTUBE_TRANSCRIPT_API_URL: requireEnv("YOUTUBE_TRANSCRIPT_API_URL"),

  // Gemini – shared / generic
  GEMINI_API_CHUNK_SUMMARY_GENERATE: requireEnv(
    "GEMINI_API_CHUNK_SUMMARY_GENERATE"
  ),

  // Gemini – per YouTube-interview feature
  GEMINI_API_KEY_OVERVIEW: requireEnv("GEMINI_API_KEY_OVERVIEW"),
  GEMINI_API_KEY_SEGMENTS: requireEnv("GEMINI_API_KEY_SEGMENTS"),
  GEMINI_API_KEY_FLASHCARDS: requireEnv("GEMINI_API_KEY_FLASHCARDS"),
  GEMINI_API_KEY_TIPS: requireEnv("GEMINI_API_KEY_TIPS"),
  GEMINI_API_KEY_FIND_COMPANY: requireEnv("GEMINI_API_KEY_FIND_COMPANY"),
};
