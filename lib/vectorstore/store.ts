import { DocumentChunk } from "@/lib/pdf/chunker";

interface StoredVector {
  chunk: DocumentChunk;
  embedding: number[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class InMemoryVectorStore {
  private vectors: StoredVector[] = [];

  add(chunks: DocumentChunk[], embeddings: number[][]): void {
    for (let i = 0; i < chunks.length; i++) {
      this.vectors.push({
        chunk: chunks[i],
        embedding: embeddings[i],
      });
    }
  }

  search(queryEmbedding: number[], topK: number = 5): DocumentChunk[] {
    if (this.vectors.length === 0) return [];

    const scored = this.vectors.map((v) => ({
      chunk: v.chunk,
      score: cosineSimilarity(queryEmbedding, v.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.chunk);
  }

  getDocumentNames(): string[] {
    const names = new Set(this.vectors.map((v) => v.chunk.metadata.document));
    return Array.from(names);
  }

  getChunkCount(): number {
    return this.vectors.length;
  }

  clear(): void {
    this.vectors = [];
  }
}

// Singleton instance persists across API calls during the server's lifetime
export const vectorStore = new InMemoryVectorStore();
