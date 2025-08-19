import { useState } from "react";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import ProcessButton from "../components/ProcessButton";
import GenerateButton from "../components/GenerateButton";
import { queryCVs } from "../lib/api";

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: { file: string; url: string }[];
};

export default function ChatPage() {
    const [isGenerateLoading, setIsGenerateLoading] = useState(false);
    const [isProcessLoading, setIsProcessLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = async (text: string) => {
        const userMessage: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const res = await queryCVs(text);
            const assistantMessage: Message = {
                role: "assistant",
                content: res.answer,
                sources: res.sources || [],
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Error fetching response" },
            ]);
        }
    };

    const isLoading = isGenerateLoading || isProcessLoading;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="p-4 border-b bg-white flex justify-between items-center gap-2 shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">; AI CV Screener</h1>
                <div className="flex gap-2">
                    <GenerateButton loading={isGenerateLoading} setLoading={setIsGenerateLoading} />
                    <ProcessButton loading={isProcessLoading} setLoading={setIsProcessLoading} />
                </div>
            </header>

            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-xs">
                    <div className="animate-spin rounded-full h-16 w-16 border-8 border-gray-300 border-t-teal-600"></div>
                </div>
            )}


            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <ChatMessage key={`${m.role}-${i}-${m.content.slice(0, 20)}`} {...m} />
                ))}
            </main>

            <ChatInput loading={isLoading} onSend={handleSend} />
        </div>
    );
}
