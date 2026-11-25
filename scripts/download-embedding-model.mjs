#!/usr/bin/env node
// Downloads the fp32 ONNX export of all-MiniLM-L6-v2 into ./models so it is
// bundled with the deployment (EMBEDDINGS_PROVIDER=self). Runs as `prebuild`.
// Files are pinned to one revision and checked against SHA-256 hashes, so the
// vectors can't drift if the upstream repo changes.
//
// As `prebuild` it only downloads when EMBEDDINGS_PROVIDER=self, so hf builds
// don't depend on huggingface.co or ship unused weights. Run it directly
// (`node scripts/download-embedding-model.mjs`) to always download.
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO = "Xenova/all-MiniLM-L6-v2";
const REVISION = "751bff37182d3f1213fa05d7196b954e230abad9";
const FILES = {
  "config.json":
    "7135149f7cffa1a573466c6e4d8423ed73b62fd2332c575bf738a0d033f70df7",
  "tokenizer.json":
    "da0e79933b9ed51798a3ae27893d3c5fa4a201126cef75586296df9b4d2c62a0",
  "tokenizer_config.json":
    "9261e7d79b44c8195c1cada2b453e55b00aeb81e907a6664974b4d7776172ab3",
  "onnx/model.onnx":
    "759c3cd2b7fe7e93933ad23c4c9181b7396442a2ed746ec7c1d46192c469c46e",
};

if (
  process.env.npm_lifecycle_event === "prebuild" &&
  process.env.EMBEDDINGS_PROVIDER !== "self"
) {
  console.log("[embedding-model] EMBEDDINGS_PROVIDER is not 'self': skipping download");
  process.exit(0);
}

const targetDir = path.join(process.cwd(), "models", ...REPO.split("/"));

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function existingMatches(file, expected) {
  try {
    return sha256(await readFile(file)) === expected;
  } catch {
    return false;
  }
}

for (const [name, expected] of Object.entries(FILES)) {
  const dest = path.join(targetDir, name);
  if (await existingMatches(dest, expected)) {
    console.log(`[embedding-model] ${name}: present`);
    continue;
  }

  const url = `https://huggingface.co/${REPO}/resolve/${REVISION}/${name}`;
  console.log(`[embedding-model] ${name}: downloading`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[embedding-model] ${name}: HTTP ${res.status} from ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const actual = sha256(buf);
  if (actual !== expected) {
    throw new Error(
      `[embedding-model] ${name}: SHA-256 mismatch (expected ${expected}, got ${actual})`
    );
  }

  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(`${dest}.tmp`, buf);
  await rename(`${dest}.tmp`, dest);
}

console.log(`[embedding-model] ready at ${path.relative(process.cwd(), targetDir)}`);
