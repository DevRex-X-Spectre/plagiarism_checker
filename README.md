# Faculty Project Archive

A Progressive Web Application for Nigerian university faculties to store final year student projects and check new topics for semantic overlap before students commit to research.

## Features

- **Smart Document Upload** — Upload DOCX/PDF, system extracts title, abstract, author, department, and year automatically
- **Semantic Similarity Check** — Enter a project topic, compare it against all stored projects using Sentence-BERT embeddings and cosine similarity
- **Project Repository** — Browse, search, and filter all submitted projects
- **Admin Console** — Manage users, departments, projects, and view similarity check logs
- **PWA** — Installable, works offline for browsing cached projects
- **Email Verification** — Secure registration with email verification and password reset

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| PWA | vite-plugin-pwa / Workbox |
| Backend | Node.js + Express |
| Embeddings | @huggingface/transformers (all-MiniLM-L6-v2, ONNX) |
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
- Embeddings stored as JSONB arrays; cosine similarity computed in JavaScript

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or cloud)

### Setup

```bash
# Clone and install all dependencies
npm run install:all

# Configure server
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL and JWT_SECRET

# Run migrations
npm run migrate

# Start development
npm run dev
```

Visit `http://localhost:5173` (client) and `http://localhost:10000` (server).

### First Admin Setup

1. Add your email to `ADMIN_EMAILS` in your `.env` file (comma-separated)
2. Register a new account with that email
3. The account will automatically have admin role

## Documentation

- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
