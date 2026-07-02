# A.K.R Electronics - Deployment Guide (Vercel)

**Version**: 1.1.0
**Hosting**: Vercel (Hobby / free tier)
**Backend**: Firebase (Auth + Firestore + Storage)
**Last Updated**: 2026-07-02

---

## Overview

A.K.R Electronics deploys to **Vercel** as a Next.js app. Firebase provides
authentication, the Firestore database, and file storage. There is no
Firebase Hosting — Vercel serves everything (pages, API routes, static assets).

```
GitHub (main branch)
    │  push → auto-deploy
    ▼
Vercel (bom1 / Mumbai region)
    ├── Next.js pages + API routes (serverless)
    └── Static assets (CDN)
         │
         ▼
Firebase (Auth · Firestore · Storage)
```

---

## Pre-Deployment Checklist

- [ ] Build passes locally (`npm run build`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Firebase project created (Auth + Firestore + Storage enabled)
- [ ] Firebase Admin service account key generated
- [ ] Firestore security rules deployed (via Firebase console or CLI)
- [ ] All environment variables added in the Vercel dashboard
- [ ] Admin user account created

---

## Step 1: Push to GitHub

Vercel deploys from Git. Make sure the repo is on GitHub with `main` as the
production branch.

## Step 2: Import Project in Vercel

1. Sign in at https://vercel.com (Hobby plan is free)
2. **Add New → Project** → import the AKR repository
3. Framework preset: **Next.js** (auto-detected; `vercel.json` pins it)
4. Region is pinned to **bom1 (Mumbai)** in `vercel.json` for Indian users

## Step 3: Environment Variables

Add every variable from `.env.example` in
**Project Settings → Environment Variables** (Production + Preview):

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` (6 vars) | From Firebase Console → Project Settings → Web App |
| `FIREBASE_ADMIN_PROJECT_ID` | Service account project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Paste full key; keep `\n` escapes — code un-escapes them |
| `SESSION_SECRET` | 32+ random chars |
| `SESSION_EXPIRY_MS` | e.g. `2592000000` (30 days) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_SECRET_KEY` | When payments go live |
| `NEXT_PUBLIC_APP_URL` | The production URL, e.g. `https://akr.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `A.K.R Electronics` |
| `ADMIN_EMAIL` | Primary admin account email |

Do **not** set `STORAGE_PROVIDER` on Vercel — the platform sets `VERCEL=1`
automatically and the app switches uploads to Firebase Storage
(the serverless filesystem is read-only/ephemeral, so local-disk uploads are
dev-only).

## Step 4: Deploy

Click **Deploy**. From then on:

- Push to `main` → production deployment
- Push to any other branch / open a PR → preview deployment with its own URL

No GitHub Actions needed — Vercel's Git integration handles CI/CD.

## Step 5: Custom Domain (optional)

**Project Settings → Domains** → add e.g. `akrelectronics.com`.
Free tier includes automatic HTTPS certificates.

---

## Free (Hobby) Tier Limits — Design Constraints

| Limit | Value | Impact on AKR |
|---|---|---|
| Commercial use | Officially non-commercial | Fine for development/demo; upgrade to Pro (~$20/mo) before real sales |
| Bandwidth | 100 GB/month | Plenty for early traffic |
| Serverless function duration | 10s default | Keep API routes fast; no long-running jobs |
| Image optimization | 1,000 source images/month | Product images count; use S3/Firebase Storage URLs with caching |
| Cron jobs | 2, daily granularity only | No frequent background jobs — use Firebase functions if needed |
| Deployments | 100/day | Not a concern |

**Key rule for code**: never write to the filesystem at request time
(uploads, logs, caches). Use Firebase Storage / Firestore instead.

---

## Local Development

```bash
cp .env.example .env.local   # fill in Firebase dev credentials
npm install
npm run dev                  # http://localhost:3000
```

Uploads land in `public/uploads/` locally (LocalStorageProvider).

---

## Rollbacks

Vercel keeps every deployment immutable. To roll back:
**Deployments → (previous deployment) → Promote to Production** — instant.

---

## Monitoring

- **Vercel dashboard**: request logs, function errors, analytics (basic on free tier)
- **Firebase console**: Firestore usage, Auth sign-ins, Storage bandwidth
- Watch Firebase free-tier (Spark) quotas: 50k Firestore reads/day, 1 GB storage
