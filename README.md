# Verbatim
(aka the TA that actually read everything)

Upload your lecture slides, research papers, or course notes. Ask anything and verbatim finds the answer and cites the exact page it came from.
Live demo: verbatim-three.vercel.app

## How it Works

1. Ingestion: PDFs are parsed, split into overlapping text chunks and embedded using OpenAI's text-embedding-3-small model (1536 dimensions).
2. Storage: Embeddings are stored in an Upstash Vector index with cosine similarity.
3. Retrieval: At query time, the user's question is embedded and the top-5 most similar chunks are retrieved.
4. Generation: GPT-4o-mini generates an answer grounded strictly in the retrieved context, with inline citations linked to the source page.
5. Quiz mode: Natural language intent detection triggers structured quiz generation from the retrieved chunks.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Framer Motion, Lottie
- **AI:** OpenAI GPT-4o-mini (generation)
- **Vector DB:** Upstash Vector

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file:

```
OPENAI_API_KEY=sk-your-openai-api-key
UPSTASH_VECTOR_REST_URL=https://your-index.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-token
```

**OpenAI** — get a key at [platform.openai.com](https://platform.openai.com)

**Upstash Vector** — create a free index at [console.upstash.com](https://console.upstash.com):
- Dimensions: `1536`
- Similarity metric: `Cosine`

### 3. Run the dev server

```bash
npm run dev
```

## Features

### PDF Upload
- Drag-and-drop or file picker

### Question Answering (RAG :D)
- GPT-4o-mini generates grounded answers with inline citations
- Clickable citations open the PDF at the cited page

### Quiz Generation
- Detected automatically from natural language (e.g. "generate 5 quiz questions")
- Generates questions based on context

## Design decisions

- Chunking with overlap: chunks share context across boundaries to avoid cutting off relevant passages mid-sentence.
- Cosine similarity over dot product: normalised similarity works better across documents of varying length.
- GPT-4o-mini for generation: fast and cost-efficient for a retrieval-augmented task where the heavy lifting is done at the retrieval stage.
- Upstash Vector: serverless, no cold starts, integrates cleanly with Vercel's edge runtime.
