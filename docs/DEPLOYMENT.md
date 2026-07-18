# Deployment Guide - Render Static Frontend + Web Service Backend

This project can be deployed as two Render services:

- Frontend: Render Static Site from `client/`
- Backend: Render Web Service from `server/`
- Database: Render PostgreSQL

## 1. Create PostgreSQL

Create a PostgreSQL database on Neon, Supabase, or Render PostgreSQL and copy the connection URL.

Use that value as `DATABASE_URL` on the backend service.

### Neon

1. Create a Neon project.
2. Open the connection details for the database.
3. Copy the Node/Postgres connection string.
4. Make sure it includes `sslmode=require`.

Example:

```text
postgresql://user:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Supabase

1. Create a Supabase project.
2. Open **Project Settings** -> **Database**.
3. Copy the Postgres connection string.
4. Use the connection string as `DATABASE_URL`.

If Supabase gives both direct and pooler URLs, either can work for this app. For long-running Render web services, the pooler URL is usually the safer default.

## 2. Deploy The Backend

Create a Render **Web Service**.

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | `Node` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Backend environment variables:

```env
NODE_ENV=production
DATABASE_URL=<your-render-postgres-internal-url>
JWT_SECRET=<generate-with-openssl-rand-hex-32>
ADMIN_EMAILS=admin@gmail.com
CLIENT_ORIGIN=https://your-frontend-static-site.onrender.com
COOKIE_SAME_SITE=none
RESEND_API_KEY=<optional-resend-api-key>
EMAIL_FROM=noreply@yourdomain.com
UPLOAD_DIR=uploads
MAX_FILE_SIZE=20971520
EMBEDDING_PROVIDER=auto
```

Do not set `USE_LOCAL_DB` in production.

`EMBEDDING_PROVIDER=auto` is the recommended Render setting. It tries the
Sentence-BERT ONNX model first and automatically switches to the built-in local
hashed embedding engine if the host cannot download model files from Hugging
Face. This prevents `/api/similarity/check` and `/api/projects/confirm` from
failing with HTTP 500 during cold starts or outbound network restrictions.

Add this backend release command so tables are created on deploy:

```bash
npm run migrate
```

You can also run migrations manually from your machine:

```bash
cd server
USE_LOCAL_DB=false NODE_ENV=production DATABASE_URL="<your-postgres-url>" npm run migrate
```

After backend deployment, copy the backend public URL, for example:

```text
https://project-archive-api.onrender.com
```

## 3. Deploy The Frontend

Create a Render **Static Site**.

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

Frontend environment variables:

```env
VITE_API_BASE_URL=https://your-backend-web-service.onrender.com/api
VITE_APP_TITLE=Project Archive
```

Vite reads `VITE_*` values during build, so redeploy the static site after changing `VITE_API_BASE_URL`.

## 4. Add Static Site Rewrite

Because the frontend uses React Router, add this Render Static Site rewrite:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | `Rewrite` |

Without this, direct visits to routes like `/admin` or `/similarity-check` can return 404.

## 5. Cookie And CORS Notes

Set backend `CLIENT_ORIGIN` to the exact frontend URL, including `https://`, so
password-reset emails link back to the correct frontend. The API accepts CORS
requests from every origin, including credentialed requests.

When the frontend and backend are deployed as separate Render services, keep:

```env
COOKIE_SAME_SITE=none
```

Keep `NODE_ENV=production` so cookies are marked secure.

## 6. First Admin Login

This local seeded login does not automatically exist in production PostgreSQL. To make `admin@gmail.com` an admin in production:

1. Keep `ADMIN_EMAILS=admin@gmail.com` on the backend.
2. Register `admin@gmail.com` from the deployed frontend.
3. The backend assigns the `admin` role during registration.

## 7. Free Tier Notes

Render free web services can sleep. The first request after sleep may be slow
because the Node process and embedding model need to start again. In the browser
this can show up as a generic network error even when the code is correct.

Point an uptime monitor at:

```text
https://your-backend-web-service.onrender.com/health
```

For a production app, the most reliable fix is to use a paid Render instance or
an uptime monitor that calls `/health` every few minutes. The frontend also
pings `/health` on startup, but that only helps after a user has opened the app;
it cannot prevent Render from sleeping before the user arrives.

Render free filesystems are ephemeral. Uploaded files in `server/uploads` can disappear after redeploys/restarts. Project metadata remains in PostgreSQL, but uploaded original documents need persistent storage for production-grade file retention.

The health endpoint now reports the active embedding provider, for example:

```json
{ "status": "ok", "model": "ready", "provider": "transformers" }
```

or, when the model host is unavailable:

```json
{ "status": "ok", "model": "ready", "provider": "fallback" }
```
