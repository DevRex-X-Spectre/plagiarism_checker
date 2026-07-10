# Deployment Guide - Render Static Frontend + Web Service Backend

This project can be deployed as two Render services:

- Frontend: Render Static Site from `client/`
- Backend: Render Web Service from `server/`
- Database: Render PostgreSQL

## 1. Create PostgreSQL

Create a Render PostgreSQL database and copy its internal database URL.

Use that value as `DATABASE_URL` on the backend service.

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
COOKIE_SAME_SITE=lax
RESEND_API_KEY=<optional-resend-api-key>
EMAIL_FROM=noreply@yourdomain.com
UPLOAD_DIR=uploads
MAX_FILE_SIZE=20971520
```

Do not set `USE_LOCAL_DB` in production.

Add this backend release command so tables are created on deploy:

```bash
npm run migrate
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

Set backend `CLIENT_ORIGIN` to the exact frontend URL, including `https://`.

If both services use Render `*.onrender.com` URLs, `COOKIE_SAME_SITE=lax` should work. If you later split the frontend and backend across different sites/domains and login cookies do not persist, set:

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

Render free web services can sleep. The first request after sleep may be slow because the embedding model loads in memory.

Point an uptime monitor at:

```text
https://your-backend-web-service.onrender.com/health
```

Render free filesystems are ephemeral. Uploaded files in `server/uploads` can disappear after redeploys/restarts. Project metadata remains in PostgreSQL, but uploaded original documents need persistent storage for production-grade file retention.
