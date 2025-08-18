import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const CVS_DIR = path.resolve(__dirname, "../../../data/cvs");

const TITLES: Record<
  "English" | "Spanish" | "French" | "German" | "Catalan",
  { summary: string; experience: string; skills: string; education: string }
> = {
  English: {
    summary: "Summary",
    experience: "Experience",
    skills: "Skills",
    education: "Education",
  },
  Spanish: {
    summary: "Resumen",
    experience: "Experiencia",
    skills: "Habilidades",
    education: "Educación",
  },
  French: {
    summary: "Résumé",
    experience: "Expérience",
    skills: "Compétences",
    education: "Formation",
  },
  German: {
    summary: "Zusammenfassung",
    experience: "Berufserfahrung",
    skills: "Fähigkeiten",
    education: "Ausbildung",
  },
  Catalan: {
    summary: "Resum",
    experience: "Experiència",
    skills: "Habilitats",
    education: "Formació",
  },
};

function getTitles(lang: string | undefined) {
  const key =
    (lang?.trim() as keyof typeof TITLES) && TITLES[lang as keyof typeof TITLES]
      ? (lang!.trim() as keyof typeof TITLES)
      : ("English" as const);
  return TITLES[key];
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function photoToDataUrl(photoPath?: string): string {
  try {
    if (!photoPath) return "";
    const bytes = fs.readFileSync(photoPath);
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return "";
  }
}

export function renderCVToHTML(cv: any): string {
  const titles = getTitles(cv?.lang);
  const photoDataUrl = photoToDataUrl(cv?.photoUrl);

  const expItems = (cv.experience ?? [])
    .map(
      (e: any) => `
      <li>
        <strong>${escapeHtml(e.title)}</strong> — ${escapeHtml(e.company)}<br/>
        <em>${escapeHtml(e.dates)}</em><br/>
        <span>${escapeHtml(e.description)}</span>
      </li>`
    )
    .join("");

  const eduItems = (cv.education ?? [])
    .map(
      (e: any) => `
      <li>
        <strong>${escapeHtml(e.degree)}</strong> — ${escapeHtml(e.institution)} (${escapeHtml(e.year)})
      </li>`
    )
    .join("");

  const skills = Array.isArray(cv.skills)
    ? cv.skills.map(escapeHtml).join(", ")
    : "";

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
      h1 { margin: 0; font-size: 24px; }
      h2 { margin-top: 20px; font-size: 18px; }
      .header { display: flex; gap: 20px; align-items: center; }
      .header img { border-radius: 50%; width: 120px; height: 120px; object-fit: cover; }
      ul { padding-left: 18px; }
      p { margin: 8px 0; line-height: 1.4; }
      .muted { color: #666; }
    </style>
  </head>
  <body>
    <div class="header">
      ${photoDataUrl ? `<img src="${photoDataUrl}" alt="photo" />` : ""}
      <div>
        <h1>${escapeHtml(cv.name)}</h1>
        <p class="muted">${escapeHtml(cv.role)} — ${escapeHtml(cv.location)}</p>
        <p class="muted">${escapeHtml(cv.email)} | ${escapeHtml(cv.phone)}</p>
      </div>
    </div>

    <h2>${titles.summary}</h2>
    <p>${escapeHtml(cv.summary)}</p>

    <h2>${titles.experience}</h2>
    <ul>${expItems}</ul>

    <h2>${titles.skills}</h2>
    <p>${skills}</p>

    <h2>${titles.education}</h2>
    <ul>${eduItems}</ul>
  </body>
  </html>`;
}

export async function saveAsPDF(html: string, cv: any, index: number) {
  if (!fs.existsSync(CVS_DIR)) fs.mkdirSync(CVS_DIR, { recursive: true });

  const safeName =
    String(cv.name || "candidate")
      .normalize("NFKD")
      .replace(/[^\w\s.-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "candidate";

  const filePath = path.join(CVS_DIR, `cv_${index + 1}_${safeName}.pdf`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({ path: filePath, format: "A4", printBackground: true });
  await browser.close();

  console.log(`📄 Saved PDF: ${filePath}`);
}
