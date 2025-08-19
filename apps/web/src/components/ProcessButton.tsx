import { processCVs } from "../lib/api";

export default function ProcessButton({ loading, setLoading }: { readonly loading: boolean; readonly setLoading: (loading: boolean) => void; }) {

  const handleClick = async () => {
    try {
      setLoading(true);
      const res= await processCVs();
      console.log("Processing result:", res);
      alert("CVs processed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to process CVs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : "Process CVs"}
    </button>
  );
}
