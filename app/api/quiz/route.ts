import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/rag/pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, sessionId } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const result = await generateQuiz(prompt, sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Quiz error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate quiz";
    const isQuota = message.includes("quota") || message.includes("429");
    return NextResponse.json(
      {
        error: isQuota
          ? "OpenAI API quota exceeded. Please check your API key billing at platform.openai.com"
          : message,
      },
      { status: 500 }
    );
  }
}
