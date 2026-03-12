import { PDFExtraction } from "./extract";

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    document: string;
    page: number;
  };
}

const APPROX_CHARS_PER_TOKEN = 4;
const TARGET_TOKENS = 500;
const TARGET_CHARS = TARGET_TOKENS * APPROX_CHARS_PER_TOKEN;
const OVERLAP_CHARS = 200;

export function chunkDocument(extraction: PDFExtraction): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const page of extraction.pages) {
    const text = page.text;

    if (text.length <= TARGET_CHARS) {
      chunks.push({
        id: `${extraction.filename}-p${page.pageNumber}-c${chunkIndex++}`,
        text,
        metadata: {
          document: extraction.filename,
          page: page.pageNumber,
        },
      });
      continue;
    }

    let start = 0;
    while (start < text.length) {
      let end = start + TARGET_CHARS;

      if (end < text.length) {
        const sentenceEnd = text.lastIndexOf(". ", end);
        if (sentenceEnd > start + TARGET_CHARS * 0.5) {
          end = sentenceEnd + 1;
        }
      } else {
        end = text.length;
      }

      chunks.push({
        id: `${extraction.filename}-p${page.pageNumber}-c${chunkIndex++}`,
        text: text.slice(start, end).trim(),
        metadata: {
          document: extraction.filename,
          page: page.pageNumber,
        },
      });

      start = end - OVERLAP_CHARS;
      if (start < 0) start = 0;
      if (end >= text.length) break;
    }
  }

  return chunks;
}
