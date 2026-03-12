"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Source {
  document: string;
  page: number;
  excerpt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        sources: response.ok ? data.sources : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          Ask Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
        <ScrollArea className="flex-1 pr-3" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Bot className="mb-3 h-12 w-12 opacity-40" />
                <p className="text-sm">
                  Upload documents and ask questions.
                </p>
                <p className="text-xs mt-1">
                  Answers will cite exact source pages.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="ml-11 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Sources:
                    </p>
                    {msg.sources.map((source, i) => (
                      <div
                        key={i}
                        className="rounded-md border bg-card p-2.5 text-xs"
                      >
                        <div className="mb-1 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-primary" />
                          <span className="font-medium">
                            {source.document}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Page {source.page}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground italic leading-relaxed">
                          &ldquo;{source.excerpt}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
