import OpenAI from "openai";
import { getDB } from "../../utils/lancedb";

const EMBEDDING_MODEL = "text-embedding-3-small";
const CHAT_MODEL = "gpt-4o-mini";
const TOP_K = 5;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function embed(text: string) {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function queryCVs(question: string) {
  const db = await getDB();
  const table = await db.openTable("cvs");
  const queryEmbedding = await embed(question);

  const hits = await table.search(queryEmbedding).limit(TOP_K).toArray();

  const contextBlocks = hits.map(
    (h: any, i: number) => `
### Fragment ${i + 1}
Source: ${h.source} (chunk ${h.chunkIndex})
Text:
${h.text}`
  );

  const system = `You are a helpful recruitment assistant.
Answer the question ONLY using the context fragments.
If the answer is not present, reply with: "Not found".
Do not make up sources; sources will be attached separately.
ALWAYS respond in the same language as the user’s question, if not identified then reply in English.`;

  const user = `Question: ${question}

Context fragments:
${contextBlocks.join("\n\n")}`;

  const chat = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.0,
  });

  const answer = chat.choices[0]?.message?.content ?? "No response";

  const sources = [
    ...new Map(
      hits.map((h: any) => [
        h.source,
        { file: h.source, url: `http://localhost:3000/files/${h.source}` },
      ])
    ).values(),
  ];

  return { answer, sources };
}
