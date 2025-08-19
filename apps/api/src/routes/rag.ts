import express from "express";
import { processCVs } from "../services/rag/process";
import { queryCVs } from "../services/rag/query";

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

router.post("/query", async (req, res) => {
  const { question } = req.body;
  try {
    const result = await queryCVs(question);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;
