import { generateCV } from "./generate";
import { generatePhoto } from "./photos";
import { renderCVToHTML, saveAsPDF } from "./render";

const NUM_CVS = 1;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`Generating ${NUM_CVS} CVs with OpenAI...`);
  let generated = 0;

  while (generated < NUM_CVS) {
    try {
      console.log(`\n➡️  [${generated + 1}/${NUM_CVS}] Generating CV...`);
      const cv = await generateCV(generated);

      console.log("🖼️  Generating photo...");
      const photoPath = await generatePhoto(cv);
      cv.photoUrl = photoPath;

      console.log("🧱 Rendering HTML + PDF...");
      const html = renderCVToHTML(cv);
      await saveAsPDF(html, cv, generated);

      generated++;
      await sleep(5000);
    } catch (err) {
      console.error("❌ Error generating CV, retrying...", err);
      await sleep(5000);
    }
  }

  console.log("\n🎉 Done!");
}

main();
