# Subtribe Dashboard

Admin/Client interface for managing jobs and applications in the Subtribe.

**Domain:** dashboard.thesubtribe.com

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with app port
# NEXT_PUBLIC_APP_URL=http://localhost:3001

# Start dev server (runs on port 3000)
pnpm dev
```

Visit: http://localhost:3000

---

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Sign in/up pages
│   │   └── (dashboard)/      # Protected admin routes
│   ├── components/
│   │   ├── ui/               # Base UI components
│   │   └── shared/           # Dashboard-specific components
│   ├── lib/                  # Utilities, API client, validations
│   └── types/                # TypeScript definitions
├── .github/workflows/        # CI/CD pipelines
├── public/
└── README.md
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS v4 + CVA
- **Forms:** React Hook Form + Zod
- **UI Components:** Radix UI + Heroicons
- **Deployment:** Docker + Google Cloud Run

---

## ✨ Features

### Job Management

- Create, edit, publish, and close job postings
- Rich job details with requirements, skills, salary
- Multiple position types and locations
- Custom screening questions builder

### Application Pipeline

- 6-stage pipeline: Applied → Screening → Interview → Offer → Hired/Rejected
- Drag-and-drop candidate cards
- Status history tracking with audit trail
- Smart feedback system

### AI-Powered Features

- Automated candidate scoring (0-100)
- AI evaluation summaries
- Smart feedback requests for high-signal decisions

### Analytics & Stats

- Real-time dashboard metrics
- Conversion rates and time-to-hire
- Job-specific statistics and funnel analysis
- Activity monitoring

### Resume Management

- Secure file uploads (PDF only, 5MB limit)
- Signed URL generation (1-hour expiry)
- PDF embedding in browser

---

## 📝 Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code with ESLint
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Format code with Prettier
pnpm typecheck    # Type check with TypeScript
```

---

## ⚙️ Environment Variables

See **[ENV_SETUP.md](./ENV_SETUP.md)** for detailed configuration.

### Required Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://subtribe-ats-api-dev-189393113297.asia-south1.run.app

# App URL (for job links)
NEXT_PUBLIC_APP_URL=http://localhost:3001  # Local
# NEXT_PUBLIC_APP_URL=https://app.thesubtribe.com  # Production
```

**Important:** `NEXT_PUBLIC_APP_URL` must point to where the **app** (candidate-facing) application is running. This ensures job links (Copy Link, Preview) point to the correct domain.

---

## 🚢 Deployment

### Development (Auto-deploy)

Commits starting with `push-` automatically deploy to development:

```bash
git add .
git commit -m "push-fix: update job form validation"
git push origin develop
```

- **Trigger:** All commits starting with `push-`
- **Branch:** Any branch (typically `develop`)
- **Target:** Cloud Run service `subtribe-dashboard-dev`
- **URL:** Your development URL

### Production (Manual)

Requires manual trigger with confirmation:

1. Go to **Actions** tab in GitHub
2. Select "Deploy to Production (Manual)"
3. Click "Run workflow"
4. Type `deploy-to-production` to confirm
5. Click "Run workflow"

- **Trigger:** Manual only (workflow_dispatch)
- **Branch:** Typically `main`
- **Target:** Cloud Run service `subtribe-dashboard-prod`
- **Versioning:** Semantic versioning with GitHub releases

### Required GitHub Secrets/Variables

**Secrets:**

- `GCP_SA_KEY` - Google Cloud Service Account JSON key

**Variables:**

- `GCP_PROJECT_ID` - Your GCP project ID
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - App frontend URL (for job links)
- `NEXT_PUBLIC_BASE_URL` - Dashboard base URL

---

## 🔑 Test Credentials

```
Email: akash@thesubtribe.com
Password: Test@1234
Company Code: DJIS938DJA9
```

---

## 📚 Documentation

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variable setup guide
- **[CONTEXT.md](./CONTEXT.md)** - Project details and architecture
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide

---

## 🏗️ Development Workflow

### 1. Local Setup

```bash
# Clone the repository
git clone <dashboard-repo-url>
cd dashboard

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start dev server
pnpm dev
```

### 2. Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Lint and format
pnpm lint
pnpm format

# Type check
pnpm typecheck

# Commit changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 3. Deploying to Development

```bash
# Method 1: Push with "push-" prefix (auto-deploys)
git commit -m "push-test: test new feature in dev"
git push origin develop

# Method 2: Regular commit (runs CI only, no deploy)
git commit -m "feat: add new feature"
git push origin develop
```

### 4. Deploying to Production

1. Merge your feature branch to `main`
2. Go to GitHub Actions
3. Manually trigger "Deploy to Production"
4. Type confirmation and deploy

---

## 🧪 Testing Before Deployment

```bash
# Build locally to catch issues
pnpm build

# If build succeeds, you're good to deploy!
```

---

## 🐛 Troubleshooting

### Job links not working

- Check `NEXT_PUBLIC_APP_URL` in `.env.local`
- Restart dev server after changing env vars

### Build fails

- Run `pnpm typecheck` to find type errors
- Run `pnpm lint` to find linting issues

### Deployment fails

- Check GitHub Actions logs
- Verify all secrets/variables are set
- Ensure Docker build succeeds locally

---

## 📊 Status

✅ Separated Architecture | ✅ Independent Deployment | ✅ Zero Build Errors

---

## 🔗 Related Repositories

- **App (Candidate Interface):** `subtribe-app` repository
- **Backend API:** Subtribe API

---

## 📞 Support

For issues or questions, please create an issue in the repository.
