# Subtribe Dashboard

The recruiter side of Subtribe, a multi-tenant applicant tracking system with AI candidate evaluation. Teams create jobs, calibrate what a good hire looks like, and review every applicant ranked and explained.

Part of the Subtribe platform: [backend](https://github.com/akashvekariya/subtribe-backend-v2), [candidate app](https://github.com/akashvekariya/subtribe-app-v2), [AI engine](https://github.com/akashvekariya/subtribe-ai-v2).

## Features

- **Job setup and calibration**: write a job, answer a short calibration flow, and the platform builds the scoring framework from it.
- **Candidate evaluation**: each applicant gets a tier, a score per dimension, matched skills, red flags and suggested interview questions, with the resume side by side.
- **Pipeline view**: server-side filtering, sorting and pagination across applications, status changes with history.
- **Bulk resume upload** with live batch progress.
- **Team and company**: onboarding, invites, roles, settings.
- **Auth**: sign up, email verification, invite claim, password reset.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, React Hook Form with Zod, Zustand, Recharts. Docker, deployed on Cloud Run through GitHub Actions.

## Run locally

```bash
pnpm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at the backend
pnpm dev
```

Open `http://localhost:3000`.

## Layout

```
src/
  app/(auth)/        sign-in, sign-up, invites, password reset
  app/(dashboard)/   jobs, applications, team, settings, onboarding
  components/        evaluation, calibration, jobs, shared UI
  lib/               API client, hooks, helpers
```
