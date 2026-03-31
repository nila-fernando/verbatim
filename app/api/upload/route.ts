import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf/extract";
import { chunkDocument } from "@/lib/pdf/chunker";
import { generateEmbeddings } from "@/lib/embeddings/openai";
import { vectorStore } from "@/lib/vectorstore/store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const sessionId = formData.get("sessionId");

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      if (file.type !== "application/pdf") {
        results.push({
          filename: file.name,
          status: "error",
          message: "Not a PDF file",
        });
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const extraction = await extractTextFromPDF(buffer, file.name);
        const chunks = chunkDocument(extraction);
        const embeddings = await generateEmbeddings(chunks.map((c) => c.text));

        await vectorStore.add(chunks, embeddings, sessionId);

        results.push({
          filename: file.name,
          status: "success",
          pages: extraction.totalPages,
          chunks: chunks.length,
        });
      } catch (fileError: unknown) {
        const message =
          fileError instanceof Error ? fileError.message : "Processing failed";
        const isQuota =
          message.includes("quota") || message.includes("429");
        results.push({
          filename: file.name,
          status: "error",
          message: isQuota
            ? "OpenAI API quota exceeded — check your billing"
            : message.length > 100
              ? message.slice(0, 100) + "..."
              : message,
        });
      }
    }

    const totalChunks = await vectorStore.getChunkCount(sessionId);

    return NextResponse.json({
      message: "Upload complete",
      results,
      totalChunks,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
