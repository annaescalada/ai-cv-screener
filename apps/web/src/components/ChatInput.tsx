import { useState } from "react";

type ChatInputProps = {
  readonly onSend: (message: string) => void;
  readonly loading?: boolean;
};

export default function ChatInput({ loading, onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t bg-white flex items-center gap-2"
    >
      <input
        type="text"
        value={message}
        disabled={loading}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Send a message..."
        className="flex-1 p-3 border rounded-xl focus:outline-none disabled:opacity-50 bg-gray-50"
      />
      <button
        type="submit"
        disabled={loading}
        className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center"
      >
        Send
      </button>
    </form>
  );
}


