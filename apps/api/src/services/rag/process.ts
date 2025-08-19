import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import OpenAI from "openai";
import { getDB } from "../../utils/lancedb";

import {
  Schema as ArrowSchema,
  Field,
  Utf8,
  Int32,
  Float32,
  FixedSizeList,
} from "apache-arrow";

const DATA_DIR = path.resolve(__dirname, "../../../data/cvs");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const EMBEDDING_MODEL = "text-embedding-3-small";
const VECTOR_DIMS = 1536;

async function embedText(text: string) {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

function chunkText(text: string, size = 800, overlap = 120) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

export async function processCVs() {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error("No CVs found in data/cvs");
  }

  const db = await getDB();

  const schema = new ArrowSchema([
    new Field("text", new Utf8(), false),
    new Field(
      "vector",
      new FixedSizeList(VECTOR_DIMS, new Field("item", new Float32(), false)),
      false
    ),
    new Field("source", new Utf8(), false),
    new Field("chunkIndex", new Int32(), false),
  ]);

  const table = await db.createTable("cvs", [], { mode: "overwrite", schema });

  let totalAdded = 0;

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".pdf"));
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdf(buffer);

    const chunks = chunkText(parsed.text);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embedding = await embedText(chunk);

      const vector = Array.from(Float32Array.from(embedding));

      await table.add([
        {
          text: chunk,
          vector,
          source: file,
          chunkIndex: i,
        },
      ]);

      totalAdded++;
    }

    console.log(`📥 Ingested ${file} (${chunks.length} chunks)`);
  }

  const sample = await table.query().limit(3).toArray();
  console.log("🔍 Sample rows:");
  sample.forEach((r: any, idx: number) => {
    console.log(`[${idx + 1}]`, {
      source: r.source,
      chunkIndex: r.chunkIndex,
      text: (r.text ?? "").slice(0, 90) + "…",
      hasVector: Array.isArray(r.vector) && r.vector.length === VECTOR_DIMS,
    });
  });
}
