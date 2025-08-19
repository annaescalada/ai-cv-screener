import { useState } from "react";

type ChatBoxProps = {
    readonly loading: boolean;
    readonly onSend: (msg: string) => void;
}

export function ChatBox({ loading, onSend }: ChatBoxProps) {
    const [value, setValue] = useState("");

    return (
        <form
            className="flex gap-2 p-4 border-t"
            onSubmit={(e) => {
                e.preventDefault();
                if (!value.trim()) return;
                onSend(value);
                setValue("");
            }}
        >
            <input
                type="text"
                className="flex-1 border rounded p-2"
                placeholder="Ask about the CVs..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button
                disabled={loading}
                type="submit" className="bg-teal-00 text-white px-4 rounded">
                Send
            </button>
        </form>
    );
}
