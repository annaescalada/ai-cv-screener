import express from "express";
import { generateAndSaveCVs } from "../services/generate-cvs";

const router = express.Router();

router.post("/generate", async (_req, res) => {
  try {
    const result = await generateAndSaveCVs();
    res.status(200).json({ ok: true, generated: result });
  } catch (err) {
    console.error("❌ Error generating CVs:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

export default router;
