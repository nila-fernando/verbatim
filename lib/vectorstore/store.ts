import { Index } from "@upstash/vector";
import { DocumentChunk } from "@/lib/pdf/chunker";

interface ChunkMetadata {
  [key: string]: unknown;
  document: string;
  page: number;
  text: string;
}

let _index: Index<ChunkMetadata> | null = null;

function getIndex(): Index<ChunkMetadata> {
  if (!_index) {
    _index = new Index<ChunkMetadata>({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }
  return _index;
}

export const vectorStore = {
  async add(chunks: DocumentChunk[], embeddings: number[][]): Promise<void> {
    const index = getIndex();
    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: embeddings[i],
      metadata: {
        document: chunk.metadata.document,
        page: chunk.metadata.page,
        text: chunk.text,
      },
    }));

    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      await index.upsert(vectors.slice(i, i + batchSize));
    }
  },

  async search(queryEmbedding: number[], topK: number = 5): Promise<DocumentChunk[]> {
    const index = getIndex();
    const results = await index.query<ChunkMetadata>({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return results
      .filter((r) => r.metadata)
      .map((r) => ({
        id: r.id as string,
        text: r.metadata!.text,
        metadata: {
          document: r.metadata!.document,
          page: r.metadata!.page,
        },
      }));
  },

  async getDocumentNames(): Promise<string[]> {
    const index = getIndex();
    const info = await index.info();
    return info.vectorCount > 0 ? ["(documents stored)"] : [];
  },

  async getChunkCount(): Promise<number> {
    const index = getIndex();
    const info = await index.info();
    return info.vectorCount;
  },

  async clear(): Promise<void> {
    const index = getIndex();
    await index.reset();
  },
};
