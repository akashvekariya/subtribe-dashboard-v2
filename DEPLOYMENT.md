# Subtribe ATS Frontend - Production Deployment Guide

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Security Analysis & Fixes Required](#security-analysis--fixes-required)
3. [Environment Configuration](#environment-configuration)
4. [Domain & Routing Strategy](#domain--routing-strategy)
5. [Logging Infrastructure](#logging-infrastructure)
6. [Docker Containerization](#docker-containerization)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Pre-commit Hooks](#pre-commit-hooks)
9. [Production Deployment Steps](#production-deployment-steps)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Project Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router) with Server-Side Rendering (SSR)
- **Runtime**: Node.js (required for SSR)
- **Build Tool**: Turbopack
- **Styling**: Tailwind CSS 4 + CVA
- **Forms**: React Hook Form + Zod validation
- **API**: RESTful backend on Google Cloud Run (asia-south1)

### Current Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Public: /sign-in, /sign-up
│   ├── (dashboard)/         # Protected: Requires authentication
│   └── apply/[jobId]/       # Public: Job application pages
├── components/
│   ├── ui/                  # Base components (Button, Input, etc)
│   └── shared/              # Feature components (CandidateCard, etc)
├── lib/                     # Core utilities
│   ├── api-client.ts        # Backend API integration
│   ├── auth.ts              # Authentication logic
│   └── seo.ts               # SEO utilities
├── middleware.ts            # Route protection
└── types/                   # TypeScript definitions
```

### Deployment Target

- **Platform**: Google Cloud Run (Serverless containers)
- **Why Cloud Run?**:
  - Auto-scales to zero (cost-effective)
  - Supports SSR (Node.js runtime)
  - Consistent with existing backend deployment
  - Built-in HTTPS & load balancing

---

## Security Analysis & Fixes Required

### 🔴 Critical Issues Found

#### 1. **JWT Tokens Stored in localStorage** (HIGH RISK - XSS Vulnerable)

**Current Implementation** (src/lib/auth.ts:10-18, src/lib/api-client.ts:60):

```typescript
// INSECURE: Tokens exposed to XSS attacks
localStorage.setItem(TOKEN_STORAGE_KEY, token);
```

**Required Fix**: Migrate to HTTP-only cookies

- Backend must set `Set-Cookie` header with `HttpOnly; Secure; SameSite=Lax` flags
- Remove token from response body (backend change)
- Frontend should rely on automatic cookie inclusion via `credentials: 'include'`

**Files to Update**:

- `src/lib/auth.ts` - Remove `setAuthToken()`, `getAuthToken()`, `removeAuthToken()`
- `src/lib/api-client.ts:60-69` - Remove manual `Authorization` header (rely on cookies)
- Backend `/auth/login` and `/auth/register` - Set HTTP-only cookie instead of returning token

#### 2. **No Content Security Policy (CSP)**

**Risk**: XSS, clickjacking, data injection attacks

**Required Fix**: Add CSP headers in middleware

```typescript
// src/middleware.ts (update required)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
response.headers.set(
  "Content-Security-Policy",
  cspHeader.replace(/\s{2,}/g, " ").trim()
);
```

#### 3. **Insecure Cookie Handling**

**Current Implementation** (src/lib/api-client.ts:138):

```typescript
// INSECURE: Missing security flags
document.cookie =
  "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
```

**Required Fix**: Backend should handle logout by clearing cookies with proper flags

- Frontend should only call `/auth/logout` endpoint
- Backend sets: `Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; path=/`

#### 4. **Missing Rate Limiting**

**Risk**: Brute force attacks on login/register endpoints

**Required Fix**: Add simple code-based rate limiting (Python library)

- Use `flask-limiter` or `slowapi` (depending on backend framework)
- Store counters in-memory (acceptable for early stage)
- Limit: 10 failed login attempts per email per 15 minutes
- Note: In-memory limiting only works per Cloud Run instance, not across distributed instances
- Future upgrade path: Migrate to Firestore-based rate limiting when traffic grows

### ✅ Security Checklist Before Production

- [ ] Migrate JWT tokens from localStorage to HTTP-only cookies (Backend + Frontend)
- [ ] Add CSP headers in middleware
- [ ] Enable HSTS (Strict-Transport-Security header)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CSRF protection for state-changing operations
- [ ] Audit all API endpoints for authorization checks (backend)
- [ ] Remove test credentials from .env.example before public repo
- [ ] Enable CORS only for allowed origins (backend already configured)
- [ ] Add security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- [ ] Scan dependencies for vulnerabilities: `npm audit`

---

## Environment Configuration

### Required Environment Variables

#### Development (.env.development)

```bash
# Backend API URL (GCP auto-generated URL - NO custom domain for dev)
NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app

# Base URL (GCP auto-generated URL - NO custom domain for dev)
NEXT_PUBLIC_BASE_URL=https://subtribe-frontend-dev-123456789.asia-south1.run.app

# Next.js Build Settings
NODE_ENV=development

# Optional: Analytics/Monitoring
NEXT_PUBLIC_SENTRY_DSN=         # Error tracking (if using Sentry)
```

**Note**: Development environment uses GCP auto-generated URLs only (no custom domains). This keeps dev/prod environments clearly separated.

#### Production (.env.production)

```bash
# Backend API URL (Custom domain)
NEXT_PUBLIC_API_URL=https://api.thesubtribe.com

# Base URL for SEO and canonical links (Custom domain)
NEXT_PUBLIC_BASE_URL=https://thesubtribe.com

# Next.js Build Settings
NODE_ENV=production

# Optional: Analytics/Monitoring
NEXT_PUBLIC_SENTRY_DSN=         # Error tracking
NEXT_PUBLIC_GA_ID=              # Google Analytics
```

#### Cloud Run Environment Variables (Set in GCP Console)

```bash
# Runtime Configuration
PORT=8080                       # Cloud Run default port
NODE_ENV=production

# API URLs (injected at runtime)
NEXT_PUBLIC_API_URL=https://api.thesubtribe.com
NEXT_PUBLIC_BASE_URL=https://thesubtribe.com
```

### Environment Validation

Currently implemented in `src/lib/env.ts` (optional Zod validation). Consider adding runtime validation for all required vars.

---

## Domain & Routing Strategy

### Production Domain Architecture (CONFIRMED)

1. **Frontend Domains**:
   - `thesubtribe.com` → Public job pages, auth pages (sign-in, sign-up)
   - `dashboard.thesubtribe.com` → Recruiter portal (authenticated)
   - Both domains point to same Cloud Run service (single deployment)

2. **Backend Domain**:
   - `api.thesubtribe.com` → Backend API (all endpoints)
   - Backend team must deploy to this custom domain

3. **Cookie Strategy**:
   - Cookies set with `domain=.thesubtribe.com` (note the leading dot)
   - Single login works across both `thesubtribe.com` AND `dashboard.thesubtribe.com`
   - Backend must set: `Set-Cookie: access_token=...; Domain=.thesubtribe.com; HttpOnly; Secure; SameSite=Lax`

4. **SEO & Indexing**:
   - `thesubtribe.com/apply/*` → Indexed by Google (public job pages)
   - `dashboard.thesubtribe.com/*` → Blocked via robots.txt and sitemap (internal tool)
   - No security risk from subdomain visibility (authentication still required)

### Development Environment (CONFIRMED)

- **NO custom domains for development**
- Frontend: GCP auto-generated URL (e.g., `subtribe-frontend-dev-123456.asia-south1.run.app`)
- Backend: GCP auto-generated URL (e.g., `subtribe-ats-api-dev-189393113297.asia-south1.run.app`)
- Clear separation between dev and prod environments

### Implementation: Single Cloud Run Service

**Why Single Service?**

- Simpler infrastructure (one container, one deployment)
- Cost-effective (no duplicate cold starts)
- Shared session across domains (single login)
- Easier maintenance

**Routing Logic** (already implemented in src/middleware.ts):

- Public routes: `/apply/*`, `/sign-in`, `/sign-up`
- Protected routes: `/dashboard/*`, `/jobs/*`, `/applications/*`

**Subdomain Auto-redirect** (Optional enhancement):

```typescript
// src/middleware.ts - redirect dashboard.thesubtribe.com/ to /dashboard
const hostname = request.headers.get("host") || "";
const isDashboard = hostname.startsWith("dashboard.");

if (isDashboard && pathname === "/") {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

### DNS Configuration (Production Only)

**Google Cloud Domain Mapping** (commands provided in deployment steps):

```bash
# Frontend domains (both point to same service)
gcloud run domain-mappings create \
  --service subtribe-frontend-production \
  --domain thesubtribe.com \
  --region asia-south1

gcloud run domain-mappings create \
  --service subtribe-frontend-production \
  --domain dashboard.thesubtribe.com \
  --region asia-south1
```

**DNS Records** (add in domain registrar after GCP domain mapping):

- Follow verification steps provided by GCP domain mapping command
- Typically requires A record or CNAME pointing to `ghs.googlehosted.com`

**Backend DNS** (backend team responsibility):

```bash
# Backend must configure api.thesubtribe.com
gcloud run domain-mappings create \
  --service subtribe-backend-production \
  --domain api.thesubtribe.com \
  --region asia-south1
```

---

## GCP Project Architecture (CONFIRMED - SIMPLIFIED)

### Single Project for Dev & Prod

**Decision**: Use **single GCP project** with separate Cloud Run services for development and production.

**Rationale**:

- Early stage - don't need complexity of multiple projects yet
- All infrastructure already set up in one project (GCS buckets, service accounts, secrets)
- Can migrate to separate projects later when gaining traction
- Simpler management, faster deployment

**Project Structure**:

```
subtribe (GCP Project ID: YOUR_PROJECT_ID)
├── Cloud Run Services:
│   ├── subtribe-frontend-dev        # Development (GCP auto-generated URL)
│   ├── subtribe-frontend-prod       # Production (custom domains)
│   ├── subtribe-ats-api-dev         # Backend dev (already exists)
│   └── subtribe-ats-api-prod        # Backend prod (TO BE CREATED)
├── Artifact Registry:
│   └── subtribe-ats-backend/        # Existing repo
│       └── subtribe-frontend/       # New repo to create
├── Domains:
│   ├── thesubtribe.com              # Frontend prod
│   ├── dashboard.thesubtribe.com    # Frontend prod subdomain
│   └── api.thesubtribe.com          # Backend prod (TO BE CONFIGURED)
└── GCS Buckets, Secrets: All existing resources remain
```

### Benefits of Single Project (For Now)

1. **Simplicity**: All resources in one place, easier to manage
2. **Cost-effective**: No duplicate infrastructure
3. **Existing setup**: GCS buckets, service accounts, secrets already configured
4. **Fast iteration**: No cross-project coordination needed
5. **Future upgrade path**: Can split later when needed

### Service Account Setup (Single Project)

Use existing service account or create one for GitHub Actions:

```bash
# Check if service account exists
gcloud iam service-accounts list --project=YOUR_PROJECT_ID

# If needed, create new service account
gcloud iam service-accounts create github-actions \
  --project=YOUR_PROJECT_ID \
  --display-name="GitHub Actions Deployer"

# Grant required permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Generate key for GitHub Secrets
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### GitHub Secrets & Variables

**GitHub Secrets** (Repository Settings → Secrets and variables → Actions → Secrets):

```
GCP_SA_KEY              # Service account JSON key (content of github-actions-key.json)
```

**GitHub Variables - Repository Level** (Shared across environments):

```
GCP_PROJECT_ID          # Your GCP project ID
```

**GitHub Variables - Environment Level** (Production environment):

```
API_URL_PRODUCTION      # https://api.thesubtribe.com (once backend deployed)
BASE_URL_PRODUCTION     # https://thesubtribe.com
```

**GitHub Variables - Environment Level** (Development environment):

```
API_URL_DEVELOPMENT     # https://subtribe-ats-api-dev-189393113297.asia-south1.run.app (existing)
BASE_URL_DEVELOPMENT    # Auto-generated Cloud Run URL (set after first dev deploy)
```

**How to Add**:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add Secret: `GCP_SA_KEY` (paste content of github-actions-key.json)
3. Add Variable (Repository): `GCP_PROJECT_ID`
4. Go to Environments → Create "production" environment
5. Add Variables (Production): `API_URL_PRODUCTION`, `BASE_URL_PRODUCTION`
6. Create "development" environment
7. Add Variables (Development): `API_URL_DEVELOPMENT`, `BASE_URL_DEVELOPMENT`

---

## Logging Infrastructure (CONFIRMED)

### CONFIRMED Strategy: Google Cloud Logging Only

**Decision**: Use Google Cloud Logging (free, built-in) with JSON-based structured logs. No Pino, no external tools, zero cost.

**Key Requirements**:

1. **Single log entry per request** (even with errors) - NO log flooding
2. **JSON format** (automatically parsed by Google Cloud Logging)
3. **Include context**: Request ID, user ID, method, path, duration, status, errors
4. **1-2 minute delay acceptable** (Cloud Logging has slight latency)

### Critical: Prevent Log Flooding

**Problem**: Multiple `console.log()` calls create separate log entries, making logs hard to search and analyze.

**BAD (Creates 5 separate log entries)**:

```typescript
console.log("Request started");
console.log("User ID:", userId);
console.log("Path:", path);
// ... API call happens ...
console.log("Response status:", status);
console.log("Request completed");
```

**GOOD (Creates 1 consolidated log entry)**:

```typescript
const logData = {
  requestId,
  userId,
  method,
  path,
  status,
  duration,
  timestamp: new Date().toISOString(),
};

// Single log entry with all context
console.log(JSON.stringify(logData));
```

### Implementation Strategy

#### 1. Create Logger Utility (src/lib/logger.ts)

```typescript
/**
 * Structured logger for Google Cloud Logging
 * Outputs JSON format for automatic parsing
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  status?: number;
  duration?: number;
  error?: string;
  [key: string]: unknown;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log with specified level (outputs single JSON line)
   */
  private log(level: LogLevel, message: string, data?: LogContext) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    };

    // Single console.log call (outputs one JSON line)
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, data);
    }
  }

  info(message: string, data?: LogContext) {
    this.log("info", message, data);
  }

  warn(message: string, data?: LogContext) {
    this.log("warn", message, data);
  }

  error(message: string, data?: LogContext) {
    this.log("error", message, data);
  }
}

// Default logger instance
export const logger = new Logger();
```

#### 2. Add Logging Middleware (src/middleware.ts)

Update middleware to log each request as a single JSON entry:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID(); // Built-in, no uuid library needed
  const startTime = Date.now();

  // Skip logging for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/apply")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);

  // Log after response (calculate duration)
  const duration = Date.now() - startTime;

  // Single log entry with all request context
  logger.info("Request processed", {
    requestId,
    method: request.method,
    path: pathname,
    status: response.status,
    duration,
    userAgent: request.headers.get("user-agent"),
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

#### 3. Error Logging Pattern

When errors occur, consolidate all error context into a single log entry:

```typescript
// In API client (src/lib/api-client.ts)
try {
  const response = await fetch(url, config);
  return handleResponse<T>(response);
} catch (error) {
  // Single log entry with all error context
  logger.error("API request failed", {
    url,
    method: config.method,
    status: error instanceof APIError ? error.status : 0,
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  });

  throw error;
}
```

#### 4. Client-Side Error Logging (ErrorBoundary)

Update ErrorBoundary to log React errors:

```typescript
// In src/components/shared/ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Single log entry for React errors
  const logData = {
    level: 'error',
    message: 'React error boundary caught error',
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(logData));
}
```

### Google Cloud Logging Integration

Cloud Run automatically forwards stdout/stderr to Cloud Logging. Our JSON-formatted console.log() output is automatically parsed as structured logs.

**View Logs**:

```bash
# View all logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=subtribe-frontend-prod" --limit 50 --format json

