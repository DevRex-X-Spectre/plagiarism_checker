# Faculty Project Archive

A Progressive Web Application for Nigerian university faculties to store final year student projects and check new topics for semantic overlap before students commit to research.

## Features

- **Smart Document Upload** — Upload DOCX/PDF, system extracts title, abstract, author, department, and year automatically
- **Semantic Similarity Check** — Enter a project topic, compare it against all stored projects using Sentence-BERT embeddings and cosine similarity, with a local fallback engine when remote model hosting is unavailable
- **Project Repository** — Browse, search, and filter all submitted projects
- **Admin Console** — Manage users, departments, projects, and view similarity check logs
- **PWA** — Installable, works offline for browsing cached projects
- **Password Reset** — Account recovery by email

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| PWA | vite-plugin-pwa / Workbox |
| Backend | Node.js + Express |
| Embeddings | @huggingface/transformers (all-MiniLM-L6-v2, ONNX) with local hashed fallback |
| Document parsing | mammoth (DOCX) + pdf-parse (PDF) |
| Database | PostgreSQL |
| Auth | JWT (httpOnly cookies) + bcrypt |
| Email | Resend |
| Validation | Zod |

## Architecture

Single Node.js service running on Render Free Tier:
- Express serves the REST API at `/api/*`
- Express serves the React build as static assets in production
- Sentence-BERT model runs in-process via `@huggingface/transformers` (no Python, no separate service)
- If the ONNX model host is blocked, the backend automatically falls back to deterministic local hashed embeddings instead of returning 500 errors
- Embeddings stored as JSONB arrays; cosine similarity computed in JavaScript

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (only needed for production — see Local Mode below for testing)

### Local Mode (no database setup needed)

For quick local testing without setting up PostgreSQL:

```bash
# Install all dependencies
npm install --prefix server
npm install --prefix client

# Copy env file (USE_LOCAL_DB=true is the default in the example)
cp server/.env.example server/.env
# Set JWT_SECRET in server/.env to any random 32+ char string

# Seed the local JSON store with sample data (8 projects, 3 users, 4 departments)
npm run seed:local --prefix server

# Start development (server + client)
npm run dev
```

Visit `http://localhost:5173`.

**Test accounts**:
- `admin@gmail.com` / `Admin1234` — admin
- `student@faculty.edu.ng` / `password123` — student

Local data persists in `server/local-data.json` (gitignored). Delete the file to reset.

### Production Mode (PostgreSQL)

```bash
# Install all dependencies
npm run install:all

# Configure server
cp server/.env.example server/.env
# Edit server/.env:
#   - Remove USE_LOCAL_DB line (or set to false)
#   - Set DATABASE_URL to your PostgreSQL connection string
#   - Set JWT_SECRET to a long random string
#   - Keep EMBEDDING_PROVIDER=auto unless you explicitly want to force fallback mode

# Run migrations
npm run migrate

# Start development
npm run dev
```

### First Admin Setup

1. Add your email to `ADMIN_EMAILS` in your `.env` file (comma-separated)
2. Register a new account with that email
3. The account will automatically have the admin role

## Local vs PostgreSQL Mode

The app supports two storage backends, selected by the `USE_LOCAL_DB` env var:

| Mode | When | Storage |
|---|---|---|
| `USE_LOCAL_DB=true` | Local testing | `server/local-data.json` (auto-created) |
| `USE_LOCAL_DB` unset/false | Production | PostgreSQL via `DATABASE_URL` |

To switch:
```bash
# Switch to local mode
echo "USE_LOCAL_DB=true" >> server/.env

# Switch back to PostgreSQL
# Remove USE_LOCAL_DB from server/.env, then:
npm run migrate
```

The two modes use the same API surface — all models and controllers work identically.

## Embedding Provider Modes

The backend supports three embedding modes through `EMBEDDING_PROVIDER`:

| Mode | Behavior |
|---|---|
| `auto` | Tries Sentence-BERT first and falls back to local hashed embeddings if the model host is unavailable. |
| `transformers` | Requires Sentence-BERT to load successfully. Useful when you have stable model access and want strict semantic mode only. |
| `fallback` | Uses the built-in local hashed embedding engine only. Best for locked-down or offline-friendly deployments. |

For Render or other hosts that sometimes block ONNX downloads from Hugging Face, `auto` is the safest default and prevents similarity checks from failing with HTTP 500.

## Documentation

- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
