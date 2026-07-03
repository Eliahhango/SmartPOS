# SmartPOS — Deployment Guide

Comprehensive instructions for deploying the SmartPOS system from scratch to production. The system is split into two independently deployable services:

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** (Next.js) | Vercel | `https://smart-pos-plum.vercel.app` |
| **Backend** (Express API) | Railway | `https://smartpos-production-958c.up.railway.app` |

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Backend — Railway Deployment](#2-backend--railway-deployment)
3. [Frontend — Vercel Deployment](#3-frontend--vercel-deployment)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Database](#5-database)
6. [Custom Domain Setup](#6-custom-domain-setup)
7. [Troubleshooting](#7-troubleshooting)
8. [Local Development](#8-local-development)

---

## 1. Prerequisites

Before deploying, you need accounts on:

- **GitHub** — source control ([github.com](https://github.com))
- **Vercel** — frontend hosting ([vercel.com](https://vercel.com), free tier is sufficient)
- **Railway** — backend hosting + PostgreSQL ([railway.com](https://railway.com), free tier includes $5 credit)

You also need:

- **Node.js 18+** (for local testing)
- **npm** (comes with Node.js)
- A PostgreSQL database (Railway will provision one automatically)

### Repository

```bash
git clone https://github.com/Eliahhango/SmartPOS.git
cd SmartPOS
```

---

## 2. Backend — Railway Deployment

### 2.1 Project Structure (Backend)

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema (17 tables)
│   └── seed.js            # Demo data seeder (4 users + sample data)
├── src/
│   ├── index.js           # Express server entry point
│   ├── middleware/auth.js  # JWT authentication + RBAC middleware
│   ├── routes/            # 14 API route files (auth, products, sales, etc.)
│   └── utils/prisma.js    # Prisma client singleton
├── package.json
├── .env.example
└── Dockerfile
```

### 2.2 Step-by-Step Railway Deployment

#### Step 1 — Create a Railway Project

1. Log in to [Railway](https://railway.com) (sign up via GitHub).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your forked/cloned `SmartPOS` repository.
4. Railway will auto-detect the `railway.json` and `Dockerfile`.

#### Step 2 — Provision PostgreSQL

1. In the same Railway project, click **New** → **Database** → **Add PostgreSQL**.
2. Wait for provisioning (~30 seconds).
3. Click the PostgreSQL service, then the **Connect** tab.
4. Copy the `DATABASE_URL` (starts with `postgresql://`).

#### Step 3 — Configure Environment Variables

1. Select the backend service (not the database).
2. Go to the **Variables** tab.
3. Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | *(from PostgreSQL service)* | Railway provides this automatically if you use the "Referenced" variable type |
| `JWT_SECRET` | `your-256-bit-secret` | Generate a strong random string (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `24h` | Token lifetime (24h recommended) |
| `PORT` | `5000` | Railway listens on the PORT env var automatically |
| `NODE_ENV` | `production` | Disables dev-only features (stack traces, /uploads) |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | CORS origin — update after frontend deploys |

#### Step 4 — Deploy

1. Railway auto-deploys on every push to the default branch.
2. Monitor logs via the **Deployments** tab → **View Logs**.
3. Verify the health endpoint:

```bash
curl https://your-railway-url.up.railway.app/api/health
# → {"status":"ok","timestamp":"2026-07-03T..."}
```

#### Step 5 — Seed the Database

On first deploy, the Dockerfile's CMD runs:

```bash
npx prisma db push --accept-data-loss && node prisma/seed.js && node src/index.js
```

This:
1. Pushes the Prisma schema to PostgreSQL (creates all 17 tables).
2. Seeds demo users and sample data.
3. Starts the Express server.

> **Note:** `--accept-data-loss` is safe for the initial deploy. On subsequent deploys, use Prisma Migrations for schema changes (see §5).

---

## 3. Frontend — Vercel Deployment

### 3.1 Project Structure (Frontend)

```
frontend/
├── src/
│   ├── app/                # 17 pages (Next.js App Router)
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Authentication
│   │   ├── dashboard/      # KPI overview + charts
│   │   ├── pos/            # Point-of-Sale screen
│   │   ├── products/       # Product catalog
│   │   ├── inventory/      # Stock management
│   │   ├── purchases/      # Purchase orders
│   │   ├── reports/        # Analytics
│   │   ├── customers/      # Customer management
│   │   ├── suppliers/      # Supplier management
│   │   ├── categories/     # Product categories
│   │   ├── expenses/       # Expense tracking
│   │   ├── branches/       # Branch management (admin)
│   │   ├── taxes/          # Tax rate management (admin)
│   │   ├── users/          # User management (admin)
│   │   ├── security/       # Security center page
│   │   └── terms/          # Terms of service
│   ├── components/         # Shared UI components
│   │   ├── layout/         # AppLayout, Sidebar
│   │   ├── pos/            # POS-specific components
│   │   └── ui/             # Generic UI primitives
│   └── lib/                # Utilities
│       ├── api.ts          # Axios client with JWT interceptor
│       ├── auth.tsx        # Auth context provider
│       └── utils.ts        # Formatters (currency, dates)
├── vercel.json             # Security headers, CSP, framework config
├── next.config.ts
└── package.json
```

### 3.2 Step-by-Step Vercel Deployment

#### Step 1 — Import Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** → **Project**.
3. Import the `SmartPOS` GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Vercel will auto-detect Next.js.

#### Step 2 — Configure Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.up.railway.app/api` |

> `NEXT_PUBLIC_` prefix makes this variable available in the browser bundle.

#### Step 3 — Deploy

1. Click **Deploy**.
2. Vercel will run `npm install`, `next build`, and deploy the static export + serverless functions.
3. After deployment, Vercel provides a URL like `https://smart-pos-plum.vercel.app`.

#### Step 4 — Update Backend CORS

After getting your Vercel URL, update the backend environment:

```
FRONTEND_URL=https://your-project.vercel.app
```

If using Railway, edit the variable and redeploy (or it auto-deploys).

#### Step 5 — Verify End-to-End

1. Visit your Vercel URL.
2. Log in with demo credentials (see §7 of README).
3. Navigate through the dashboard, POS, and reports.
4. Open browser DevTools → Network tab to confirm API calls reach Railway successfully.

---

## 4. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret key for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | `24h` | Token expiration duration |
| `PORT` | ❌ | `5000` | Express server port |
| `FRONTEND_URL` | ✅ | — | Allowed CORS origin (your Vercel URL) |
| `NODE_ENV` | ❌ | `development` | Set to `production` to disable dev features |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:5000/api` | Backend API base URL |

---

## 5. Database

### 5.1 Production Database (PostgreSQL)

Railway PostgreSQL handles automated backups, point-in-time recovery, and connection pooling. The Prisma schema (`backend/prisma/schema.prisma`) defines 17 tables:

| Table | Purpose |
|-------|---------|
| `branches` | Store branches/locations |
| `users` | System users with role-based access |
| `products` | Product catalog with barcodes, pricing |
| `categories` | Product groupings |
| `suppliers` | Vendor information |
| `customers` | Customer profiles with loyalty points |
| `sales` | Completed sale transactions |
| `payments` | Split payment records per sale |
| `sale_items` | Line items within a sale |
| `stock_movements` | Audit trail for all stock changes |
| `purchases` | Purchase orders |
| `purchase_items` | Line items within a purchase |
| `tax_rates` | Tax classes applied to products |
| `expenses` | Operational expense tracking |
| `sales_returns` | Return/refund transactions |
| `return_items` | Items within a return |
| `_prisma_migrations` | Schema migration history |

### 5.2 Migrations

For production schema changes:

```bash
# After modifying schema.prisma, generate the migration:
npx prisma migrate dev --name describe_change

# Apply in production:
npx prisma migrate deploy
```

For the initial Railway deploy, the Dockerfile uses `prisma db push` which is simpler but doesn't create migration files. For ongoing production management, switch to `prisma migrate deploy`.

---

## 6. Custom Domain Setup

### Frontend (Vercel)

1. In Vercel project → **Settings** → **Domains**.
2. Add your custom domain (e.g., `pos.yourbusiness.com`).
3. Configure DNS: add a CNAME record pointing to `cname.vercel-dns.com`.
4. Vercel provisions an SSL certificate automatically (Let's Encrypt).

### Backend (Railway)

1. In Railway project → **Settings** → **Domains**.
2. Add a custom domain.
3. Add a CNAME record pointing to `railway.app` at your DNS provider.
4. Update `FRONTEND_URL` in backend env vars to match the new frontend domain.
5. Update `NEXT_PUBLIC_API_URL` in frontend env vars to match the new backend domain.
6. Redeploy both services.

---

## 7. Troubleshooting

### 7.1 Build Failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| `prisma generate` fails | Missing PostgreSQL client libraries in Docker | Ensure `openssl` and `ca-certificates` are installed (already in Dockerfile) |
| Next.js build fails | Missing env vars | Verify `NEXT_PUBLIC_API_URL` is set in Vercel project settings |
| TypeScript errors | Type mismatch after schema changes | Run `npx prisma generate` and update frontend types |

### 7.2 Runtime Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `401 Unauthorized` on all API calls | JWT_SECRET mismatch between backend and frontend | Regenerate token by logging out and back in |
| `CORS` errors in browser | FRONTEND_URL not set or incorrect | Update backend env var and redeploy |
| `429 Too Many Requests` | Rate limiter hit (3 attempts per 60s per IP) | Wait 60 seconds before retrying login |
| Blank page on Vercel | CSP blocking inline scripts | Verify `script-src 'unsafe-inline'` in `vercel.json` |
| API returns HTML instead of JSON | Request hitting non-API route | Ensure URL starts with `/api/...` |

### 7.3 Database Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ECONNREFUSED` connecting to DB | PostgreSQL not yet provisioned or credentials wrong | Check Railway dashboard → PostgreSQL tab for connection string |
| Missing tables | Schema not pushed | Run `npx prisma db push --accept-data-loss` |
| Seed data missing | Seed script didn't run | Connect via Railway CLI: `railway run node prisma/seed.js` |
| `Unique constraint failed` | Duplicate data in seed | Seed script uses `upsert`, so re-running is safe |

### 7.4 Railway-Specific

```bash
# Install Railway CLI
npm i -g @railway/cli

# Link to project
railway login
railway link

# View live logs
railway logs

# Run a command in the deployed environment
railway run node prisma/seed.js

# Open PostgreSQL shell
railway connect
```

---

## 8. Local Development

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your local database URL (SQLite or MySQL)

npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
node src/index.js
# → http://localhost:5000
```

Backend defaults to port 5000. Health check at `http://localhost:5000/api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Frontend defaults to port 3000 and proxies API calls to `http://localhost:5000/api`.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartpos.com` | `admin123` |
| Manager | `manager@smartpos.com` | `manager123` |
| Cashier | `cashier@smartpos.com` | `cashier123` |
| Stock Officer | `stock@smartpos.com` | `stock123` |

---

## Security Headers (Production)

The `vercel.json` file configures these security headers on every response:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' blob:; ...` | Prevents XSS and data injection |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unused browser APIs |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS |
| `Access-Control-Allow-Origin` | Scoped to frontend domain | CORS restriction |

## CI/CD Pipeline

```
Git Push → GitHub → Vercel (auto-deploy frontend)
                 → Railway (auto-deploy backend)
```

Both platforms rebuild and deploy automatically when changes are pushed to the default branch. Frontend builds run on Vercel's infrastructure (~30s for this project). Backend builds run in Railway's Docker container (~60s).
