"use client";

export interface Source {
  document: string;
  page: number;
  excerpt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ChatMessageProps {
  message: Message;
  pdfUrls?: Record<string, string>;
}

export function ChatMessage({ message, pdfUrls = {} }: ChatMessageProps) {
  const isUser = message.role === "user";

  const handleSourceClick = (source: Source) => {
    const url = pdfUrls[source.document];
    if (url) {
      window.open(`${url}#page=${source.page}`, "_blank");
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`w-fit max-w-[70%] break-words whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "ml-auto bg-white/10 text-white"
            : "bg-white/5 text-gray-200"
        }`}
      >
        {message.content}
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="space-y-1">
          {message.sources.map((source, i) => {
            const hasUrl = !!pdfUrls[source.document];
            return (
              <p
                key={i}
                className={`text-xs text-white/30 ${
                  hasUrl
                    ? "cursor-pointer transition-colors hover:text-white/50"
                    : ""
                }`}
                onClick={hasUrl ? () => handleSourceClick(source) : undefined}
              >
                <span className={hasUrl ? "underline underline-offset-2 decoration-white/20" : ""}>
                  {source.document} · page {source.page}
                </span>
                {source.excerpt && (
                  <span className="ml-1 text-white/20">
                    — &ldquo;{source.excerpt.length > 80 ? source.excerpt.slice(0, 80) + "..." : source.excerpt}&rdquo;
                  </span>
                )}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
