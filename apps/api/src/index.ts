import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cvsRoutes from "./routes/generate";
import ragRoutes from "./routes/rag";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
}));

app.use("/cvs", cvsRoutes);
app.use("/rag", ragRoutes);

app.listen(3000, () => {
  console.log("🚀 API running at http://localhost:3000");
});
