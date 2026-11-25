#!/usr/bin/env node
// Checks that the self-hosted embeddings reproduce the existing vectors.
// Every pair must reach cosine >= THRESHOLD, or vectors already stored in
// content_chunks would stop matching new queries.
//
//   node scripts/download-embedding-model.mjs
//   node scripts/check-embedding-parity.mjs --source=db [--limit=200]
//       re-embeds stored content_chunks.summary and compares with the stored
//       embedding (read-only; needs VECTOR_STORE_SUPABASE_URL/_PUBLISHABLE_KEY)
//   node scripts/check-embedding-parity.mjs --source=hf
//       compares with the live HF Inference API on built-in samples
//       (needs HF_API_KEY and NEXT_PUBLIC_HF_MODEL_NAME)
//   node scripts/check-embedding-parity.mjs --dump-samples=texts.json
//   node scripts/check-embedding-parity.mjs --source=json --ref=ref.json
//       compares with vectors from any other reference, e.g. Python
//       sentence-transformers; ref.json is { "texts": [...], "vectors": [...] }
//
// Env is read from .env if present. Never prints the stored texts.
// Requires Node >= 22.18 (imports the TypeScript class directly).
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { AutoTokenizer, env } from "@huggingface/transformers";
import { createClient } from "@supabase/supabase-js";
import { LocalMiniLMEmbeddings } from "../src/lib/rag-chatbot/local-minilm-embeddings.ts";

const THRESHOLD = 0.999;
const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const SOURCE = arg("source", "db");
const LIMIT = Number(arg("limit", "200"));

try {
  process.loadEnvFile();
} catch {
  // no .env, rely on the environment
}

const filler =
  "The candidate described a multi-round process covering data structures, system design, " +
  "behavioural questions and a final discussion with the hiring manager about team fit. ";

const SAMPLES = [
  "Amazon SDE-1 interview: two coding rounds on arrays and graphs, one bar-raiser round on leadership principles.",
  "TCS Ninja aptitude test covered quantitative reasoning, verbal ability and a basic coding section.",
  "Infosys system engineer role: online test followed by a technical interview on OOP concepts and DBMS.",
  "Google onsite: dynamic programming problem on longest increasing subsequence, follow-up on optimisation.",
  "Microsoft internship interview focused on linked lists, recursion and a short discussion of a past project.",
  "Accenture interview asked about SQL joins, normalisation and a situational question about deadlines.",
  "Wipro elite NTH: written communication test, coding round with two easy problems, HR round.",
  "Flipkart machine coding round: design a parking lot with clean classes in ninety minutes.",
  "Video summary: tips for preparing for campus placements, resume structure and mock interviews.",
  "Deloitte analyst interview covered guesstimates, Excel formulas and a case study on retail sales.",
  "Capgemini pseudo-code section and an English communication assessment before the technical round.",
  "Zoho interview with five rounds including advanced programming and a final HR conversation.",
  "Adobe interview: questions on operating systems, process scheduling and memory management.",
  "Oracle server technology interview on hashing, tries and a discussion of SQL query optimisation.",
  "Startup interview asked about React hooks, REST API design and deploying a Node.js service.",
  "What are the most common DSA topics asked in product company interviews?",
  "How should I prepare for HR rounds in service-based companies?",
  "Short",
  // Over 256 tokens: checks truncation matches sentence-transformers.
  filler.repeat(12),
  "Interview experience summary. " + filler.repeat(20),
];
// Distinct sentences (no repetition) past 256 tokens, so a wrong cut-off
// point changes the vector noticeably.
SAMPLES.push(SAMPLES.slice(0, 17).join(" "));

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / Math.sqrt(na * nb);
};

async function loadReference() {
  if (SOURCE === "hf") {
    const hf = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HF_API_KEY,
      model: process.env.NEXT_PUBLIC_HF_MODEL_NAME,
    });
    return { texts: SAMPLES, vectors: await hf.embedDocuments(SAMPLES) };
  }
  if (SOURCE === "db") {
    const db = createClient(
      process.env.VECTOR_STORE_SUPABASE_URL,
      process.env.VECTOR_STORE_SUPABASE_PUBLISHABLE_KEY
    );
    const { data, error } = await db
      .from("content_chunks")
      .select("summary, embedding")
      .not("summary", "is", null)
      .limit(LIMIT);
    if (error) throw new Error(`content_chunks read failed: ${error.message}`);
    if (!data?.length) throw new Error("content_chunks returned no rows with a summary");
    return {
      texts: data.map((r) => r.summary),
      vectors: data.map((r) =>
        typeof r.embedding === "string" ? JSON.parse(r.embedding) : r.embedding
      ),
    };
  }
  if (SOURCE === "json") {
    const ref = JSON.parse(await readFile(arg("ref", "ref.json"), "utf8"));
    if (ref.texts?.length !== ref.vectors?.length) throw new Error("ref.json texts/vectors length mismatch");
    return ref;
  }
  throw new Error(`Unknown --source=${SOURCE} (use db, hf or json)`);
}

const dumpPath = arg("dump-samples", null);
if (dumpPath) {
  await writeFile(dumpPath, JSON.stringify(SAMPLES));
  console.log(`wrote ${SAMPLES.length} samples to ${dumpPath}`);
  process.exit(0);
}

env.allowRemoteModels = false;
env.localModelPath = path.join(process.cwd(), "models");
const tokenizer = await AutoTokenizer.from_pretrained("Xenova/all-MiniLM-L6-v2");

const reference = await loadReference();
const tokenCounts = reference.texts.map((t) => tokenizer.encode(t).length);
const longCount = tokenCounts.filter((n) => n > 256).length;

const local = new LocalMiniLMEmbeddings();
const t0 = Date.now();
await local.embedQuery("warm up");
const loadMs = Date.now() - t0;
const t1 = Date.now();
await local.embedQuery(reference.texts[0]);
const warmMs = Date.now() - t1;
const localVectors = await local.embedDocuments(reference.texts);

let failures = 0;
let minSim = 1;
reference.texts.forEach((_, i) => {
  const sim = cosine(localVectors[i], reference.vectors[i]);
  minSim = Math.min(minSim, sim);
  const ok = sim >= THRESHOLD && localVectors[i].length === 384;
  if (!ok) failures++;
  if (!ok || reference.texts.length <= 30) {
    console.log(
      `${ok ? "PASS" : "FAIL"}  cos=${sim.toFixed(6)}  dims=${localVectors[i].length}  tokens=${tokenCounts[i]}  #${i}`
    );
  }
});

console.log(
  `source=${SOURCE} rows=${reference.texts.length} over256tokens=${longCount} minCos=${minSim.toFixed(6)}`
);
console.log(`local timing: model load ${loadMs} ms, warm single query ${warmMs} ms`);
if (longCount === 0) {
  console.warn("WARNING: no input exceeds 256 tokens, so truncation parity is untested.");
}

if (failures > 0) {
  console.error(`${failures} of ${reference.texts.length} below cosine ${THRESHOLD}`);
  process.exit(1);
}
console.log(`All ${reference.texts.length} checks >= ${THRESHOLD}`);
