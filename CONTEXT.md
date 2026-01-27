# Subtribe - Project Context

## What We Built

A modern Applicant Tracking System (ATS) for hiring teams with AI-powered candidate evaluation.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: CVA (Class Variance Authority)
- **Forms**: React Hook Form + Zod
- **API**: RESTful backend (see API docs below)

## Core Features

1. **Job Management**: Create, edit, publish, and close job postings
2. **Application Pipeline**: Track candidates through stages (Applied → Screening → Interview → Offer → Hired)
3. **AI Evaluation**: Automated candidate scoring with recruiter feedback loop
4. **Resume Handling**: View and download with signed URLs (1-hour expiry)
5. **Status History**: Complete audit trail of all status changes
6. **Smart Feedback**: Context-aware UX that requests feedback only for high-signal decisions

## Key API Endpoints

**Authentication**

- POST `/auth/register` - User registration
- POST `/auth/login` - Login (returns JWT)

**Jobs**

- GET `/jobs` - List jobs (with pagination)
- POST `/jobs` - Create job
- GET `/jobs/:id` - Get job details
- PATCH `/jobs/:id` - Update job
- GET `/jobs/:slug/public` - Public job page

**Applications**

- GET `/jobs/:id/applications` - List applications (paginated, filterable by status)
- GET `/applications/:id` - Application details
- PATCH `/applications/:id/status` - Update candidate status
- GET `/applications/:id/resume/view` - Get signed resume URL
- GET `/applications/:id/history` - Status change history

## Environment Setup

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_URL=https://api.thesubtribe.com
```

## Production Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` in deployment platform
- [ ] Enable HTTPS on frontend and backend
- [ ] Configure CORS to allow frontend domain
- [ ] Implement CSP headers
- [ ] Set up error monitoring (optional: Sentry)

## Smart Feedback System

**High-Signal Transitions** (request feedback):

- Any status → Rejected
- AI Score ≥ 70 → Rejected (AI disagrees)
- AI Score < 50 → Offer/Hired (recruiter sees potential)

**Low-Signal Transitions** (no friction):

- Standard flow (Applied → Screening → Interview → Offer → Hired)

**Implementation**: See `src/lib/status-update-config.ts`

## Project Structure

```
src/
├── app/                    # Next.js app routes
│   ├── (auth)/            # Sign in/up pages
│   ├── (dashboard)/       # Protected routes
│   └── apply/[jobId]/     # Public job application
├── components/
│   ├── ui/                # Base components (Button, Input, etc)
│   └── shared/            # Feature components (CandidateCard, etc)
├── lib/                   # Utilities and API client
└── types/                 # TypeScript definitions
```

## SEO Implementation

**Title Format**: `Job Title | Client Company | Powered by Subtribe`

- Client branding comes first
- "Powered by Subtribe" builds brand awareness

**Auto-extracted Keywords From:**

- Job title, location, skills, position type, experience level, department, company name
- Example: "senior, react, developer, remote, san francisco, typescript, acme corp"

**Location-Based SEO:**

- Remote: "Remote [Job Title] position in [Country]"
- Onsite/Hybrid: "[Type] [Job Title] position in [City, State, Country]"

**JSON-LD Structured Data**: Automatically included for Google Jobs integration

**SEO Functions** (`src/lib/seo.ts`):

- `generateJobTitle()` - Client-branded titles
- `extractJobKeywords()` - Auto keyword extraction
- `generateLocationDescription()` - Location optimization
- `generateJobSchema()` - JSON-LD for Google Jobs

**Test SEO**: https://search.google.com/test/rich-results

---

## Accessibility Features

- **ARIA Attributes**: Screen reader support on all form fields
- **Keyboard Navigation**: Skip-to-content link, full Tab navigation
- **WCAG Compliant**: Form labels, error announcements, focus management
- **CVA Patterns**: Clean component styling with Class Variance Authority

---

## Build & Deploy

```bash
npm run build              # Production build
npm run start              # Start production server
npm run dev                # Development server
npm run typecheck          # Type checking
```

**Build Status**: ✅ Zero errors, zero warnings
**Production Ready**: ✅ Yes
