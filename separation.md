# Subtribe Frontend Separation Plan

**Objective**: Split the current monolithic Next.js app into two separate projects:

- `subtribe-dashboard` → dashboard.thesubtribe.com (Admin/Client interface)
- `subtribe-app` → app.thesubtribe.com (Candidate/Public interface)

**Strategy**: Copy entire project to both directories, then remove what's not needed from each. Use command-line operations for speed.

**Estimated Time**: 2.5-3 hours

---

## Table of Contents

1. [Current vs Target Structure](#current-vs-target-structure)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Project Setup](#phase-1-project-setup)
4. [Phase 2: Dashboard Cleanup](#phase-2-dashboard-cleanup)
5. [Phase 3: App Cleanup](#phase-3-app-cleanup)
6. [Phase 4: Configuration Updates](#phase-4-configuration-updates)
7. [Phase 5: Deployment Workflows](#phase-5-deployment-workflows)
8. [Phase 6: Testing](#phase-6-testing)
9. [Phase 7: Deployment](#phase-7-deployment)
10. [Rollback Plan](#rollback-plan)

---

## Current vs Target Structure

### Current Structure

```
subtribe-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth routes
│   │   ├── (dashboard)/     # Admin routes
│   │   └── apply/           # Public routes
│   ├── components/
│   ├── lib/
│   └── types/
├── .github/workflows/
├── package.json
└── next.config.ts
```

### Target Structure

```
/Volumes/Work/Subtribe/
├── subtribe-dashboard/      # NEW - Admin app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Keep
│   │   │   └── (dashboard)/ # Keep (routes become top-level)
│   │   ├── components/      # Keep all
│   │   ├── lib/             # Keep all
│   │   └── types/           # Keep all
│   ├── .github/workflows/   # Dashboard-specific workflows
│   └── package.json
│
├── subtribe-app/            # NEW - Candidate app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Keep
│   │   │   ├── apply/       # Keep
│   │   │   └── jobs/        # NEW - Public job listing
│   │   ├── components/      # Keep all (will diverge over time)
│   │   ├── lib/             # Keep all (will diverge over time)
│   │   └── types/           # Keep all
│   ├── .github/workflows/   # App-specific workflows
│   └── package.json
│
└── subtribe-frontend/       # KEEP - Original (backup/reference)
```

---

## Prerequisites

**Before starting:**

```bash
# Ensure you're in the right directory
cd /Volumes/Work/Subtribe/subtribe-frontend

# Check current git status (should be clean)
git status

# Create a backup branch
git checkout -b backup/pre-separation
git push origin backup/pre-separation

# Return to develop branch
git checkout develop/v1
```

---

## Phase 1: Project Setup

### Step 1.1: Create Dashboard Project

```bash
# Navigate to parent directory
cd /Volumes/Work/Subtribe

# Copy entire project to dashboard
cp -R subtribe-frontend subtribe-dashboard

# Verify copy
ls -la subtribe-dashboard
```

### Step 1.2: Create App Project

```bash
# Still in /Volumes/Work/Subtribe

# Copy entire project to app
cp -R subtribe-frontend subtribe-app

# Verify copy
ls -la subtribe-app
```

### Step 1.3: Initialize Git Repositories

```bash
# Initialize dashboard git repo
cd subtribe-dashboard
rm -rf .git
git init
git add .
git commit -m "Initial commit: Dashboard app separated from monolith"

# Initialize app git repo
cd ../subtribe-app
rm -rf .git
git init
git add .
git commit -m "Initial commit: App (candidate) separated from monolith"
```

---

## Phase 2: Dashboard Cleanup

**Goal**: Remove public/candidate-facing routes and components.

```bash
# Navigate to dashboard project
cd /Volumes/Work/Subtribe/subtribe-dashboard
```

### Step 2.1: Remove Candidate Routes

```bash
# Remove public apply route
rm -rf src/app/apply

# Note: Keep (auth) and (dashboard) route groups
```

### Step 2.2: Remove App-Specific Components

```bash
# Remove candidate-specific shared components
rm -f src/components/shared/ApplyPageFooter.tsx
```

### Step 2.3: Remove App-Specific Libraries

```bash
# Remove SEO library (only needed for public job pages)
rm -f src/lib/seo.ts

# Note: Keep everything else (may be useful for dashboard)
```

### Step 2.4: Update Sitemap (Dashboard-Specific)

```bash
# Remove sitemap (dashboard should not be indexed)
rm -f src/app/sitemap.ts
```

### Step 2.5: Commit Dashboard Cleanup

```bash
git add .
git commit -m "Remove candidate-facing routes and components"
```

---

## Phase 3: App Cleanup

**Goal**: Remove admin/dashboard routes and components.

```bash
# Navigate to app project
cd /Volumes/Work/Subtribe/subtribe-app
```

### Step 3.1: Remove Dashboard Routes

```bash
# Remove entire dashboard route group
rm -rf src/app/\(dashboard\)
```

### Step 3.2: Remove Dashboard Components

```bash
# Remove dashboard-specific components
rm -f src/components/shared/Sidebar.tsx
rm -f src/components/shared/Header.tsx
rm -f src/components/shared/CandidateCard.tsx
rm -f src/components/shared/StatusUpdateModal.tsx
rm -f src/components/shared/EmptyState.tsx
```

### Step 3.3: Remove Dashboard Libraries

```bash
# Remove candidate management library
rm -f src/lib/candidates.ts

# Remove status update config
rm -f src/lib/status-update-config.ts
```

### Step 3.4: Create Public Jobs Route

```bash
# Create jobs directory for public job listing
mkdir -p src/app/jobs

# We'll add page.tsx in the next phase
```

### Step 3.5: Commit App Cleanup

```bash
git add .
git commit -m "Remove dashboard routes and components"
```

---

## Phase 4: Configuration Updates

### Step 4.1: Update Dashboard Configuration

```bash
cd /Volumes/Work/Subtribe/subtribe-dashboard
```

#### Update package.json (name and scripts)

```bash
# Edit package.json - change name
# From: "name": "subtribe-frontend"
# To:   "name": "subtribe-dashboard"
```

**File Edit Required**: `package.json`

```json
{
  "name": "subtribe-dashboard",
  "version": "1.0.0",
  "private": true
}
```

#### Update next.config.ts

No changes needed - already using standalone output.

#### Update middleware.ts for Dashboard

**File Edit Required**: `src/middleware.ts`

Change CSP headers to include dashboard domain:

```typescript
// Line ~20: Update CSP
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://api.thesubtribe.com https://dashboard.thesubtribe.com https://*.run.app",
  "frame-src 'self' https://storage.googleapis.com",
].join("; ");
```

#### Update app/layout.tsx metadata

**File Edit Required**: `src/app/layout.tsx`

```typescript
// Line ~10: Update metadata
export const metadata: Metadata = {
  title: "Subtribe ATS - Dashboard",
  description: "Manage your hiring pipeline with AI-powered applicant tracking",
};
```

#### Create robots.txt (Block indexing)

**File Edit Required**: `public/robots.txt`

```bash
# Overwrite robots.txt
cat > public/robots.txt << 'EOF'
User-agent: *
Disallow: /
EOF
```

#### Commit Dashboard Configuration

```bash
git add .
git commit -m "Update dashboard configuration and metadata"
```

---

### Step 4.2: Update App Configuration

```bash
cd /Volumes/Work/Subtribe/subtribe-app
```

#### Update package.json (name and scripts)

**File Edit Required**: `package.json`

```json
{
  "name": "subtribe-app",
  "version": "1.0.0",
  "private": true
}
```

#### Update middleware.ts for App

**File Edit Required**: `src/middleware.ts`

Change CSP headers:

```typescript
// Line ~20: Update CSP
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://api.thesubtribe.com https://app.thesubtribe.com https://*.run.app",
  "frame-src 'self' https://storage.googleapis.com",
].join("; ");
```

#### Update app/layout.tsx metadata

**File Edit Required**: `src/app/layout.tsx`

```typescript
// Line ~10: Update metadata
export const metadata: Metadata = {
  title: "Jobs | Subtribe",
  description:
    "Find your next opportunity - Browse and apply to open positions",
};
```

#### Update robots.txt (Allow indexing)

**File Edit Required**: `public/robots.txt`

```bash
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://app.thesubtribe.com/sitemap.xml
EOF
```

#### Create Public Jobs Listing Page

**File Edit Required**: `src/app/jobs/page.tsx`

```bash
# Copy from apply page as template
cp src/app/apply/\[jobId\]/page.tsx src/app/jobs/page.tsx
```

Then edit `src/app/jobs/page.tsx` to create a job listing page:

```typescript
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default async function JobsPage() {
  const response = await apiClient.get('/public/jobs');
  const jobs = response.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Open Positions</h1>
        <div className="grid gap-6">
          {jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/apply/${job.slug}`}
              className="border rounded-lg p-6 hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-semibold">{job.title}</h2>
              <p className="text-muted-foreground mt-2">{job.location}</p>
              <p className="mt-4">{job.description.substring(0, 150)}...</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### Update Auth Redirects

**File Edit Required**: `src/app/(auth)/sign-in/page.tsx`

Since app doesn't have dashboard routes, redirect to `/apply` or `/jobs` after login:

```typescript
// Line ~45: Change redirect after successful login
// From: router.push('/');
// To:   router.push('/jobs');
```

#### Commit App Configuration

```bash
git add .
git commit -m "Update app configuration, add public jobs page"
```

---

## Phase 5: Deployment Workflows

### Step 5.1: Dashboard Workflows

```bash
cd /Volumes/Work/Subtribe/subtribe-dashboard
```

#### Remove old workflows

```bash
rm -rf .github/workflows/*
```

#### Create Dashboard Dev Workflow

**File Edit Required**: `.github/workflows/deploy-dev.yml`

```bash
cat > .github/workflows/deploy-dev.yml << 'EOF'
name: Deploy Dashboard to Dev

on:
  push:
    branches:
      - develop

env:
  PROJECT_ID: subtribe-431617
  REGION: asia-south1
  SERVICE_NAME: subtribe-dashboard-dev

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Check formatting
        run: pnpm format

      - name: Type check
        run: pnpm typecheck

  deploy-dev:
    needs: lint-and-format
    runs-on: ubuntu-latest
    if: startsWith(github.event.head_commit.message, 'push-')

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and push Docker image
        run: |
          docker build \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest \
            .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ github.sha }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --max-instances=1 \
            --set-env-vars="NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app,NEXT_PUBLIC_BASE_URL=https://dashboard-dev.thesubtribe.com,NODE_ENV=development"
EOF
```

#### Create Dashboard Prod Workflow

**File Edit Required**: `.github/workflows/deploy-prod.yml`

```bash
cat > .github/workflows/deploy-prod.yml << 'EOF'
name: Deploy Dashboard to Production

on:
  workflow_dispatch:
    inputs:
      confirmation:
        description: 'Type "deploy-to-production" to confirm'
        required: true

env:
  PROJECT_ID: subtribe-431617
  REGION: asia-south1
  SERVICE_NAME: subtribe-dashboard-prod

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate confirmation
        run: |
          if [ "${{ github.event.inputs.confirmation }}" != "deploy-to-production" ]; then
            echo "Confirmation text does not match. Deployment cancelled."
            exit 1
          fi

  deploy-prod:
    needs: validate
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Bump version and create tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v6.2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Release
        uses: ncipollo/release-action@v1
        with:
          tag: ${{ steps.tag_version.outputs.new_tag }}
          name: Dashboard ${{ steps.tag_version.outputs.new_tag }}
          body: ${{ steps.tag_version.outputs.changelog }}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and push Docker image
        run: |
          docker build \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ steps.tag_version.outputs.new_tag }} \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest \
            .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ steps.tag_version.outputs.new_tag }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ steps.tag_version.outputs.new_tag }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --max-instances=2 \
            --set-env-vars="NEXT_PUBLIC_API_URL=https://api.thesubtribe.com,NEXT_PUBLIC_BASE_URL=https://dashboard.thesubtribe.com,NODE_ENV=production"
EOF
```

#### Commit Dashboard Workflows

```bash
git add .github/workflows/
git commit -m "Add dashboard-specific deployment workflows"
```

---

### Step 5.2: App Workflows

```bash
cd /Volumes/Work/Subtribe/subtribe-app
```

#### Remove old workflows

```bash
rm -rf .github/workflows/*
```

#### Create App Dev Workflow

**File Edit Required**: `.github/workflows/deploy-dev.yml`

```bash
cat > .github/workflows/deploy-dev.yml << 'EOF'
name: Deploy App to Dev

on:
  push:
    branches:
      - develop

env:
  PROJECT_ID: subtribe-431617
  REGION: asia-south1
  SERVICE_NAME: subtribe-app-dev

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Check formatting
        run: pnpm format

      - name: Type check
        run: pnpm typecheck

  deploy-dev:
    needs: lint-and-format
    runs-on: ubuntu-latest
    if: startsWith(github.event.head_commit.message, 'push-')

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and push Docker image
        run: |
          docker build \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest \
            .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ github.sha }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --max-instances=3 \
            --set-env-vars="NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app,NEXT_PUBLIC_BASE_URL=https://app-dev.thesubtribe.com,NODE_ENV=development"
EOF
```

#### Create App Prod Workflow

**File Edit Required**: `.github/workflows/deploy-prod.yml`

```bash
cat > .github/workflows/deploy-prod.yml << 'EOF'
name: Deploy App to Production

on:
  workflow_dispatch:
    inputs:
      confirmation:
        description: 'Type "deploy-to-production" to confirm'
        required: true

env:
  PROJECT_ID: subtribe-431617
  REGION: asia-south1
  SERVICE_NAME: subtribe-app-prod

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate confirmation
        run: |
          if [ "${{ github.event.inputs.confirmation }}" != "deploy-to-production" ]; then
            echo "Confirmation text does not match. Deployment cancelled."
            exit 1
          fi

  deploy-prod:
    needs: validate
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Bump version and create tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v6.2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Release
        uses: ncipollo/release-action@v1
        with:
          tag: ${{ steps.tag_version.outputs.new_tag }}
          name: App ${{ steps.tag_version.outputs.new_tag }}
          body: ${{ steps.tag_version.outputs.changelog }}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and push Docker image
        run: |
          docker build \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ steps.tag_version.outputs.new_tag }} \
            -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest \
            .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ steps.tag_version.outputs.new_tag }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/subtribe/${{ env.SERVICE_NAME }}:${{ steps.tag_version.outputs.new_tag }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --max-instances=5 \
            --set-env-vars="NEXT_PUBLIC_API_URL=https://api.thesubtribe.com,NEXT_PUBLIC_BASE_URL=https://app.thesubtribe.com,NODE_ENV=production"
EOF
```

#### Commit App Workflows

```bash
git add .github/workflows/
git commit -m "Add app-specific deployment workflows"
```

---

## Phase 6: Testing

### Step 6.1: Test Dashboard Locally

```bash
cd /Volumes/Work/Subtribe/subtribe-dashboard

# Install dependencies
pnpm install

# Run type check
pnpm typecheck

# Run linter
pnpm lint

# Start dev server
pnpm dev
```

**Manual Testing Checklist:**

- [ ] Navigate to http://localhost:3000
- [ ] Sign in works (redirects to dashboard)
- [ ] Dashboard home loads with stats
- [ ] Jobs list works
- [ ] Create job works
- [ ] Edit job works
- [ ] Application detail works
- [ ] `/apply` route is 404 (good!)

### Step 6.2: Test App Locally

```bash
cd /Volumes/Work/Subtribe/subtribe-app

# Install dependencies
pnpm install

# Run type check
pnpm typecheck

# Run linter
pnpm lint

# Start dev server (use different port)
PORT=3001 pnpm dev
```

**Manual Testing Checklist:**

- [ ] Navigate to http://localhost:3001
- [ ] `/jobs` page loads and shows job list
- [ ] `/apply/[jobId]` page loads for a specific job
- [ ] Application submission works
- [ ] Sign up works (for future candidate auth)
- [ ] Dashboard routes are 404 (good!)

---

## Phase 7: Deployment

### Step 7.1: Push to GitHub

#### Dashboard Repository

```bash
cd /Volumes/Work/Subtribe/subtribe-dashboard

# Create GitHub repository (via GitHub CLI or web interface)
gh repo create subtribe-dashboard --private --source=. --remote=origin

# Or add remote manually
git remote add origin git@github.com:yourorg/subtribe-dashboard.git

# Push to GitHub
git push -u origin main
```

#### App Repository

```bash
cd /Volumes/Work/Subtribe/subtribe-app

# Create GitHub repository
gh repo create subtribe-app --private --source=. --remote=origin

# Or add remote manually
git remote add origin git@github.com:yourorg/subtribe-app.git

# Push to GitHub
git push -u origin main
```

### Step 7.2: Configure GitHub Secrets

**For both repositories**, add the following secrets in GitHub Settings → Secrets and variables → Actions:

```
GCP_SA_KEY: [Your Google Cloud Service Account JSON key]
```

### Step 7.3: Create Cloud Run Services

#### Dashboard Services

```bash
# Create dev service (if not exists)
gcloud run deploy subtribe-dashboard-dev \
  --image=gcr.io/cloudrun/hello \
  --platform=managed \
  --region=asia-south1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=1 \
  --project=subtribe-431617

# Create prod service (if not exists)
gcloud run deploy subtribe-dashboard-prod \
  --image=gcr.io/cloudrun/hello \
  --platform=managed \
  --region=asia-south1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=2 \
  --project=subtribe-431617
```

#### App Services

```bash
# Create dev service (if not exists)
gcloud run deploy subtribe-app-dev \
  --image=gcr.io/cloudrun/hello \
  --platform=managed \
  --region=asia-south1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=3 \
  --project=subtribe-431617

# Create prod service (if not exists)
gcloud run deploy subtribe-app-prod \
  --image=gcr.io/cloudrun/hello \
  --platform=managed \
  --region=asia-south1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=5 \
  --project=subtribe-431617
```

### Step 7.4: Deploy Dashboard (Dev)

```bash
cd /Volumes/Work/Subtribe/subtribe-dashboard

# Create a push- commit to trigger deployment
git commit --allow-empty -m "push-Initial dashboard deployment"
git push origin main
```

Monitor deployment at: https://github.com/yourorg/subtribe-dashboard/actions

### Step 7.5: Deploy App (Dev)

```bash
cd /Volumes/Work/Subtribe/subtribe-app

# Create a push- commit to trigger deployment
git commit --allow-empty -m "push-Initial app deployment"
git push origin main
```

Monitor deployment at: https://github.com/yourorg/subtribe-app/actions

### Step 7.6: Configure Custom Domains

#### Map Dashboard Domains

```bash
# Dev
gcloud run domain-mappings create \
  --service=subtribe-dashboard-dev \
  --domain=dashboard-dev.thesubtribe.com \
  --region=asia-south1 \
  --project=subtribe-431617

# Prod
gcloud run domain-mappings create \
  --service=subtribe-dashboard-prod \
  --domain=dashboard.thesubtribe.com \
  --region=asia-south1 \
  --project=subtribe-431617
```

#### Map App Domains

```bash
# Dev
gcloud run domain-mappings create \
  --service=subtribe-app-dev \
  --domain=app-dev.thesubtribe.com \
  --region=asia-south1 \
  --project=subtribe-431617

# Prod
gcloud run domain-mappings create \
  --service=subtribe-app-prod \
  --domain=app.thesubtribe.com \
  --region=asia-south1 \
  --project=subtribe-431617
```

#### Update DNS Records

Add the following DNS records in your domain registrar (e.g., Cloudflare):

```
# Dashboard Dev
Type: CNAME
Name: dashboard-dev
Target: ghs.googlehosted.com

# Dashboard Prod
Type: CNAME
Name: dashboard
Target: ghs.googlehosted.com

# App Dev
Type: CNAME
Name: app-dev
Target: ghs.googlehosted.com

# App Prod
Type: CNAME
Name: app
Target: ghs.googlehosted.com
```

### Step 7.7: Verify Deployments

```bash
# Check dashboard dev
curl -I https://dashboard-dev.thesubtribe.com

# Check dashboard prod (after manual trigger)
curl -I https://dashboard.thesubtribe.com

# Check app dev
curl -I https://app-dev.thesubtribe.com

# Check app prod (after manual trigger)
curl -I https://app.thesubtribe.com
```

---

## Phase 8: Update Original Frontend

**Optional**: Update the original `subtribe-frontend` README to indicate it's been split.

```bash
cd /Volumes/Work/Subtribe/subtribe-frontend

cat > README.md << 'EOF'
# Subtribe Frontend (Archived)

This repository has been split into two separate applications:

- **Dashboard**: https://github.com/yourorg/subtribe-dashboard
  - Admin/Client interface at dashboard.thesubtribe.com

- **App**: https://github.com/yourorg/subtribe-app
  - Candidate/Public interface at app.thesubtribe.com

This repository is kept for reference and historical purposes.

## Migration Date
[Insert date here]

## Backup Branch
All pre-separation code is available in the `backup/pre-separation` branch.
EOF

git add README.md
git commit -m "Update README - project has been split"
git push origin develop/v1
```

---

## Rollback Plan

If something goes wrong, here's how to rollback:

### Rollback Dashboard

```bash
cd /Volumes/Work/Subtribe/subtribe-dashboard

# Revert to previous commit
git log --oneline  # Find the commit SHA to rollback to
git reset --hard <commit-sha>
git push origin main --force

# Or rollback Cloud Run deployment
gcloud run services update-traffic subtribe-dashboard-dev \
  --to-revisions=<previous-revision>=100 \
  --region=asia-south1 \
  --project=subtribe-431617
```

### Rollback App

```bash
cd /Volumes/Work/Subtribe/subtribe-app

# Revert to previous commit
git log --oneline
git reset --hard <commit-sha>
git push origin main --force

# Or rollback Cloud Run deployment
gcloud run services update-traffic subtribe-app-dev \
  --to-revisions=<previous-revision>=100 \
  --region=asia-south1 \
  --project=subtribe-431617
```

### Complete Rollback (Revert to Monolith)

```bash
# Point domains back to original Cloud Run services
# Update DNS to point to original subtribe-frontend-dev/prod
# Delete new repositories and services if needed
```

---

## Post-Deployment Checklist

### Dashboard

- [ ] Sign in works
- [ ] Dashboard home loads
- [ ] Jobs CRUD operations work
- [ ] Applications management works
- [ ] Resume viewing works
- [ ] Stats are accurate

### App

- [ ] `/jobs` page loads and shows jobs
- [ ] Individual job pages load (`/apply/[jobId]`)
- [ ] Application submission works
- [ ] Resume upload works
- [ ] Sign up works (for future)
- [ ] Sitemap is accessible at `/sitemap.xml`

### Infrastructure

- [ ] Dashboard dev deployment working
- [ ] Dashboard prod deployment working
- [ ] App dev deployment working
- [ ] App prod deployment working
- [ ] Custom domains resolving correctly
- [ ] SSL certificates issued
- [ ] GitHub Actions secrets configured

---

## Known Issues & Future Work

### Known Issues

1. **Auth Redirect**: App redirects to `/jobs` after login, which may not be the ideal UX for candidates (will improve with candidate auth)
2. **Shared Types**: If backend API changes, types must be updated in BOTH repositories
3. **Component Drift**: UI components will diverge over time - this is intentional

### Future Work

1. **Candidate Authentication**: Implement candidate-specific auth in app (separate from admin auth)
2. **Job Search & Filters**: Add search and filtering to `/jobs` page
3. **SEO Optimization**: Add proper meta tags and JSON-LD to app
4. **Analytics**: Add separate analytics for dashboard vs app
5. **Monitoring**: Set up separate error tracking for each app

---

## Summary

**What We Did:**

1. Created two separate Next.js applications from one monolith
2. Dashboard gets all admin routes, App gets all public routes
3. Both apps start identical, will diverge over time
4. Separate deployments, separate domains, separate workflows
5. No shared code management (intentional for design language divergence)

**Time Investment:**

- Setup: 2-3 hours
- Testing: 30-60 minutes
- Deployment: 30-60 minutes
- **Total: 3-5 hours**

**Result:**

- `dashboard.thesubtribe.com` - Admin interface
- `app.thesubtribe.com` - Candidate interface
- Clean separation, independent evolution, fast iteration

---

## Commands Quick Reference

```bash
# Navigate to projects
cd /Volumes/Work/Subtribe/subtribe-dashboard
cd /Volumes/Work/Subtribe/subtribe-app

# Development
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build

# Deployment (Dev)
git commit --allow-empty -m "push-Deploy to dev"
git push origin main

# Deployment (Prod)
# Trigger via GitHub Actions UI with confirmation

# Check Cloud Run services
gcloud run services list --region=asia-south1 --project=subtribe-431617

# View logs
gcloud run services logs tail subtribe-dashboard-dev --region=asia-south1
gcloud run services logs tail subtribe-app-dev --region=asia-south1
```

---

**End of Separation Plan**
