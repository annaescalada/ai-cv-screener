import express from "express";
import { processCVs } from "../services/rag/process";

const router = express.Router();

router.post("/process", async (_req, res) => {
  try {
    await processCVs();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;
