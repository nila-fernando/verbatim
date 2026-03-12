"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, type Message } from "./ChatMessage";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";

const EXAMPLE_PROMPTS = [
  "generate 5 quiz questions",
  "summarise this pdf",
  "what are the key concepts?",
  "explain this like i'm 5",
  "list all definitions",
  "what's on the exam?",
];

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      const content = response.ok
        ? data.answer || "No answer returned."
        : data.error || `Request failed (${response.status})`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content,
          sources: response.ok ? data.sources : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Network error — could not reach the server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Scrollable messages */}
      <div className="flex-1 space-y-6 overflow-y-auto py-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-6 text-sm text-white/25">
              ask anything about your documents
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/40 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white/60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="w-fit max-w-[70%] rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/40">
            thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt input pinned to bottom */}
      <div className="shrink-0 pt-3">
        <PromptInputBox
          onSend={sendMessage}
          isLoading={loading}
          placeholder="ask about your documents..."
        />
      </div>
    </div>
  );
}
