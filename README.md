# Verbatim
(aka the TA that actually read everything)

Upload your lecture slides, research papers, or course notes. Ask anything and verbatim finds the answer and cites the exact page it came from.

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