# View only errors
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=subtribe-frontend-prod AND jsonPayload.level=error" --limit 20

# Search by request ID
gcloud logging read "resource.type=cloud_run_revision AND jsonPayload.requestId=YOUR_REQUEST_ID"
```

**Log Query in Google Cloud Console**:

1. Go to Cloud Console → Logging → Logs Explorer
2. Select resource: Cloud Run Revision → subtribe-frontend-prod
3. Filter by severity: ERROR, INFO, etc.
4. Search by fields: `jsonPayload.requestId`, `jsonPayload.userId`, etc.

### Benefits of This Approach

1. **Zero cost**: No Pino dependency, no external logging service
2. **No log flooding**: Single JSON entry per request (easy to search)
3. **Structured data**: All fields queryable in Cloud Logging
4. **Automatic retention**: Logs kept for 30 days (configurable)
5. **Minimal latency**: 1-2 minute delay acceptable for debugging

### Frontend vs Backend Logging

**Backend (Python/FastAPI)** - Complex suppression needed:

- SQLAlchemy logs every SQL query (verbose!)
- Uvicorn logs every HTTP request (duplicate logs)
- Multiple framework layers flooding logs
- Requires whitelist approach to suppress third-party libraries
- See `logging.md` for full 1877-line implementation

**Frontend (Next.js)** - Simple by design:

- ✅ No ORM → No query logs
- ✅ Node.js doesn't auto-log HTTP requests
- ✅ Single middleware layer → Clean logs
- ✅ Client-side logs stay in browser (never reach Cloud Logging)
- ✅ Only YOUR code logs to Cloud

**Example Output Comparison:**

Backend (Python) - 5+ logs per request:

```bash
WHERE jobs.slug = $1::VARCHAR                          # SQLAlchemy
SELECT companies.id AS companies_id...                 # SQLAlchemy
INFO: 127.0.0.1:58401 - "GET /health HTTP/1.1" 200   # uvicorn
{"level":"info","correlation_id":"...","path":"/health"} # App log
INFO: 127.0.0.1:58453 - "GET /docs HTTP/1.1" 200      # uvicorn
```

Frontend (Next.js) - 1 log per request:

```json
{
  "level": "info",
  "message": "Request processed",
  "timestamp": "2025-11-02T10:25:53.916Z",
  "requestId": "abc-123",
  "method": "GET",
  "path": "/dashboard",
  "status": 200,
  "duration": 12
}
```

### Log Sources: Client vs Server

| Component                                   | Runs Where                    | Goes to Cloud Logs? | Example                  |
| ------------------------------------------- | ----------------------------- | ------------------- | ------------------------ |
| `src/middleware.ts`                         | Server                        | ✅ Yes              | Request/response logging |
| `src/app/sitemap.ts`                        | Server (build + revalidation) | ✅ Yes              | Sitemap generation       |
| `src/lib/logger.ts`                         | Server                        | ✅ Yes              | Structured logging       |
| `src/components/shared/ErrorBoundary.tsx`   | Browser                       | ❌ No               | React error UI           |
| `src/app/(dashboard)/jobs/[jobId]/page.tsx` | Browser                       | ❌ No               | User interactions        |
| Client `console.log/error`                  | Browser                       | ❌ No               | Developer debugging      |

**Key Insight**: Client-side logs stay in the user's browser DevTools and never reach Cloud Logging. Only server-side code (middleware, server components, API routes) logs to Cloud.

### Emergency Log Controls

#### 1. Kill Switch (Complete Disable)

Set `DISABLE_LOGGING=true` to completely disable all logging:

```bash
# In Cloud Run environment variables
DISABLE_LOGGING=true
```

**Use when:**

- Extreme traffic spike (viral growth)
- Emergency cost control
- Temporary debugging session

**Effect:**

- NO logs written to Cloud Logging
- Zero cost
- ⚠️ Warning: No visibility into errors or issues

#### 2. Test Environment Suppression

Automatically skipped in test environment:

```typescript
// In logger.ts
if (process.env.NODE_ENV === "test") {
  return; // No logs during tests
}
```

#### 3. Static Asset Suppression

Already implemented - no logs for:

- `/_next/*` (Next.js assets)
- `/favicon.ico`
- `/robots.txt`
- `/sitemap.xml`
- Any file with extension (`.js`, `.css`, `.png`, etc.)

**Result**: Only actual page requests are logged, not static assets.

### Log Volume Estimates

| Traffic             | Logs per Request | Monthly Logs | Log Size   | Cloud Logging Cost     |
| ------------------- | ---------------- | ------------ | ---------- | ---------------------- |
| 1M requests/month   | 1                | 1M           | ~500 bytes | **FREE** (under 50GB)  |
| 10M requests/month  | 1                | 10M          | ~500 bytes | **FREE** (under 50GB)  |
| 100M requests/month | 1                | 100M         | ~500 bytes | **FREE** (~50GB total) |
| 500M requests/month | 1                | 500M         | ~500 bytes | ~$125/month (250GB)    |

**With DISABLE_LOGGING=true**: $0 at any scale (but no visibility)

**Cost Optimization Strategies:**

1. **0-100M requests**: Full logging (free)
2. **100M-500M requests**: Keep logging (cheap: ~$50-125/month for full visibility)
3. **500M+ requests**: Consider sampling or DISABLE_LOGGING (but you have bigger problems to solve at that scale!)

### Why We Don't Need Backend's Heavy Suppression

The backend requires:

- Full/Smart/Minimal modes
- Route-specific logging rules
- Third-party library suppression (SQLAlchemy, uvicorn, httpx, etc.)
- Whitelist approach (only allow `app.*` loggers)
- 300+ lines of configuration code

**Frontend is simpler because:**

1. ✅ Next.js doesn't have verbose framework logs
2. ✅ No ORM to log SQL queries
3. ✅ Single console.log per request (middleware only)
4. ✅ Client logs never reach Cloud
5. ✅ Static assets already suppressed

**Our implementation is production-ready as-is for 100M+ requests/month.**

---

## Docker Containerization

### Multi-Stage Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Update next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker deployment
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Security: Hide X-Powered-By header

  // Optional: Image optimization (if using next/image)
  images: {
    domains: ["subtribe-ats-api-dev-189393113297.asia-south1.run.app"],
  },
};

export default nextConfig;
```

### .dockerignore

Create `.dockerignore`:

```
node_modules
.next
.git
.env*
!.env.example
npm-debug.log
README.md
CONTEXT.md
.DS_Store
```

### Build & Test Locally

```bash
# Build Docker image
docker build -t subtribe-frontend:latest .

# Run container locally
docker run -p 3000:8080 \
  -e NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app \
  subtribe-frontend:latest

# Test at http://localhost:3000
```

---

## CI/CD Pipeline

### Deployment Strategy (CONFIRMED)

**Development Deployment** (Auto):

- **Trigger**: Any branch with commit message starting with `push-` (e.g., `push-add feature`)
- **Target**: Development GCP project (auto-generated Cloud Run URL)
- **Versioning**: Uses commit SHA (no semantic versioning)
- **No release creation**: Development builds don't create GitHub releases

**Production Deployment** (Manual Trigger Only):

- **Trigger**: Manual workflow dispatch in GitHub Actions (NOT automatic on main branch push)
- **Target**: Production GCP project with custom domains (thesubtribe.com, dashboard.thesubtribe.com)
- **Versioning**: Semantic versioning (v1.0.0, v1.0.1, etc.)
- **Release creation**: Automatically creates GitHub release with changelog

**Rationale**: Development features may accumulate for weeks/months. Production deployment is manually triggered when ready to ship all accumulated features together.

### GitHub Actions Workflows

Create TWO workflow files:

#### 1. Auto-Deployment Workflow (`.github/workflows/deploy.yml`)

```yaml
name: CI/CD Pipeline

# Trigger on all pushes (lint/test runs always, deploy only on conditions)
on:
  push: # All pushes trigger lint-test
  workflow_dispatch: # Allow manual triggering

# Required for auto-versioning (create tags and releases)
permissions:
  contents: write

env:
  PROJECT_ID: ${{ vars.GCP_PROJECT_ID }}
  REGION: asia-south1
  IMAGE_NAME: subtribe-frontend

jobs:
  # ============================================================================
  # Job 1: Lint & Test (runs on all pushes)
  # ============================================================================
  lint-test:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: |
          echo "🔍 Running ESLint..."
          npm run lint
        continue-on-error: false

      - name: Check code formatting
        run: |
          echo "✨ Checking code formatting..."
          npm run format:check
        continue-on-error: false

      - name: Type check
        run: |
          echo "🔎 Running type check..."
          npm run typecheck
        continue-on-error: false

      - name: Summary
        if: success()
        run: |
          echo "✅ All checks passed!"
          echo "   - Code linting ✓"
          echo "   - Code formatting ✓"
          echo "   - Type checking ✓"

  # ============================================================================
  # Job 2: Deploy to Development (runs ONLY on "push-" commit prefix)
  # ============================================================================
  deploy-dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: lint-test
    # Deploy to dev if commit message starts with "push-"
    if: github.event_name == 'push' && startsWith(github.event.head_commit.message, 'push-')

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build Docker image
        run: |
          echo "🔨 Building Docker image for DEVELOPMENT..."
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=${{ vars.API_URL_DEVELOPMENT }} \
            --build-arg NEXT_PUBLIC_BASE_URL=${{ vars.BASE_URL_DEVELOPMENT }} \
            --tag ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME}}/subtribe-frontend-dev:${{ github.sha }} \
            --tag ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-dev:latest \
            .

      - name: Push Docker image
        run: |
          echo "📦 Pushing Docker image to Development Artifact Registry..."
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-dev:${{ github.sha }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-dev:latest

      - name: Deploy to Cloud Run (Development)
        run: |
          echo "🚀 Deploying to DEVELOPMENT Cloud Run..."
          gcloud run deploy subtribe-frontend-dev \
            --image=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-dev:${{ github.sha }} \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --platform=managed \
            --allow-unauthenticated \
            --set-env-vars="NODE_ENV=development,NEXT_PUBLIC_API_URL=${{ vars.API_URL_DEVELOPMENT }},NEXT_PUBLIC_BASE_URL=${{ vars.BASE_URL_DEVELOPMENT }}" \
            --memory=512Mi \
            --cpu=1 \
            --timeout=60s \
            --max-instances=2 \
            --min-instances=0

      - name: Get service URL
        run: |
          SERVICE_URL=$(gcloud run services describe subtribe-frontend-dev \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --format='value(status.url)')
          echo "✅ Development deployment successful!"
          echo "🌐 Service URL: $SERVICE_URL"
          echo "📦 Version: ${{ github.sha }}"

      - name: Smoke test
        run: |
          SERVICE_URL=$(gcloud run services describe subtribe-frontend-dev \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --format='value(status.url)')
          echo "🔍 Running smoke test on $SERVICE_URL..."
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL)
          if [ $HTTP_CODE -eq 200 ] || [ $HTTP_CODE -eq 307 ]; then
            echo "✅ Health check passed (HTTP $HTTP_CODE)"
          else
            echo "❌ Health check failed (HTTP $HTTP_CODE)"
            exit 1
          fi
```

#### 2. Manual Production Deployment (`.github/workflows/deploy-prod.yml`)

```yaml
name: Deploy to Production (Manual)

# ONLY manual trigger (no automatic deployment to production)
on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "deploy-to-production" to confirm'
        required: true
        default: ""

permissions:
  contents: write

env:
  PROJECT_ID: ${{ vars.GCP_PROJECT_ID }}
  REGION: asia-south1
  IMAGE_NAME: subtribe-frontend

jobs:
  deploy-prod:
    name: Deploy to Production
    runs-on: ubuntu-latest
    # Safety check: Only deploy if user typed confirmation
    if: github.event.inputs.confirm == 'deploy-to-production'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Lint & Type Check (Safety check before prod deploy)
        run: |
          npm ci
          npm run lint
          npm run typecheck

      - name: Bump version and create tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v6.2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          default_bump: patch
          release_branches: main
          tag_prefix: v

      - name: Create GitHub Release
        uses: ncipollo/release-action@v1
        with:
          tag: ${{ steps.tag_version.outputs.new_tag }}
          name: Release ${{ steps.tag_version.outputs.new_tag }}
          body: ${{ steps.tag_version.outputs.changelog }}

      - name: Authenticate to Google Cloud (Prod Project)
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build Docker image
        run: |
          VERSION_TAG="${{ steps.tag_version.outputs.new_tag }}"
          echo "🔨 Building Docker image for PRODUCTION version $VERSION_TAG..."
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=https://api.thesubtribe.com \
            --build-arg NEXT_PUBLIC_BASE_URL=https://thesubtribe.com \
            --tag ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:$VERSION_TAG \
            --tag ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:latest \
            --tag ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:${{ github.sha }} \
            .

      - name: Push Docker image
        run: |
          VERSION_TAG="${{ steps.tag_version.outputs.new_tag }}"
          echo "📦 Pushing Docker image to Production Artifact Registry..."
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:$VERSION_TAG
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:latest
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:${{ github.sha }}

      - name: Deploy to Cloud Run (Production)
        run: |
          VERSION_TAG="${{ steps.tag_version.outputs.new_tag }}"
          echo "🚀 Deploying version $VERSION_TAG to PRODUCTION Cloud Run..."
          gcloud run deploy subtribe-frontend-prod \
            --image=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}/subtribe-frontend-prod:$VERSION_TAG \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --platform=managed \
            --allow-unauthenticated \
            --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=https://api.thesubtribe.com,NEXT_PUBLIC_BASE_URL=https://thesubtribe.com" \
            --memory=512Mi \
            --cpu=1 \
            --timeout=60s \
            --concurrency=80 \
            --max-instances=10 \
            --min-instances=0

      - name: Get service URL
        run: |
          VERSION_TAG="${{ steps.tag_version.outputs.new_tag }}"
          SERVICE_URL=$(gcloud run services describe subtribe-frontend-prod \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --format='value(status.url)')
          echo "✅ PRODUCTION deployment successful!"
          echo "🌐 Service URL: $SERVICE_URL"
          echo "🌐 Custom Domains: https://thesubtribe.com, https://dashboard.thesubtribe.com"
          echo "📦 Version: $VERSION_TAG"

      - name: Smoke test
        run: |
          echo "🔍 Running smoke test on production..."
          # Test auto-generated URL
          SERVICE_URL=$(gcloud run services describe subtribe-frontend-prod \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --format='value(status.url)')
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL)
          if [ $HTTP_CODE -eq 200 ] || [ $HTTP_CODE -eq 307 ]; then
            echo "✅ Cloud Run URL health check passed (HTTP $HTTP_CODE)"
          else
            echo "❌ Cloud Run URL health check failed (HTTP $HTTP_CODE)"
            exit 1
          fi

          # Test custom domain (if configured)
          echo "🔍 Testing custom domain https://thesubtribe.com..."
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://thesubtribe.com)
          if [ $HTTP_CODE -eq 200 ] || [ $HTTP_CODE -eq 307 ]; then
            echo "✅ Custom domain health check passed (HTTP $HTTP_CODE)"
          else
            echo "⚠️  Custom domain returned HTTP $HTTP_CODE (may not be configured yet)"
          fi
```

### Required GitHub Secrets & Variables

Add in GitHub repo settings → Secrets and variables → Actions:

**Secrets**:

```
GCP_SA_KEY_PRODUCTION       # Service account JSON key for prod project
GCP_SA_KEY_DEVELOPMENT      # Service account JSON key for dev project
```

**Variables**:

```
GCP_PROJECT_ID_PRODUCTION   # Production GCP project ID (e.g., subtribe-prod-123456)
GCP_PROJECT_ID_DEVELOPMENT  # Development GCP project ID (e.g., subtribe-dev-123456)
API_URL_DEVELOPMENT         # Development backend URL (GCP auto-generated)
BASE_URL_DEVELOPMENT        # Development frontend URL (GCP auto-generated)
```

### Deployment Flow

**Development**:

1. Create feature branch (e.g., `feature/new-dashboard`)
2. Make changes
3. Commit with `push-` prefix: `git commit -m "push-add new dashboard feature"`
4. Push to GitHub: `git push origin feature/new-dashboard`
5. GitHub Actions automatically deploys to dev Cloud Run
6. Test on GCP auto-generated URL

**Production**:

1. Accumulate features in dev environment over time (days/weeks/months)
2. When ready to deploy to production:
   - Go to GitHub Actions tab
   - Select "Deploy to Production (Manual)" workflow
   - Click "Run workflow"
   - Type "deploy-to-production" in confirmation field
   - Click "Run workflow" button
3. Workflow creates semantic version tag (e.g., v1.2.0)
4. Deploys to production Cloud Run with custom domains
5. Creates GitHub release with changelog

### Commit Message Convention

Follow Conventional Commits for automated changelog:

- `feat: Add user profile page` → Triggers deployment
- `fix: Resolve login redirect issue` → Triggers deployment
- `docs: Update README` → Skips deployment (add `[skip ci]` in workflow)

---

## SEO: Sitemap & Robots.txt (CONFIRMED)

### Robots.txt - Block Dashboard from Indexing

Create `public/robots.txt`:

```txt
# Allow search engines to index job application pages only
User-agent: *

# Block all internal/authenticated routes
Disallow: /dashboard
Disallow: /jobs
Disallow: /applications
Disallow: /sign-in
Disallow: /sign-up

# Allow only public job application pages
Allow: /apply

# Sitemap location (dynamic job postings)
Sitemap: https://thesubtribe.com/sitemap.xml
```

**Why Block These Routes**:

- `/dashboard`, `/jobs`, `/applications` → Authenticated recruiter portal (no value for search engines)
- `/sign-in`, `/sign-up` → Auth pages (already redirect authenticated users)
- `/apply/*` → **Allowed** (public job pages with SEO optimization)

### Dynamic Sitemap.xml - Index Job Postings

Create `src/app/sitemap.ts` (Next.js automatic sitemap generation):

```typescript
import { MetadataRoute } from "next";
import { jobsAPI } from "@/lib/api-client";

export const dynamic = "force-dynamic"; // Regenerate on every request
export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thesubtribe.com";

  // Fetch all published jobs from backend
  let jobs: Array<{ slug: string; updated_at: string; created_at: string }> =
    [];

  try {
    // Note: This is a public endpoint, no auth needed
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/jobs`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (response.ok) {
      const data = await response.json();
      jobs = data.data || []; // Backend returns { data: [...], pagination: {...} }
    }
  } catch (error) {
    console.error("Failed to fetch jobs for sitemap:", error);
    // Return empty jobs array if fetch fails (sitemap still generates with homepage)
  }

  // Generate sitemap entries
  return [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    // Public job postings (dynamic)
    ...jobs.map((job) => ({
      url: `${baseUrl}/apply/${job.slug}`,
      lastModified: new Date(job.updated_at || job.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```

**How It Works**:

1. Next.js automatically serves this at `https://thesubtribe.com/sitemap.xml`
2. Google crawls sitemap every 1-7 days
3. New jobs appear in sitemap automatically (regenerated every hour)
4. Jobs update when edited (uses `updated_at` timestamp)

**Backend Requirement**: Ensure backend has `/public/jobs` endpoint that returns all published jobs (paginated). Example response:

```json
{
  "data": [
    {
      "id": "...",
      "slug": "senior-react-developer-remote",
      "title": "Senior React Developer",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-16T14:20:00Z",
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50
  }
}
```

### Add Noindex Meta Tags to Dashboard Pages

Update `src/app/(dashboard)/layout.tsx` to add noindex meta tag:

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,      // Don't index dashboard pages
    follow: false,     // Don't follow links on dashboard pages
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**Triple Protection Strategy**:

1. `robots.txt` → Tells crawlers not to visit dashboard routes
2. Noindex meta tags → If crawler visits anyway, don't index the page
3. Authentication redirect → Crawlers see login page, no content to index

### Testing Sitemap & Robots.txt

**After deployment**:

```bash
# Test robots.txt
curl https://thesubtribe.com/robots.txt

# Test sitemap
curl https://thesubtribe.com/sitemap.xml

# Validate with Google
# Visit: https://www.google.com/ping?sitemap=https://thesubtribe.com/sitemap.xml
```

**Submit to Google Search Console**:

1. Go to https://search.google.com/search-console
2. Add property: `https://thesubtribe.com`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://thesubtribe.com/sitemap.xml`
5. Monitor indexing status (jobs should appear in 1-7 days)

### ✅ Sitemap Implementation (Current Status)

**Decision**: Postpone public job listings until platform has sufficient jobs to showcase.

**Current Implementation**:

- Sitemap serves homepage only (`/`)
- No job listings shown publicly yet
- Prevents false impression of empty platform

**Rationale**:

1. Platform is in early stage testing
2. No public job listing page exists yet
3. Showing empty job list would confuse potential users
4. Better to launch with quality over incomplete features

**Future Enhancement** (when ready):

1. Create public jobs listing page at `/jobs`
2. Backend implements `GET /public/jobs` endpoint
3. Update `src/app/sitemap.ts` (code already documented in file comments)
4. Jobs automatically included in sitemap with hourly regeneration

**Timeline**: Add when platform has 10+ quality jobs to showcase

---

## Pre-commit Hooks

### Install Husky & lint-staged

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### Configure Pre-commit Hook

Update `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
```

### Configure lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  },
  "scripts": {
    "lint-staged": "lint-staged",
    "prepare": "husky"
  }
}
```

### Test Pre-commit Hook

```bash
git add .
git commit -m "test: Verify pre-commit hook"
# Should run linting and formatting automatically
```

---

## Production Deployment Steps

### Phase 1: Security Fixes (CRITICAL - Do First)

1. [ ] **Migrate to HTTP-only cookies**:
   - Update backend `/auth/login` and `/auth/register` to set cookies
   - Remove token from response body (backend)
   - Update frontend `src/lib/auth.ts` to remove localStorage usage
   - Update frontend `src/lib/api-client.ts` to rely on automatic cookie inclusion

2. [ ] **Add security headers**:
   - Update `src/middleware.ts` with CSP, HSTS, X-Frame-Options
   - Test with https://securityheaders.com

3. [ ] **Run security audit**:
   ```bash
   npm audit fix
   npm audit --audit-level=high
   ```

### Phase 2: Infrastructure Setup

4. [ ] **Configure Docker**:
   - Add `Dockerfile` (see above)
   - Update `next.config.ts` with `output: 'standalone'`
   - Add `.dockerignore`
   - Test local build: `docker build -t test .`

5. [ ] **Set up GCP Artifact Registry**:

   ```bash
   gcloud artifacts repositories create subtribe \
     --repository-format=docker \
     --location=asia-south1 \
     --description="Subtribe ATS containers"
   ```

6. [ ] **Create GCP Service Account**:

   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Deployer"

   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"

   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
   ```

7. [ ] **Configure GitHub Secrets**:
   - Add `GCP_SA_KEY` (contents of key.json)
   - Add `GCP_PROJECT_ID`

### Phase 3: CI/CD Pipeline

8. [ ] **Add GitHub Actions workflow**:
   - Create `.github/workflows/deploy.yml` (see above)
   - Test with feature branch first

9. [ ] **Set up pre-commit hooks**:
   - Install Husky: `npm install --save-dev husky lint-staged`
   - Initialize: `npx husky init`
   - Configure lint-staged in package.json

### Phase 4: Domain Configuration

10. [ ] **Configure domains in GCP**:

    ```bash
    # Production
    gcloud run domain-mappings create \
      --service subtribe-frontend-production \
      --domain thesubtribe.com \
      --region asia-south1

    gcloud run domain-mappings create \
      --service subtribe-frontend-production \
      --domain dashboard.thesubtribe.com \
      --region asia-south1

    # Development
    gcloud run domain-mappings create \
      --service subtribe-frontend-development \
      --domain dev.thesubtribe.com \
      --region asia-south1
    ```

11. [ ] **Update DNS records** (in domain registrar):
    - Add A records or CNAMEs as shown by GCP domain mapping command

### Phase 5: Monitoring & Logging

12. [ ] **Set up logging**:
    - Install Pino: `npm install pino pino-pretty`
    - Add logger utility (see Logging section)
    - Update middleware for request logging

13. [ ] **Configure error tracking** (Optional but recommended):
    - Sign up for Sentry (https://sentry.io)
    - Install SDK: `npm install @sentry/nextjs`
    - Add DSN to environment variables

14. [ ] **Set up monitoring**:
    - Enable Cloud Run metrics in GCP Console
    - Set up alerts for error rates > 5%
    - Set up alerts for response time > 2s

### Phase 6: Final Verification

15. [ ] **Smoke test production**:
    - [ ] Sign in works (credentials persist after refresh)
    - [ ] Job listings load
    - [ ] Job application submission works
    - [ ] Resume upload/download works
    - [ ] Dashboard loads with correct data

16. [ ] **Performance test**:
    - Use Lighthouse (target score > 90)
    - Check Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

17. [ ] **Security test**:
    - [ ] JWT token not visible in localStorage (DevTools → Application → Local Storage)
    - [ ] HTTPS enforced (no HTTP access)
    - [ ] Security headers present (https://securityheaders.com)
    - [ ] CORS only allows backend domain

---

## Monitoring & Maintenance

### Cloud Run Metrics

Monitor in GCP Console → Cloud Run → Service → Metrics:

- Request count
- Request latency (p50, p95, p99)
- Error rate
- Container CPU/memory usage
- Instance count (cold starts)

### Log Queries

```bash
# View all logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# View errors only
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit 20

# View specific request
gcloud logging read "resource.type=cloud_run_revision AND jsonPayload.requestId=SOME_ID"
```

### Rollback Procedure

```bash
# List revisions
gcloud run revisions list --service=subtribe-frontend-production --region=asia-south1

# Rollback to previous revision
gcloud run services update-traffic subtribe-frontend-production \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-south1
```

### Cost Optimization

- Cloud Run free tier: 2M requests/month, 360K GB-seconds compute time
- After free tier: ~$0.00002 per request
- Estimated monthly cost (10K requests/day): $2-5/month
- Set budget alerts in GCP Console

---

## Comprehensive Testing Checklist

### How to Use This Checklist

**Full Test** (30-60 minutes): Run all tests before production deployment

**Smart Test** (5-15 minutes): Only test areas affected by your changes

- Example: If you only updated CSS styling → Test UI/visual items only
- Example: If you changed auth logic → Test authentication flow + session items

### Category 1: Authentication & Sessions (Critical)

- [ ] **Login Flow**
  - [ ] Enter valid credentials → Redirects to dashboard
  - [ ] Enter invalid credentials → Shows error message
  - [ ] DevTools → Application → Cookies shows `access_token` with HttpOnly flag
  - [ ] DevTools → Application → Local Storage does NOT show any token

- [ ] **Multi-Domain Session** (Single Sign-On)
  - [ ] Login on `thesubtribe.com/sign-in`
  - [ ] Navigate to `dashboard.thesubtribe.com`
  - [ ] Verify you're still logged in (no redirect to login)

- [ ] **Logout Flow**
  - [ ] Click logout button
  - [ ] Cookie `access_token` disappears from DevTools
  - [ ] Trying to access `/dashboard` redirects to `/sign-in`

- [ ] **Session Persistence**
  - [ ] Login → Close browser → Reopen browser
  - [ ] Visit dashboard → Should still be logged in (30-day session)

### Category 2: Core Functionality (Critical)

- [ ] **Job Creation**
  - [ ] Dashboard → Create New Job
  - [ ] Fill all required fields → Submit
  - [ ] Job appears in job list with correct status (draft/published)

- [ ] **Job Application Submission**
  - [ ] Visit public job page `/apply/[slug]`
  - [ ] Fill application form + upload resume (PDF)
  - [ ] Submit → Success message appears
  - [ ] Application appears in dashboard with status "Applied"

- [ ] **Resume Handling**
  - [ ] Dashboard → Applications → View application
  - [ ] Click "View Resume" → Opens in new tab
  - [ ] Verify signed URL (check URL has token, expires in 1 hour)
  - [ ] Download resume → File downloads successfully

- [ ] **Dashboard Data**
  - [ ] Dashboard loads without errors
  - [ ] Stats display correctly (job count, application count)
  - [ ] Can navigate between jobs, applications, settings

### Category 3: SEO & Indexing (Production Only)

- [ ] **Robots.txt**
  - [ ] Visit `https://thesubtribe.com/robots.txt`
  - [ ] Verify blocks `/dashboard`, `/jobs`, `/applications`
  - [ ] Verify allows `/apply`

- [ ] **Sitemap.xml**
  - [ ] Visit `https://thesubtribe.com/sitemap.xml`
  - [ ] Verify contains homepage + job URLs
  - [ ] Job URLs format: `https://thesubtribe.com/apply/[slug]`

- [ ] **Dashboard Noindex**
  - [ ] Visit any dashboard page (e.g., `/dashboard`)
  - [ ] Right-click → View Page Source
  - [ ] Search for `<meta name="robots" content="noindex"`
  - [ ] Verify meta tag exists

- [ ] **Job Page SEO**
  - [ ] Visit public job page `/apply/[slug]`
  - [ ] View Page Source
  - [ ] Verify `<title>` format: "Job Title | Company Name | Powered by Subtribe"
  - [ ] Verify `<meta name="description">` exists
  - [ ] Verify `<meta name="keywords">` exists
  - [ ] Verify JSON-LD structured data exists (`<script type="application/ld+json">`)

### Category 4: Domain & Routing (Production Only)

- [ ] **Primary Domain**
  - [ ] `https://thesubtribe.com` loads homepage
  - [ ] `https://thesubtribe.com/sign-in` loads login page
  - [ ] `https://thesubtribe.com/apply/[slug]` loads job application

- [ ] **Dashboard Subdomain**
  - [ ] `https://dashboard.thesubtribe.com` redirects to login if not authenticated
  - [ ] After login, `https://dashboard.thesubtribe.com` shows dashboard

- [ ] **WWW Subdomain** (if configured)
  - [ ] `https://www.thesubtribe.com` redirects to `https://thesubtribe.com`

### Category 5: Security Headers (Production Only)

- [ ] **Cookie Security**
  - [ ] DevTools → Application → Cookies → `access_token`
  - [ ] Verify flags: `HttpOnly`, `Secure`, `SameSite=Lax`
  - [ ] Verify `Domain=.thesubtribe.com` (allows both domains)

- [ ] **Security Headers** (use https://securityheaders.com)
  - [ ] Visit: `https://securityheaders.com/?q=https://thesubtribe.com`
  - [ ] Check for: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options
  - [ ] Target grade: B+ or higher

### Category 6: Performance & Reliability

- [ ] **Page Load Speed**
  - [ ] Homepage loads in < 3 seconds
  - [ ] Dashboard loads in < 3 seconds
  - [ ] Job application page loads in < 3 seconds

- [ ] **Error Handling**
  - [ ] Try accessing non-existent job `/apply/fake-job-slug`
  - [ ] Should show 404 page or "Job not found" message
  - [ ] Try submitting application form with missing fields
  - [ ] Should show validation errors

### Category 7: CI/CD & Deployment

- [ ] **GitHub Actions**
  - [ ] Commit with `push-` prefix → Check GitHub Actions runs
  - [ ] Verify deployment to dev succeeds
  - [ ] Verify smoke test passes

- [ ] **Cloud Run Deployment**
  - [ ] Check Cloud Run console for new revision
  - [ ] Verify service is receiving traffic
  - [ ] Check logs for errors (Cloud Logging)

### Quick Testing Matrix (What to Test Based on Changes)

| Change Type                | Test Categories                 | Est. Time |
| -------------------------- | ------------------------------- | --------- |
| **CSS/Styling only**       | UI visual checks                | 5 min     |
| **Auth changes**           | Category 1 (Auth & Sessions)    | 10 min    |
| **Job/Application logic**  | Category 2 (Core Functionality) | 15 min    |
| **SEO updates**            | Category 3 (SEO & Indexing)     | 10 min    |
| **Domain/routing**         | Category 4 (Domain & Routing)   | 5 min     |
| **Security changes**       | Category 5 (Security Headers)   | 10 min    |
| **Full production deploy** | All categories                  | 30-60 min |

---

## Backend Production Checklist

**Purpose**: Ensure backend is production-ready before frontend deployment.

**Owner**: Backend team

### Phase 1: Production Service Setup

- [ ] **Create Production Cloud Run Service**

  ```bash
  # Deploy to production service (not dev)
  gcloud run deploy subtribe-ats-api-prod \
    --image EXISTING_IMAGE \
    --region asia-south1 \
    --project YOUR_PROJECT_ID \
    --allow-unauthenticated \
    --set-env-vars="ENVIRONMENT=production,DATABASE_URL=PROD_DB_URL,..."
  ```

- [ ] **Configure Production Domain**

  ```bash
  gcloud run domain-mappings create \
    --service subtribe-ats-api-prod \
    --domain api.thesubtribe.com \
    --region asia-south1 \
    --project YOUR_PROJECT_ID
  ```

  - [ ] Follow DNS verification steps from GCP
  - [ ] Update DNS in Cloudflare (A record or CNAME)
  - [ ] Wait for SSL certificate provisioning (5-15 minutes)

### Phase 2: Database Setup

- [ ] **Production Database**
  - [ ] Create production database (if not exists)
  - [ ] Run schema migrations
  - [ ] Verify schema matches development
  - [ ] Test database connection from Cloud Run service

- [ ] **Database Credentials**
  - [ ] Store production `DATABASE_URL` as secret in GitHub
  - [ ] Verify service account has database access

### Phase 3: Authentication Changes (CRITICAL)

- [ ] **Migrate to HTTP-only Cookies** (see BACKEND-DEPLOYMENT.md)
  - [ ] Update `/auth/login` endpoint
  - [ ] Update `/auth/register` endpoint
  - [ ] Update authentication middleware
  - [ ] Create `/auth/logout` endpoint

- [ ] **Cookie Configuration**
  - [ ] Production: `domain=.thesubtribe.com`, `secure=True`, `httponly=True`
  - [ ] Development: `domain=None`, `secure=False`, `httponly=True`
  - [ ] Session duration: 30 days (`max_age=2592000`)

### Phase 4: CORS Configuration

- [ ] **Update CORS Allowed Origins**
  ```python
  # Add to backend CORS config
  origins = [
    'http://localhost:3000',                      # Local dev
    'https://FRONTEND-DEV-URL.run.app',          # Dev Cloud Run
    'https://thesubtribe.com',                    # Prod
    'https://dashboard.thesubtribe.com',         # Prod subdomain
  ]
  supports_credentials=True
  ```

### Phase 5: Rate Limiting (Optional but Recommended)

- [ ] **Add In-Memory Rate Limiting**
  - [ ] Login: 10 attempts per email per 15 minutes
  - [ ] Register: 10 attempts per email per hour
  - [ ] Application submit: 10 per IP per hour

### Phase 6: Sitemap Support (TODO - Circle Back)

- [ ] **Create `/public/jobs` Endpoint**
  - [ ] Returns all published jobs
  - [ ] Fields: `slug`, `created_at`, `updated_at`, `status`
  - [ ] Paginated (limit=1000)
  - [ ] No authentication required

### Phase 7: Testing

- [ ] **Smoke Test Production API**

  ```bash
  curl https://api.thesubtribe.com/health
  # Should return 200 OK
  ```

- [ ] **Test Authentication**

  ```bash
  # Login
  curl -X POST https://api.thesubtribe.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}' \
    -c cookies.txt

  # Verify cookie was set
  cat cookies.txt | grep access_token

  # Test authenticated endpoint
  curl https://api.thesubtribe.com/jobs \
    -b cookies.txt
  ```

- [ ] **Test CORS**
  ```bash
  curl -X OPTIONS https://api.thesubtribe.com/jobs \
    -H "Origin: https://thesubtribe.com" \
    -H "Access-Control-Request-Method: GET" \
    -v
  # Should return Access-Control-Allow-Origin: https://thesubtribe.com
  ```

### Phase 8: CI/CD Update

- [ ] **Update GitHub Actions Workflow**
  - [ ] Add production deployment job (manual trigger or main branch)
  - [ ] Deploy to `subtribe-ats-api-prod` service
  - [ ] Set production environment variables

### Phase 9: Monitoring

- [ ] **Enable Cloud Logging**
  - [ ] Verify logs appear in Cloud Console
  - [ ] Test log search by request ID

- [ ] **Set Up Alerts** (Optional)
  - [ ] Error rate > 5%
  - [ ] Response time > 2 seconds

### Timeline

- **Phases 1-3**: 2-4 hours (critical path)
- **Phases 4-5**: 1 hour (configuration)
- **Phases 6**: Later (not blocking)
- **Phases 7-9**: 1 hour (testing & monitoring)

**Total**: 4-6 hours for backend production readiness

---

## Quick Reference

### Local Development

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run lint                   # Lint code
npm run typecheck              # Type check
npm run build                  # Production build
```

### Docker Commands

```bash
docker build -t subtribe-frontend .
docker run -p 3000:8080 -e NEXT_PUBLIC_API_URL=URL subtribe-frontend
docker logs CONTAINER_ID
```

### Deployment Commands

```bash
# Manual deployment (if not using GitHub Actions)
gcloud run deploy subtribe-frontend-production \
  --image IMAGE_URL \
  --region asia-south1 \
  --allow-unauthenticated

# View service details
gcloud run services describe subtribe-frontend-production --region asia-south1

# Stream logs
gcloud run services logs tail subtribe-frontend-production --region asia-south1
```

---

**Last Updated**: 2025-11-02
**Status**: Ready for production deployment pending security fixes
**Estimated Setup Time**: 4-6 hours
