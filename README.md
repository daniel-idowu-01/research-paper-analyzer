# Research Paper Analyzer

Research Paper Analyzer is a Next.js application for PDF ingestion, grounded paper analysis, semantic indexing, search, and research-oriented RAG experimentation.

The original upload, analysis, embeddings, Pinecone indexing, semantic search, authentication, and paper-management flows are preserved. The project now also includes a modular experimentation platform for comparing retrieval, chunking, grounding, GraphRAG, and evaluation settings.

## Features

- Upload PDFs and extract text/metadata
- AI-driven summarization and key-finding extraction
- Semantic indexing with Pinecone and Hugging Face embeddings
- Local text search fallback when Pinecone is unavailable
- Runtime-selectable retrieval strategies: dense, BM25, hybrid, hybrid plus reranking, and optional GraphRAG
- Fixed-size, sliding-window, semantic, and section-aware chunking strategies
- RAG metrics for Precision@K, Recall@K, MRR, relevance, faithfulness, citation accuracy, latency, and token usage
- Citation grounding helpers that detect unsupported claims, missing citations, and hallucinated citations
- Experiment runner that stores configurations, outputs, metrics, and timestamps in MongoDB
- Research dashboard at `/research-dashboard`
- Markdown research report export for completed experiment runs
- Topic candidate extraction and clustering persisted on paper documents
- User authentication, profile, and paper management

## Tech Stack

- Next.js 15, React 19
- TypeScript
- Tailwind CSS, shadcn-ui, Lucide icons
- MongoDB + Mongoose
- Pinecone for optional vector indexing
- Hugging Face Inference for embeddings
- Google Gemini for grounded paper analysis when configured

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` and add the required variables.

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm start
```

## Environment Variables

Minimum recommended variables:

- `MONGODB_URI`: MongoDB connection URI
- `JWT_SECRET`: secret used to sign JWT tokens
- `HUGGINGFACE_TOKEN`: Hugging Face API token for embeddings
- `GEMINI_API_KEY`: optional Google Gemini key for grounded analysis
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: optional, if using Cloudinary for storage
- `NEXT_PUBLIC_BASE_URL`: for example `http://localhost:3000`

Pinecone-specific variables:

- `PINECONE_API_KEY`
- `PINECONE_ENVIRONMENT`
- `PINECONE_CONTROLLER_HOST`
- `PINECONE_INDEX_NAME`
- `HF_EMBEDDING_MODEL`
- `TOPIC_CLUSTER_COUNT`

When Pinecone variables are not present, the app falls back to local text-based search and local experiment retrieval.

## Research Architecture

- `src/lib/research/types.ts`: shared interfaces including `Retriever`, `ChunkingStrategy`, `RetrievedChunk`, and `EvaluationResult`.
- `src/lib/research/retrieval.ts`: dense, BM25, hybrid, and hybrid-rerank retrievers.
- `src/lib/research/chunking.ts`: fixed, sliding-window, semantic, and section-aware chunking.
- `src/lib/research/evaluation.ts`: retrieval, generation, and performance metric calculation.
- `src/lib/research/citations.ts`: citation extraction and grounding verification.
- `src/lib/research/experiments.ts`: experiment runner for retrieval/chunking combinations.
- `src/lib/research/graph.ts`: lightweight optional GraphRAG entity and relationship layer.
- `src/lib/research/report.ts`: Markdown research report generation.
- `src/models/ExperimentRun.ts`: MongoDB schema for experiment configurations, outputs, metrics, and timestamps.

Existing core files:

- `src/lib/semantic.ts`: Pinecone and embedding helpers.
- `src/app/api/papers/[id]/search/route.ts`: paper search with optional retrieval strategy selection.
- `src/app/api/process/route.ts` and `src/usecases/paper.ts`: paper processing and persistence.
- `src/utils/pdfProcessor.ts`: PDF extraction and grounded/fallback analysis.
- `src/models/Paper.ts` and `types/paper.d.ts`: paper schema and app types.

## Research APIs

Run retrieval with a selected strategy:

```http
POST /api/research/retrieve
Content-Type: application/json

{
  "paperId": "<paper-id>",
  "query": "What is the main contribution?",
  "retrievalStrategy": "hybrid_rerank",
  "chunkingStrategy": "section_aware",
  "topK": 6
}
```

Run a full experiment across retrieval and chunking combinations:

```http
POST /api/research/experiments
Content-Type: application/json

{
  "name": "Chunking and retrieval comparison",
  "documentIds": ["<paper-id>"],
  "retrievalStrategies": ["dense", "bm25", "hybrid", "hybrid_rerank"],
  "chunkingStrategies": ["fixed", "sliding_window", "semantic", "section_aware"],
  "model": "local-baseline",
  "topK": 5
}
```

List recent experiments:

```http
GET /api/research/experiments
```

Export a Markdown report:

```http
GET /api/research/experiments/<experiment-id>/report
```

## Database Additions

- `ExperimentRun`: stores experiment `name`, `status`, full `config`, per-query `outputs`, flattened metrics, `startedAt`, `completedAt`, and errors.
- Existing `Paper` documents remain unchanged for core analysis. Experiment chunks are derived from stored `extracted_text` at run time.

## Known Limitations

- The `hybrid_rerank` retriever currently uses a deterministic lexical relevance proxy behind the reranker interface. Replace `HybridRerankRetriever` with a hosted or local cross-encoder when model infrastructure is available.
- Generation-quality metrics are local heuristic evaluators by default. For publication-quality evaluation, add curated ground-truth labels and optional LLM-as-judge evaluators.
- GraphRAG extraction is intentionally lightweight and local; production GraphRAG should persist graph entities and relationships in a dedicated graph store or graph collection.

## Troubleshooting

- If semantic search fails, the app logs a warning and falls back to local text search.
- If PowerShell blocks `npx`, run `npx.cmd tsc --noEmit`.
- If TypeScript reports errors after dependency changes, run `npm install` and `npx.cmd tsc --noEmit`.

## License

This project is licensed under the MIT License.
