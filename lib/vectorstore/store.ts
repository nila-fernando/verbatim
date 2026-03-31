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
  async add(
    chunks: DocumentChunk[],
    embeddings: number[][],
    sessionId: string
  ): Promise<void> {
    const ns = getIndex().namespace(sessionId);
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
      await ns.upsert(vectors.slice(i, i + batchSize));
    }
  },

  async search(
    queryEmbedding: number[],
    sessionId: string,
    topK: number = 5
  ): Promise<DocumentChunk[]> {
    const ns = getIndex().namespace(sessionId);
    const results = await ns.query<ChunkMetadata>({
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

  async getChunkCount(sessionId: string): Promise<number> {
    const info = await getIndex().info();
    return info.namespaces[sessionId]?.vectorCount ?? 0;
  },

  async clear(sessionId: string): Promise<void> {
    await getIndex().namespace(sessionId).reset();
  },
};
