"use client";

import { useState } from "react";

interface QuizPromptProps {
  onQuizGenerated: (questions: string[]) => void;
}

export function QuizPrompt({ onQuizGenerated }: QuizPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    const text = prompt.trim() || "Generate 5 exam questions";
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        onQuizGenerated([`Error: ${data.error || `Request failed (${response.status})`}`]);
      } else if (data.questions) {
        onQuizGenerated(data.questions);
      }
    } catch {
      onQuizGenerated(["Error: Network error — could not reach the server."]);
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.04] pb-3 mb-3">
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="generate quiz questions..."
        className="flex-1 bg-transparent text-sm text-white/60 placeholder:text-white/25 outline-none"
      />
      <button
        onClick={generate}
        disabled={loading}
        className="shrink-0 text-xs text-white/30 transition-colors hover:text-white/60 disabled:opacity-30"
      >
        {loading ? "generating..." : "generate"}
      </button>
    </div>
  );
}
