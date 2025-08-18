import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const LANGS = ["English", "Spanish", "French", "German", "Catalan"] as const;
const ROLES = [
  "Backend Engineer",
  "Frontend Engineer",
  "Data Scientist",
  "Product Manager",
  "QA Engineer",
] as const;
const INDUSTRIES = [
  "fintech",
  "e-commerce",
  "healthtech",
  "AI startup",
] as const;
const SENIORITIES = ["Junior", "Mid", "Senior"] as const;
const LOCATIONS = [
  "Barcelona, Spain",
  "Berlin, Germany",
  "New York, USA",
  "Mexico City, Mexico",
  "Paris, France",
] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function withRetry<T>(fn: () => Promise<T>, max = 3): Promise<T> {
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
        console.warn(`Error ${status}, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function generateCV(_index: number) {
  const lang = randomItem(LANGS);
  const role = randomItem(ROLES);
  const industry = randomItem(INDUSTRIES);
  const seniority = randomItem(SENIORITIES);
  const location = randomItem(LOCATIONS);

  const system = `
You generate realistic but fictional CVs as JSON only.
Rules:
- Output must be valid JSON. No markdown, no explanations.
- Use ${lang} for all text.
- Contact info must be plausible but fake:
  * email like first.last@example.com
  * phone formatted for the region but unassigned (e.g. +34 600 123 456)
- Make the experience coherent for a ${seniority} ${role} in ${industry}, based in ${location}.
- Strict structure exactly as specified.
`.trim();

  const user = `
Return a JSON with the exact structure:

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",
  "experience": [
    {"title": "string", "company": "string", "dates": "string", "description": "string"},
    {"title": "string", "company": "string", "dates": "string", "description": "string"},
    {"title": "string", "company": "string", "dates": "string", "description": "string"}
  ],
  "skills": ["string","string","string","string","string","string"],
  "education": [
    {"degree": "string", "institution": "string", "year": "string"},
    {"degree": "string", "institution": "string", "year": "string"}
  ]
}
`.trim();

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.8,
    })
  );

  const jsonText = completion.choices[0]?.message?.content ?? "{}";
  const cv = JSON.parse(jsonText);

  cv.role = `${seniority} ${role}`;
  cv.location = location;
  cv.lang = lang;

  return cv;
}
