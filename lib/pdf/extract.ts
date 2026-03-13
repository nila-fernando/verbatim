import { extractText } from "unpdf";

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFExtraction {
  filename: string;
  pages: PDFPage[];
  totalPages: number;
}

export async function extractTextFromPDF(
  buffer: Buffer,
  filename: string
): Promise<PDFExtraction> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: false,
  });

  const pages: PDFPage[] = (text as string[])
    .map((pageText, i) => ({
      pageNumber: i + 1,
      text: pageText.trim(),
    }))
    .filter((page) => page.text.length > 0);

  return {
    filename,
    pages,
    totalPages,
  };
}
