import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const port = 3001;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
