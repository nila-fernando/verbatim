import { PDFParse } from "pdf-parse";

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
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const textResult = await parser.getText();

  const pages: PDFPage[] = textResult.pages
    .map((page) => ({
      pageNumber: page.num,
      text: page.text.trim(),
    }))
    .filter((page) => page.text.length > 0);

  const totalPages = textResult.total;

  await parser.destroy();

  return {
    filename,
    pages,
    totalPages,
  };
}
