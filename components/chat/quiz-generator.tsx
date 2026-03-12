"use client";

import { useState } from "react";
import { BrainCircuit, Loader2, ListChecks, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export function QuizGenerator() {
  const [prompt, setPrompt] = useState("Generate 5 exam questions");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Request failed (${response.status})`);
      } else if (data.questions) {
        setError(null);
        setQuestions(data.questions);
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="h-5 w-5" />
          Quiz Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Generate 5 exam questions about search algorithms"
            className="min-h-[44px] max-h-[80px] resize-none"
            rows={1}
          />
          <Button
            onClick={generateQuiz}
            disabled={!prompt.trim() || loading}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {questions.length > 0 && (
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <ListChecks className="h-4 w-4" />
                Generated Questions
              </div>
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-md border p-3 text-sm"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {questions.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <BrainCircuit className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Generate quiz questions from your documents.</p>
            <p className="text-xs mt-1">
              Questions are grounded in uploaded content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
