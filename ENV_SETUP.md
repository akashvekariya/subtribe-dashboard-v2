# Environment Variable Setup - Dashboard

This document explains the environment variables required for the **Dashboard** application.

## Required Environment Variables

### 1. `NEXT_PUBLIC_API_URL` (Required)

**Purpose:** Backend API endpoint for the Subtribe API.

**Local Development:**

```bash
NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app
```

**Production:**

```bash
NEXT_PUBLIC_API_URL=https://api.thesubtribe.com
```

---

### 2. `NEXT_PUBLIC_APP_URL` (Required for job links)

**Purpose:** URL of the **app** (candidate-facing) application. Used to generate public job application links in the dashboard.

**Why this is needed:**

- When you copy a job link or preview a job from the dashboard, the link needs to point to the **app** subdomain (where candidates apply)
- This allows the dashboard and app to run on different ports (local) or different subdomains (production)
- Makes the system flexible - if you change the app's domain tomorrow (e.g., from `app.thesubtribe.com` to `jobs.thesubtribe.com`), you only need to update this environment variable

**Local Development:**

```bash
# Use the port where app/ is running (usually 3001)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Production:**

```bash
# Use your production app domain
NEXT_PUBLIC_APP_URL=https://app.thesubtribe.com
```

**Future-Proof:**

```bash
# If you later change to a jobs subdomain
NEXT_PUBLIC_APP_URL=https://jobs.thesubtribe.com
```

---

### 3. `NEXT_PUBLIC_BASE_URL` (Optional)

**Purpose:** Base URL of the dashboard itself (for canonical URLs, SEO, etc.).

**Local Development:**

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Production:**

```bash
NEXT_PUBLIC_BASE_URL=https://dashboard.thesubtribe.com
```

---

## Setup Instructions

### For Local Development:

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your port configuration:**

   ```bash
   NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app
   NEXT_PUBLIC_APP_URL=http://localhost:3001  # Port where app/ runs
   ```

3. **Start both applications:**

   ```bash
   # Terminal 1 - Dashboard (port 3000)
   cd dashboard
   pnpm dev

   # Terminal 2 - App (port 3001)
   cd app
   PORT=3001 pnpm dev
   ```

4. **Test job link generation:**
   - Open dashboard at http://localhost:3000
   - Go to a job detail page
   - Click "Copy Link" - it should generate `http://localhost:3001/apply/job-slug`
   - Click "Preview" - it should open the app at the correct port

---

### For Production Deployment (GitHub Actions):

1. **Add GitHub repository variables:**

   Go to: `Settings → Secrets and variables → Actions → Variables`

   Add the following **Repository Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://api.thesubtribe.com`
   - `NEXT_PUBLIC_APP_URL`: `https://app.thesubtribe.com`
   - `NEXT_PUBLIC_BASE_URL`: `https://dashboard.thesubtribe.com`

2. **Variables are automatically injected during deployment:**
   - At Docker build time (as `--build-arg`)
   - At Cloud Run deployment (as `--set-env-vars`)

---

## How It Works

The dashboard uses a helper function `getPublicJobUrl()` from `src/lib/env.ts`:

```typescript
import { getPublicJobUrl } from "@/lib/env";

// Generate public job URL
const publicUrl = getPublicJobUrl(job.slug);
// Result: http://localhost:3001/apply/my-job-slug (local)
// Result: https://app.thesubtribe.com/apply/my-job-slug (production)
```

**Logic:**

1. If `NEXT_PUBLIC_APP_URL` is set, use it
2. Otherwise, fall back to `window.location.origin` (client-side only)
3. Always prefer the environment variable for consistency

---

## Troubleshooting

### Problem: Job links point to localhost:3000 instead of localhost:3001

**Solution:** Make sure `NEXT_PUBLIC_APP_URL` is set in `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Then restart the dev server:

```bash
pnpm dev
```

---

### Problem: Job links point to wrong domain in production

**Solution:** Update the GitHub repository variable `NEXT_PUBLIC_APP_URL` to the correct domain, then redeploy.

---

### Problem: Environment variable not updating

**Solution:**

1. For local development: Restart `pnpm dev`
2. For production: Trigger a new deployment (environment variables are baked into the Docker image at build time)

---

## Example Scenarios

### Scenario 1: Local Development (Standard Setup)

- **Dashboard:** http://localhost:3000
- **App:** http://localhost:3001
- **Config:** `NEXT_PUBLIC_APP_URL=http://localhost:3001`
- **Result:** Job links → `http://localhost:3001/apply/job-slug`

### Scenario 2: Local Development (Custom Ports)

- **Dashboard:** http://localhost:4000
- **App:** http://localhost:5000
- **Config:** `NEXT_PUBLIC_APP_URL=http://localhost:5000`
- **Result:** Job links → `http://localhost:5000/apply/job-slug`

### Scenario 3: Production (app.thesubtribe.com)

- **Dashboard:** https://dashboard.thesubtribe.com
- **App:** https://app.thesubtribe.com
- **Config:** `NEXT_PUBLIC_APP_URL=https://app.thesubtribe.com`
- **Result:** Job links → `https://app.thesubtribe.com/apply/job-slug`

### Scenario 4: Production (Domain Change)

- **Dashboard:** https://dashboard.thesubtribe.com
- **App:** https://jobs.thesubtribe.com _(changed from app to jobs)_
- **Config:** `NEXT_PUBLIC_APP_URL=https://jobs.thesubtribe.com`
- **Result:** Job links → `https://jobs.thesubtribe.com/apply/job-slug`

**No code changes needed!** Just update the environment variable and redeploy.

---

## Security Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser (they're safe to be public)
- Never put secrets or API keys in `NEXT_PUBLIC_*` variables
- For sensitive config, use server-side environment variables without the `NEXT_PUBLIC_` prefix

---

## Related Files

- **Environment schema:** `src/lib/env.ts`
- **Job URL generator:** `src/lib/env.ts` → `getPublicJobUrl()`
- **Used in:** `src/app/(dashboard)/jobs/[jobId]/page.tsx` (Copy Link & Preview buttons)
- **Deployment config:** `.github/workflows/deploy-dev.yml`, `.github/workflows/deploy-prod.yml`
