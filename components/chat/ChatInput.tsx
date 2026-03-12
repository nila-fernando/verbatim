"use client";

import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ask about your documents..."
        rows={1}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-white/70 disabled:opacity-20"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
