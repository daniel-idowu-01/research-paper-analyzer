# Research Paper Analyzer

This repository contains the Research Paper Analyzer — a Next.js app that extracts, summarizes, and semantically indexes uploaded research PDFs to provide concise AI-powered insights and searchable content.

## Recent updates (summary)

- Frontend: visual redesign of the hero and upload card for a richer aesthetic. Upload card header alignment and badge positioning improved (grid-based top alignment).
- Authentication: navbar now derives auth state from the persisted user store so login/signup updates immediately.
- Semantic search & indexing: added Pinecone integration and Hugging Face embeddings for semantic indexing and retrieval. Papers are chunked, embedded, and upserted into Pinecone after processing when configured.
- Topic clustering: basic topic candidate extraction and k-means clustering added; clusters are stored on `paper.topic_clusters` and displayed in the paper detail UI.
- Fallback: local text search (analysis and full text) remains available and used when Pinecone is not configured or semantic search fails.

Note: A LangChain-style RAG orchestration has not been implemented yet — the project now provides the retrieval plumbing (embeddings, Pinecone, topic clusters) that you can use to build a RAG flow.

## Features

- Upload PDFs and extract text/metadata
- AI-driven summarization and key-finding extraction
- Semantic indexing (Pinecone) with Hugging Face embeddings
- In-app semantic search fallback to local matches
- Topic candidate extraction and clustering persisted on paper documents
- User authentication, profile, and paper management
- Polished, responsive UI with Tailwind CSS and Radix components

## Tech stack

- Next.js 15, React 19
- TypeScript
- Tailwind CSS, shadcn-ui, Lucide icons
- MongoDB + Mongoose
- Pinecone (optional) for semantic indexing
- Hugging Face Inference (embeddings)

## Quickstart

1. Install dependencies

```bash
npm install
```

2. Create environment file `.env.local` and add required variables (see below).

3. Run dev server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
npm start
```

## Environment variables

Minimum recommended variables:

- `MONGODB_URI` — MongoDB connection URI
- `JWT_SECRET` — secret used to sign JWT tokens
- `HUGGINGFACE_TOKEN` — Hugging Face API token (required for embeddings)
- `GEMINI_API_KEY` — (optional) Google Gemini / generative AI key if used elsewhere
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — optional, if using Cloudinary for storage
- `NEXT_PUBLIC_BASE_URL` — e.g. `http://localhost:3000`

Pinecone-specific variables (optional; required for semantic indexing/search):

- `PINECONE_API_KEY` — your Pinecone API key
- `PINECONE_ENVIRONMENT` — environment short name (used to construct a controller host when `PINECONE_CONTROLLER_HOST` is not provided)
- `PINECONE_CONTROLLER_HOST` — optional full controller host (e.g. `https://controller.us-west1-gcp.pinecone.io`)
- `PINECONE_INDEX_NAME` — index name to upsert/query vectors
- `HF_EMBEDDING_MODEL` — optional Hugging Face embedding model (defaults to `sentence-transformers/all-MiniLM-L6-v2`)
- `TOPIC_CLUSTER_COUNT` — optional integer to control number of topic clusters (default small value)

When Pinecone env variables are not present, the app will gracefully fall back to local text-based search.

## Notable files and responsibilities

- `src/lib/semantic.ts` — Pinecone + embeddings helpers: chunking, embedding, upsert, query, and topic clustering logic.
- `src/app/api/papers/[id]/search/route.ts` — search route that uses local matching and falls back to `semanticSearchPaper()` when Pinecone is configured.
- `src/app/api/process/route.ts` and `src/usecases/paper.ts` — paper processing flow that persists analysis and kicks off Pinecone indexing.
- `src/utils/pdfProcessor.ts` — PDF extraction and minimal topic-candidate generation for clustering.
- `src/models/Paper.ts` & `types/paper.d.ts` — schema and type updates to include `topic_clusters`.
- `src/app/page.tsx` — updated hero and upload card visuals and improved upload header alignment.

## Dependencies added/changed

- `@pinecone-database/pinecone` — client used for connecting to Pinecone
- Uses Hugging Face embeddings via the inference API (`HUGGINGFACE_TOKEN` required)

Check `package.json` for the full dependency list.

## Known limitations & next steps

- LangChain-style RAG orchestration (QA + generation using retrieved chunks) is not yet implemented — the retrieval layer is in place and ready.
- UI: some additional layout tweaks (e.g., make hero/upload header left-aligned across viewports) were requested and can be applied on demand.

## Troubleshooting

- If semantic search fails, the app logs a warning and falls back to local text search.
- If TypeScript reports errors after dependency changes, run `npm install` and `npx tsc --noEmit` to surface issues.

## Contributing

Contributions are welcome. Please open issues or PRs for feature requests or fixes.

## License

This project is licensed under the MIT License.

```
