import { NextRequest, NextResponse } from "next/server";
import { queryDocuments } from "@/lib/rag/pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const result = await queryDocuments(question);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Query error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process query";
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
