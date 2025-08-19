type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  sources?: { file: string; url: string }[];
};

export default function ChatMessage({ role, content, sources }: Readonly<ChatMessageProps>) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? "bg-teal-600 text-white rounded-br-none"
            : "bg-white text-gray-900 border rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {sources && sources.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            <p className="font-semibold">Sources:</p>
            <ul className="list-disc list-inside">
              {sources.map((s) => (
                <li key={s.file}>
                  <a
                    href={`/cvs/${s.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-teal-300"
                  >
                    {s.file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
