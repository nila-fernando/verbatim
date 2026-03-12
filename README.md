# DocAtlas — AI Document Navigator

Upload lecture slides and study notes as PDFs, ask questions, and generate quizzes. All answers cite exact source pages using retrieval augmented generation (RAG).

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **AI:** OpenAI GPT-4o-mini (responses), text-embedding-3-small (embeddings)
- **Vector Store:** In-memory cosine similarity search
- **PDF Processing:** pdf-parse v2

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
OPENAI_API_KEY=sk-your-actual-api-key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### PDF Upload (`POST /api/upload`)

- Upload one or more PDFs via drag-and-drop or file picker
- Text extraction with page number preservation
- Automatic chunking (~500 tokens per chunk with overlap)
- Embedding generation and vector storage

### Question Answering (`POST /api/query`)

- Ask questions about your uploaded documents
- RAG pipeline: embed query → retrieve top 5 chunks → generate answer
- Responses include inline citations with document name and page number
- Each source includes the actual text excerpt used

### Quiz Generation (`POST /api/quiz`)

- Generate exam-style questions grounded in your document content
- Customizable prompts (e.g., "Generate 5 questions about search algorithms")
- Questions are based on retrieved document chunks

## Project Structure

```
app/
  page.tsx              # Landing page + main app interface
  layout.tsx            # Root layout
  api/
    upload/route.ts     # PDF upload endpoint
    query/route.ts      # RAG question answering endpoint
    quiz/route.ts       # Quiz generation endpoint
components/
  ui/                   # shadcn/ui components + animated gradient
  chat/                 # Chat interface + quiz generator
  upload/               # Upload panel
lib/
  pdf/
    extract.ts          # PDF text extraction
    chunker.ts          # Text chunking with metadata
  embeddings/
    openai.ts           # OpenAI embedding generation
  vectorstore/
    store.ts            # In-memory vector store with cosine similarity
  rag/
    pipeline.ts         # RAG query + quiz generation pipeline
```

## API Reference

### Upload Documents

```
POST /api/upload
Content-Type: multipart/form-data

Body: files (one or more PDF files)
```

### Ask a Question

```
POST /api/query
Content-Type: application/json

{ "question": "What is A* search?" }
```

Response:

```json
{
  "answer": "A* search is an informed search algorithm...",
  "sources": [
    {
      "document": "Lecture6.pdf",
      "page": 14,
      "excerpt": "A heuristic is admissible if it never overestimates..."
    }
  ]
}
```

### Generate Quiz

```
POST /api/quiz
Content-Type: application/json

{ "prompt": "Generate 5 exam questions" }
```

Response:

```json
{
  "questions": [
    "What is an admissible heuristic?",
    "Explain how A* search works",
    "Why must heuristics not overestimate?"
  ]
}
```
