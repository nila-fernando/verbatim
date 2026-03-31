import OpenAI from "openai";
import { generateEmbedding } from "@/lib/embeddings/openai";
import { vectorStore } from "@/lib/vectorstore/store";
import { DocumentChunk } from "@/lib/pdf/chunker";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface Source {
  document: string;
  page: number;
  excerpt: string;
}

export interface QueryResult {
  answer: string;
  sources: Source[];
}

export interface QuizResult {
  questions: string[];
}

function buildQueryPrompt(question: string, chunks: DocumentChunk[]): string {
  const context = chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.metadata.document}, Page ${c.metadata.page}]\n${c.text}`
    )
    .join("\n\n");

  return `You are a helpful academic assistant. Answer the user's question using ONLY the provided context. If the context does not contain enough information to answer, say so clearly.

Rules:
- Only use information from the provided context
- Cite the document name and page number for every claim
- Use the format (DocumentName, Page X) for inline citations
- Do not make up information or hallucinate
- Be concise and accurate

Context:
${context}

Question: ${question}

Respond in JSON format:
{
  "answer": "Your detailed answer with inline citations like (DocumentName, Page X)",
  "sources": [
    {
      "document": "filename.pdf",
      "page": 1,
      "excerpt": "The exact text excerpt from the context that supports your answer"
    }
  ]
}

Return ONLY valid JSON. Include all sources that were used in your answer. The excerpt field must contain the actual text from the context, not a summary.`;
}

function buildQuizPrompt(prompt: string, chunks: DocumentChunk[]): string {
  const context = chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.metadata.document}, Page ${c.metadata.page}]\n${c.text}`
    )
    .join("\n\n");

  return `You are an academic quiz generator. Generate exam-style questions based ONLY on the provided context.

Rules:
- Questions must be answerable using the provided context
- Mix question types: factual recall, conceptual understanding, and application
- Do not generate questions about topics not covered in the context
- Make questions clear and specific

Context:
${context}

User request: ${prompt}

Respond in JSON format:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}

Return ONLY valid JSON.`;
}

export async function queryDocuments(
  question: string,
  sessionId: string
): Promise<QueryResult> {
  const queryEmbedding = await generateEmbedding(question);
  const relevantChunks = await vectorStore.search(queryEmbedding, sessionId, 5);

  if (relevantChunks.length === 0) {
    return {
      answer:
        "No documents have been uploaded yet. Please upload some PDFs first.",
      sources: [],
    };
  }

  const prompt = buildQueryPrompt(question, relevantChunks);

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from model");
  }

  const parsed = JSON.parse(content) as QueryResult;

  if (!parsed.sources || parsed.sources.length === 0) {
    parsed.sources = relevantChunks.slice(0, 3).map((chunk) => ({
      document: chunk.metadata.document,
      page: chunk.metadata.page,
      excerpt:
        chunk.text.length > 300
          ? chunk.text.slice(0, 300) + "..."
          : chunk.text,
    }));
  }

  return parsed;
}

export async function generateQuiz(
  prompt: string,
  sessionId: string
): Promise<QuizResult> {
  const queryEmbedding = await generateEmbedding(prompt);
  const relevantChunks = await vectorStore.search(queryEmbedding, sessionId, 10);

  if (relevantChunks.length === 0) {
    return {
      questions: [
        "No documents have been uploaded yet. Please upload some PDFs first.",
      ],
    };
  }

  const systemPrompt = buildQuizPrompt(prompt, relevantChunks);

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: systemPrompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from model");
  }

  return JSON.parse(content) as QuizResult;
}
