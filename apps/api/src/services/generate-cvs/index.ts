import { generateCV } from "./text";
import { generatePhoto } from "./photos";
import { renderCVToHTML, saveAsPDF } from "./render";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function generateAndSaveCVs(num: number = 1) {
  let generated = 0;

  while (generated < num) {
    try {
      console.log(`\n➡️  [${generated + 1}/${num}] Generating CV...`);
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
      console.error("❌ Error, retrying...", err);
      await sleep(5000);
    }
  }

  console.log("\n🎉 All CVs generated!");
}
