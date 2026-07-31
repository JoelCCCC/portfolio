# RAG Backend

A Retrieval-Augmented Generation backend built with FastAPI, using Google's Vertex AI embedding model for vector embeddings and DeepSeek R1 for generative answers. Embeddings are stored persistently in PostgreSQL.

The default dataset is **240,000+ historical football matches** from 22 leagues across 11 countries (1993–2026) sourced from [football-data.co.uk](https://www.football-data.co.uk), including full-time/half-time scores, match stats, and betting odds from multiple bookmakers.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DEEPSEEK_API_KEY and DATABASE_URL
createdb rag                          # create the database if not done
```

Ensure `gcp-key.json` is in the project root (already provided).

**Design rationale.** Environment variables via `.env` (rather than a config file or CLI args) keep API keys out of version control and match the Twelve-Factor App pattern. PostgreSQL over SQLite was chosen because the `bytea` embedding storage and large-row count (240K) would strain SQLite's single-writer performance during reload.

## How to Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env — set DEEPSEEK_API_KEY and DATABASE_URL if needed

# 3. Create the database (skip if already done)
createdb rag

# 4. (Optional) Generate the football dataset

Full dataset (~240,000 matches):
python scripts/download_fbdata.py    # downloads raw CSVs to data/raw/ (takes ~5 min)
python scripts/convert_fbdata.py     # converts to data/data.csv

Lightweight dataset (~44 matches, no download needed):
python scripts/generate_light_data.py  # generates data/light_data.csv

Then in `.env`, set `DATA_PATH=data/light_data.csv` (or leave it for the full dataset).

# 5. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server checks PostgreSQL for existing embeddings on startup. If the database is empty, call `POST /api/v1/reload` to index `data/data.csv`. On subsequent restarts, data resumes instantly from PostgreSQL.

Open `http://localhost:8000` in your browser to use the frontend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/query` | Submit a query and get a grounded answer |
| POST | `/api/v1/reload` | Start async reload of documents from CSV (returns task_id) |
| GET | `/api/v1/reload/status/{task_id}` | Check progress of an active reload |
| GET | `/api/v1/settings` | Get current settings |
| POST | `/api/v1/settings` | Update settings (top_k, data_path, column mapping) |
| GET | `/api/v1/health` | Health check |

**Design rationale.** A REST API (rather than WebSocket or GraphQL) was chosen because queries are request-response with no streaming or subscription needs. The async `/reload` endpoint returns immediately with a `task_id` and processes in a background thread — embedding 240K chunks takes ~30 minutes, so a synchronous endpoint would timeout. Status polling (`/reload/status/{task_id}`) avoids WebSocket complexity for a feature used only during initial setup.

### Query Example

```json
POST /api/v1/query
{
  "query": "Which Premier League match had the highest odds for a home win in 2024?",
  "top_k": 5
}
```

### Response

```json
{
  "answer": "The match with the highest home win odds... [Source 1]",
  "sources": [
    {
      "doc_id": "12345_chunk_0",
      "title": "Team A vs Team B (2024-25)",
      "text": "English Premier League 2024-25. Team A vs Team B...",
      "source": "https://www.football-data.co.uk/E0/2425",
      "score": 0.87
    }
  ],
  "found_relevant": true
}
```

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | HTML, CSS, Vanilla JS | Query input, answer display, collapsible sources, settings sidebar |
| Backend | FastAPI (Python) | REST API server, request routing, orchestration |
| Embeddings | Google Vertex AI `text-embedding-004` | Converts text chunks to vector embeddings |
| Vector Store | PostgreSQL (`chunks` table, `bytea` column) | Persistent storage of chunk text + embedding pairs |
| Search Cache | NumPy matrix (in-memory) | Cosine similarity search across all embeddings (~10ms after warm) |
| Generation | DeepSeek Chat (via OpenAI SDK) | Produces grounded answer with source citations from retrieved chunks |
| Data Pipeline | Pandas + custom Python scripts | Downloads raw CSVs, converts to structured match descriptions |

**Design rationale.** FastAPI was chosen over Flask for native async support and Pydantic-based request validation, which reduces boilerplate for typed endpoints. Vanilla HTML/JS avoids a frontend framework dependency — the interface is simple enough that React or Vue would add complexity without benefit. Vertex AI `text-embedding-004` offers a 768-dimensional embedding space, good multilingual support, and a pay-per-token API that costs roughly $0.10 to embed 240K chunks. DeepSeek Chat provides strong reasoning at ~1/10 the cost of GPT-4, which matters when generating answers for many test queries. PostgreSQL + `bytea` was chosen over a dedicated vector database (Pinecone, Weaviate) to keep the stack simple — one database for both metadata and vectors, with no extra infrastructure. The numpy in-memory cache compensates for PostgreSQL's lack of native vector indexes, giving ~10ms search despite 240K rows.

## System Flow

### Ingestion Time (`POST /api/v1/reload`)

```
data/data.csv
      │
      ▼
  ingestion.py ──► load_csv() reads CSV
      │
      ▼
  chunk_document() ──► fixed-size chunks (500 chars, 50 overlap)
      │
      ▼
  embed_batch() ──► Google Vertex AI text-embedding-004 (batches of 1000)
      │
      ▼
  vector_store.insert_batch() ──► PostgreSQL chunks table (text + bytea embedding)
      │
      ▼
   Cache invalidated (next query rebuilds from DB)
```

**Design rationale.** Chunk size of 500 characters with 50 overlap was chosen because each CSV match description averages 400–600 characters (scores + odds + stats). This keeps most chunks as complete match descriptions rather than splitting mid-sentence. The 50-char overlap ensures that multi-chunk queries (e.g. "compare matches from 2022 to 2024") don't lose context at boundaries. Batches of 1000 balance throughput against Vertex AI's per-request limits and keep peak RAM under 50MB for 240K chunks. Immediate per-batch PostgreSQL writes ensure partial progress is never lost if the reload is interrupted.

### Query Time (`POST /api/v1/query`)

```
User types question in browser
      │
      ▼
  index.html / app.js ──► fetch() POST /api/v1/query { query, top_k, mode }
      │
      ▼
  router.py ──► query_endpoint()
      ├── embed_query(query) ──► Vertex AI embedding of user question
      ├── store.search(q_emb, top_k)
      │      │
      │      ├── Cache warm? ──NO──► _load_cache() from PostgreSQL
      │      │                                  │
      │      │                                  ▼
      │      │                          numpy matrix (all embeddings)
      │      │                                  │
      │      │                                  ▼
      │      └───► cosine similarity ──► numba-dot product q_emb × matrix
      │                    │
      │                    ▼
      │            top-k RetrievedChunk objects (text + score)
      │
      ├── build_prompt(query, chunks_text, mode) ──► structured prompt with [Source N] citations
      ├── generate(prompt) ──► DeepSeek Chat API ──► grounded answer
      │
      └── QueryResponse { answer, sources, found_relevant }
                   │
                   ▼
          app.js ──► displayAnswer()
                      ├── answer panel (rendered markdown)
                      └── sources panel (collapsible, score %, doc name, chunk text)
```

### Cache Lifecycle

```
Server start ──► PostgreSQL has embeddings ──► Cache empty, chunk_count > 0
       │
First query ──► _load_cache() ──► read all rows from DB
       │                          └─► unpack bytea → float32
       │                          └─► build (N × D) numpy matrix
       │                          └─► L2-normalize rows
       │
Subsequent queries ──► in-memory dot product ──► ~10ms (no DB read)
       │
Reload ──► store cleared, cache invalidated
        └─► Next query rebuilds cache from new data
```

**Design rationale.** The lazy-loading cache (warm on first query, not on server start) avoids a startup delay — the server is ready to serve the frontend immediately even with 240K chunks. The bytea storage format packs float32 arrays as raw binary (~3 bytes per float including overhead vs 8 bytes for float64), halving storage and read time. L2 normalization of the matrix at cache-build time moves the normalization cost from O(N) per query to O(1) per query (since query vector is normalized once). Full-scan cosine similarity was chosen over an approximate index (HNSW, IVF) because 240K × 768 fits in ~700MB of RAM and a linear scan completes in ~10ms on modern CPUs — fast enough that an approximate index would add complexity for no perceptible latency gain.

## Dataset

Two dataset options are available:

- **Full dataset** (~240,000 matches) — downloaded and converted from football-data.co.uk
- **Lightweight dataset** (~44 matches) — synthetic data generated by `scripts/generate_light_data.py`, no download needed

### Full dataset

**240,013 matches** from football-data.co.uk covering:

| Country | Leagues | Seasons |
|---------|---------|---------|
| England | Premier League, Championship, League 1, League 2, National League | 1993–2026 |
| Scotland | Premiership, Championship, League 1, League 2 | 1994–2026 |
| Germany | Bundesliga, 2. Bundesliga | 1993–2026 |
| Italy | Serie A, Serie B | 1993–2026 |
| Spain | La Liga, Segunda División | 1993–2026 |
| France | Ligue 1, Ligue 2 | 1993–2026 |
| Netherlands | Eredivisie | 1993–2026 |
| Belgium | Pro League | 1995–2026 |
| Portugal | Primeira Liga | 1994–2026 |
| Turkey | Süper Lig | 1994–2026 |
| Greece | Super League | 1994–2026 |

Each match row includes: date, home/away teams, full-time and half-time scores, match stats (shots, shots on target, corners, fouls, cards), and betting odds from Bet365, Bet&Win, Interwetten, Pinnacle, and William Hill.

**Design rationale.** Football data was chosen because it's plentiful (240K+ rows), structurally diverse (scores + stats + odds across 22 leagues), and queries can test both factual retrieval ("what was the score") and analytic reasoning ("compare home win percentages"). The football-data.co.uk dataset is freely available, well-structured, and spans 30+ years, making it ideal for evaluating chunking and retrieval at scale.

### Lightweight dataset

Generated by `scripts/generate_light_data.py`, this produces **~44 synthetic match documents** covering 5 leagues across 3 seasons. Each document follows the same format as the full dataset (scores, stats, odds) but requires no external download. Ideal for quick testing and development.

```bash
python scripts/generate_light_data.py   # generates data/light_data.csv
```

Set `DATA_PATH=data/light_data.csv` in your `.env` to use it, then call `POST /api/v1/reload`.

## Data Format

Place a CSV at `data/data.csv`. By default the system expects columns:
- `id` — unique identifier
- `title` — document title
- `content` — document text
- `source` — URL or source reference (optional, can be empty)

### Custom column mapping

If your CSV uses different column names, set them in `.env`. Only `ID_COLUMN` and `TITLE_COLUMN` are required; `CONTENT_COLUMN` and `SOURCE_COLUMN` fall back to auto-generation or empty when missing.

Example for a CSV with columns `MatchID`, `HomeTeam`, `AwayTeam`, `Score`, `URL`:

```ini
ID_COLUMN=MatchID
TITLE_COLUMN=HomeTeam
# CONTENT_COLUMN=Score       # uncomment to use Score as content; otherwise auto-generated from remaining columns
SOURCE_COLUMN=URL
```

When `CONTENT_COLUMN` is not found in the CSV, the system auto-generates content by combining all remaining columns (excluding id, title, and source) into a descriptive text (`Column: value | Column: value`).

### Using the lightweight dataset

To test the system with a smaller dataset (~44 rows instead of 240K), generate `data/light_data.csv` and set the path in `.env`:

```bash
python scripts/generate_light_data.py
# Then add to .env:
# DATA_PATH=data/light_data.csv
```

After changing the path, call `POST /api/v1/reload`.

**Design rationale.** CSV was chosen over JSON/Parquet because football-data.co.uk distributes data as CSV, so no transformation is needed before ingestion. The auto-generation of content from remaining columns (when `CONTENT_COLUMN` is unset) makes the system work with any CSV without manual column mapping — every column becomes part of the searchable text. Column mapping via `.env` rather than a config file keeps sensitive paths out of version control.

## Transferring to Another Computer

### Option 1: Full transfer (includes embeddings — no re-embedding needed)

```bash
# Source computer
pg_dump -d rag -F c -f rag_dump.dump         # dump PostgreSQL (embeddings)
rsync -avz ~/se_final/ user@newpc:~/se_final/ # project code + data
rsync -avz rag_dump.dump user@newpc:~/rag_dump.dump

# Target computer
pip install -r ~/se_final/requirements.txt
createdb rag
pg_restore -d rag ~/rag_dump.dump             # restore embeddings
cd ~/se_final
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server detects the 240K chunks in PostgreSQL on startup and resumes instantly — no re-embedding needed. The first query will take ~3s to build the in-memory cache.

### Option 2: Light transfer (code only — re-download data)

```bash
rsync -avz --exclude='data/raw/' --exclude='.env' ~/se_final/ user@newpc:~/se_final/
# On target, re-download and convert:
python scripts/download_fbdata.py
python scripts/convert_fbdata.py
# Then start server and call POST /api/v1/reload
```

## Evaluation

Run the evaluation script after starting the server and loading data:

```bash
python evaluation.py
```

The script sends 10 football-specific test queries to the API and saves results to `evaluation_results.json`. Each result includes the generated answer and retrieved source chunks with similarity scores.

### Test Queries

| # | Query | Category |
|---|-------|----------|
| 1 | Which English Premier League match in 2024-25 had the highest home win odds according to Bet365? | Betting odds |
| 2 | What was the most common full-time score in German Bundesliga matches from 2022-23? | Score patterns |
| 3 | Compare average goals per game between Spanish La Liga and Italian Serie A in 2020-21. | Cross-league |
| 4 | Which team had the most shots on target in a single match in the 2022-23 English Premier League? | Match stats |
| 5 | List all matches where the home team had more than 10 shots but failed to score. | Filter query |
| 6 | What were the Bet365 odds for the match between Barcelona and Real Madrid in 2019-20? | Specific match |
| 7 | Find matches in the Dutch Eredivisie 2017-18 season with 6 or more total goals. | Score filter |
| 8 | What was the average number of corners per match in French Ligue 1 during 2022-23? | Aggregate stats |
| 9 | Which Scottish Premiership match in 2023-24 had the highest Pinnacle over 2.5 goals odds? | Betting odds |
| 10 | How did home win percentages compare between the English Championship and League One in 2021-22? | Comparison |

### Scoring

After running, edit `EVALUATION_NOTES` in `evaluation.py` with a qualitative assessment per query:

- **Retrieval OK**: Did the top-k chunks include relevant matches?
- **Generation OK**: Did the LLM produce a correct, grounded answer using the cited sources?
- **Notes**: What worked, what didn't (e.g., chunking broke a key stat, irrelevant chunks ranked highly).

Rerun to update `evaluation_results.json` with your annotations.

**Design rationale.** 10 queries were chosen to cover 5 retrieval categories (betting odds, score patterns, match stats, aggregates, comparisons) without making manual assessment burdensome. The dual-axis scoring (retrieval OK + generation OK) separates the two failure modes: good chunks but bad answer (generation fault) vs bad chunks regardless of answer (retrieval fault). Queries 5 and 10 intentionally require aggregation across multiple chunks, testing whether the LLM can synthesize across sources rather than just extract a single fact.

## Known Limitations

- Cosine similarity is computed in Python (full scan) — suitable for thousands of chunks, not millions (240K chunks is near the upper limit)
- Fixed chunk size of 500 characters with 50 overlap — not sentence-aware
- DeepSeek requires an API key and internet access
- Google Vertex AI embedding costs apply (text-embedding-004)
- Default `DATABASE_URL` uses a Unix socket — adjust for remote hosts
- First reload of 240K chunks takes ~30-35 minutes (batched to keep RAM <50MB)
- First query after server start takes ~3s to build the in-memory search cache; subsequent queries are <10ms
