const API_BASE =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

export async function generateCVs() {
  const res = await fetch(`${API_BASE}/cvs/generate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate CVs");
  return res.json();
}

export async function processCVs() {
  const res = await fetch(`${API_BASE}/rag/process`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to process CVs");
  return res.json();
}

export async function queryCVs(question: string) {
  const res = await fetch(`${API_BASE}/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Query failed");
  return res.json();
}
