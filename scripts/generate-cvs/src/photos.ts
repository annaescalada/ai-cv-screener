import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const PHOTOS_DIR = path.resolve(__dirname, "../../../data/cvs/photos");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toSafeFilename(name: string | undefined, fallback = "candidate") {
  const base =
    (name ?? fallback)
      .normalize("NFKD")
      .replace(/[^\w\s.-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 80) || fallback;
  return `${base}.png`;
}

async function withRetry<T>(fn: () => Promise<T>, max = 3) {
  let attempt = 0;
  let lastErr: any;
  while (attempt < max) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.status || err?.response?.status;
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = Math.min(2000 * 2 ** attempt, 10000);
        console.warn(`⚠️ Error ${status}, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function generatePhoto(cv: any) {
  ensureDir(PHOTOS_DIR);

  const prompt = `
Create a fictional, AI-generated professional headshot. 
Realistic, business-casual, neutral background, studio lighting.

Do NOT include any text, watermark, signature, name, or footer in the image.
Do NOT resemble any real person.

Profile (JSON):
${JSON.stringify(cv, null, 2)}
`.trim();

  const result = await withRetry(async () =>
    client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    })
  );

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data returned (b64_json missing).");

  const buffer = Buffer.from(b64, "base64");
  const fileName = toSafeFilename(cv?.name);
  const filePath = path.join(PHOTOS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  console.log(`✅ Saved photo: ${filePath}`);
  return filePath;
}
