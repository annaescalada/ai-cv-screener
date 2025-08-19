import { generateCVs } from "../lib/api";

export default function GenerateButton({ setLoading, loading }: { readonly setLoading: (loading: boolean) => void; readonly loading: boolean; }) {
  const handleClick = async () => {
    setLoading(true);
    try {
      setLoading(true);
      await generateCVs();
      alert("✅ CVs generated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to generate CVs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded-lg border border-teal-600 text-teal-600 hover:bg-teal-700 hover:border-teal-700 hover:text-white disabled:opacity-50 transition"
    >
      {loading ? "Generating..." : "Generate CVs"}
    </button>
  );
}
