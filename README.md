# Verbatim

Upload lecture slides and study notes as PDFs, ask questions and generate quizzes. All answers cite exact source pages using retrieval augmented generation (RAG).

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

## Features

### PDF Upload

- Upload one or more PDFs via drag-and-drop or file picker
- Text extraction with page number preservation
- Automatic chunking (~500 tokens per chunk with overlap)
- Embedding generation and vector storage

### Question Answering

- Ask questions about your uploaded documents
- Responses include inline citations with document name and page number

### Quiz Generation

- Generate exam-style questions grounded in your document content
- Customizable prompts (e.g., "Generate 5 questions about search algorithms")
