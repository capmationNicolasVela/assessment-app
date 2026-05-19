# Deploy Guide — API Assessment App

## What you need
- A [Railway](https://railway.app) account (free)
- A [GitHub](https://github.com) account (free)

No database setup required. Responses are stored in memory on a persistent Node.js process.

---

## Step 1 — Push to GitHub

```bash
cd assessment-app
git add .
git commit -m "deploy"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USER/api-assessment.git
git push -u origin main
```

---

## Step 2 — Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo
4. Railway detects Next.js automatically — click **Deploy**

---

## Step 3 — Add one environment variable

In Railway dashboard → your project → **Variables**:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | Password for Pame (e.g. `capmation2026`) |

Railway redeploys automatically after saving.

---

## Step 4 — Share the links

Railway assigns a URL automatically (e.g. `api-assessment.up.railway.app`).

| Link | For whom |
|------|---------|
| `https://YOUR-APP.up.railway.app` | Participants (share on Day 5) |
| `https://YOUR-APP.up.railway.app/admin` | Pame — logs in with `ADMIN_PASSWORD` |

---

## How data works

- Responses are stored **in memory** on a persistent Node.js process
- Railway keeps the process alive — data survives between requests during the session
- Data is **wiped on every redeploy** (intentional — each workshop starts fresh)
- Pame should export the CSV before any redeploy if she wants to keep the data

---

## Updating the app

```bash
git add .
git commit -m "update"
git push
```

Railway redeploys automatically on every push.
