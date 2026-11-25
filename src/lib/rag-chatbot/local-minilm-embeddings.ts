import path from "node:path";
import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import type {
  PreTrainedModel,
  PreTrainedTokenizer,
  Tensor,
} from "@huggingface/transformers";

// Self-hosted copy of sentence-transformers/all-MiniLM-L6-v2, run in-process
// with transformers.js (Node runtime only). It must produce the same vectors
// as the HF Inference API so the existing rows in content_chunks stay valid:
// fp32 weights, mean pooling, L2 normalisation, 384 dimensions, and the
// sentence-transformers truncation to 256 tokens.
// Checked with scripts/check-embedding-parity.mjs.

const MODEL_ID = "Xenova/all-MiniLM-L6-v2"; // ONNX export of the same weights
const EMBEDDING_DIM = 384;
// sentence-transformers truncates at 256 tokens; the ONNX port's tokenizer
// config says 512, so it is capped explicitly to match the stored vectors.
const MAX_SEQ_LENGTH = 256;
const BATCH_SIZE = 32;

type Runtime = {
  tokenizer: PreTrainedTokenizer;
  model: PreTrainedModel;
  meanPooling: (hidden: Tensor, mask: Tensor) => Tensor;
};

let runtimePromise: Promise<Runtime> | null = null;

// Loaded once per serverless instance and reused across requests.
function getRuntime(): Promise<Runtime> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      if (process.env.NEXT_RUNTIME === "edge") {
        throw new Error("needs the Node.js runtime (onnxruntime-node), not Edge");
      }
      const { AutoTokenizer, AutoModel, env, mean_pooling } = await import(
        "@huggingface/transformers"
      );
      env.allowRemoteModels = false; // weights are bundled by scripts/download-embedding-model.mjs
      env.allowLocalModels = true;
      env.localModelPath = path.join(process.cwd(), "models");

      const [tokenizer, model] = await Promise.all([
        AutoTokenizer.from_pretrained(MODEL_ID),
        AutoModel.from_pretrained(MODEL_ID, { dtype: "fp32", device: "cpu" }),
      ]);
      tokenizer.model_max_length = MAX_SEQ_LENGTH;
      return { tokenizer, model, meanPooling: mean_pooling };
    })().catch((error: unknown) => {
      runtimePromise = null; // let the next request retry
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Self-hosted embedding model failed to load (${reason}). ` +
          "Run `node scripts/download-embedding-model.mjs`, or set EMBEDDINGS_PROVIDER=hf."
      );
    });
  }
  return runtimePromise;
}

// Tokenise, run the model, mean-pool, L2-normalise. Same steps as the
// transformers.js feature-extraction pipeline, except truncated rows keep
// their closing [SEP]: transformers.js truncates after adding special tokens
// and drops it, whereas sentence-transformers keeps [CLS] + 254 tokens + [SEP].
async function embedBatch(
  { tokenizer, model, meanPooling }: Runtime,
  texts: string[]
): Promise<number[][]> {
  const inputs = tokenizer(texts, { padding: true, truncation: true });

  const [rows, seqLen] = inputs.input_ids.dims as [number, number];
  if (seqLen === MAX_SEQ_LENGTH) {
    const ids = inputs.input_ids.data as BigInt64Array;
    const mask = inputs.attention_mask.data as BigInt64Array;
    const sep = BigInt(tokenizer.sep_token_id);
    for (let r = 0; r < rows; r++) {
      const last = r * seqLen + seqLen - 1;
      if (mask[last] === BigInt(1)) ids[last] = sep; // row filled to the cap
    }
  }

  const outputs = await model(inputs);
  return meanPooling(outputs.last_hidden_state, inputs.attention_mask)
    .normalize(2, -1)
    .tolist() as number[][];
}

export class LocalMiniLMEmbeddings extends Embeddings {
  constructor(params: EmbeddingsParams = {}) {
    // Local inference errors are deterministic; don't retry them with backoff.
    super({ maxRetries: 0, ...params });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const runtime = await getRuntime();
    const vectors: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const rows = await this.caller.call(() => embedBatch(runtime, batch));
      for (const row of rows) {
        if (row.length !== EMBEDDING_DIM) {
          throw new Error(
            `Self-hosted embedding returned ${row.length} dimensions, expected ${EMBEDDING_DIM}`
          );
        }
        vectors.push(row);
      }
    }

    return vectors;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedDocuments([text]);
    return vector;
  }
}
