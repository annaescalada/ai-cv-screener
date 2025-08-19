import * as lancedb from "@lancedb/lancedb";
import path from "path";

const DB_DIR = path.resolve(__dirname, "../../../data/embeddings");

let _db: lancedb.Connection | null = null;

export async function getDB() {
  _db ??= await lancedb.connect(DB_DIR);
  return _db;
}
