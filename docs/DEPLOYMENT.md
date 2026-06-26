# Deployment Guide — Render Free Tier

## Prerequisites

1. A [Render](https://render.com) account
2. A [Resend](https://resend.com) account for email (free: 100 emails/day)

---

## Step 1: Create a PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Name: `project-archive-db`
3. Choose the **Free** plan
4. Copy the **Internal Database URL** — you'll need this for the next step

---

## Step 2: Create the Web Service

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `project-archive` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | (leave empty) |
| **Runtime** | `Node` |
| **Build Command** | `cd client && npm ci && npm run build && cd ../server && npm ci` |
| **Start Command** | `cd server && node src/server.js` |
| **Health Check Path** | `/health` |

---

## Step 3: Set Environment Variables

In Render's environment variables for your web service:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-postgres-internal-url>
JWT_SECRET=<generate with: openssl rand -hex 32>
ADMIN_EMAILS=admin@yourfaculty.edu.ng,hod@yourfaculty.edu.ng
RESEND_API_KEY=<from resend.com dashboard>
EMAIL_FROM=noreply@yourfaculty.edu.ng
CLIENT_ORIGIN=https://project-archive.onrender.com
```

> **Important:** Replace `project-archive.onrender.com` with your actual Render service URL.

---

## Step 4: Add Release Command

Under **Settings** → **Build & Deploy** → **Release Command**:

```bash
cd server && node src/db/migrate.js
```

This runs database migrations on every deploy.

---

## Step 5: Deploy

Click **Create Web Service**. The first deploy will:
1. Build the React app
2. Install server dependencies
3. Run migrations (creates tables)
4. Start the server

---

## Keeping the Service Warm (Free Tier)

Render's free tier sleeps after 15 minutes of inactivity. To prevent cold-start delays on the embedding model:

1. Create a free [UptimeRobot](https://uptimerobot.com) account
2. Add a new monitor pointing to your Render service URL with `/health`
3. Set the check interval to **14 minutes**

This keeps the service active and the model warm.

---

## Updating the App

Push to your `main` branch. Render automatically redeploys.

---

## Troubleshooting

### "Migration failed: relation does not exist"
The migrations ran before the database was fully provisioned. Re-trigger a deploy from the Render dashboard, or run the migration manually via the Render Shell.

### Embedding model takes too long on first check
Normal on free tier. The first similarity check after a cold start takes ~5–8 seconds while the model loads. UptimeRobot pinging every 14 minutes prevents this.

### Emails not sending
Verify your `RESEND_API_KEY` is set in Render environment variables. In development, emails print to the server console.
