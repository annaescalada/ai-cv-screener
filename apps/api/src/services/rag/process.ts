import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import OpenAI from "openai";
import { getDB } from "../../utils/lancedb";

const DATA_DIR = path.resolve(__dirname, "../../../data/cvs");
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIM = 1536;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function embedText(text: string) {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return Float32Array.from(res.data[0].embedding);
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
    throw new Error("❌ No CVs found in data/cvs");
  }

  const db = await getDB();

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".pdf"));
  if (!files.length) throw new Error("❌ No PDF files in data/cvs");

  let table: any = null;
  let firstRecordWritten = false;
  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdf(buffer);

    const chunks = chunkText(parsed.text);
    let idx = 0;

    for (const raw of chunks) {
      const text = raw.replace(/\s+/g, " ").trim();
      if (!text) continue;

      const embedding = await embedText(text);
      const record = {
        text,
        source: file,
        chunkIndex: idx,
        embedding,
      };

      if (!firstRecordWritten) {
        table = await db.createTable("cvs", [record], { mode: "overwrite" });
        firstRecordWritten = true;
      } else {
        await table.add([record]);
      }

      idx++;
      totalChunks++;
    }

    console.log(`📥 Ingested ${file} (${chunks.length} chunks)`);
  }

  const rowCount = await table.countRows();
  console.log(
    `✅ LanceDB 'cvs' done. Rows: ${rowCount} (added ${totalChunks})`
  );
}
