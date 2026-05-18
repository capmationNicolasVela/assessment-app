# Deploy Guide — API Assessment App

## What you need
- A [Vercel](https://vercel.com) account (free)
- A [GitHub](https://github.com) account (free)

No database setup required. Responses are stored in memory during the session.

---

## Step 1 — Push to GitHub

```bash
cd assessment-app
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USER/api-assessment.git
git push -u origin main
```

---

## Step 2 — Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Click **Deploy**

---

## Step 3 — Add one environment variable

In Vercel dashboard → your project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | Password for Pame (e.g. `capmation2026`) |

Redeploy after adding the variable.

---

## Step 4 — Share the links

| Link | For whom |
|------|---------|
| `https://YOUR-APP.vercel.app` | Participants (share on Day 5) |
| `https://YOUR-APP.vercel.app/admin` | Pame — logs in with `ADMIN_PASSWORD` |

That's it. No database, no extra setup.

---

## How data works

- Responses are stored **in memory** on the server process
- Data is available as long as the app is running — the full workshop session
- Data is **wiped on every redeploy** (intentional — each workshop starts fresh)
- Pame should export the CSV before any redeploy if she wants to keep the data
