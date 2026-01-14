# Evaluation V3 Migration Guide

This document provides a comprehensive guide for migrating the evaluation-v3 candidate evaluation UI from the POC repository to the dashboard.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Pre-Migration Checklist](#pre-migration-checklist)
4. [Step 1: Install Dependencies](#step-1-install-dependencies)
5. [Step 2: Copy Component Files](#step-2-copy-component-files)
6. [Step 3: Import CSS Styles](#step-3-import-css-styles)
7. [Step 4: Create Page/Route](#step-4-create-pageroute)
8. [Step 5: Connect to API](#step-5-connect-to-api)
9. [File Reference](#file-reference)
10. [Component API Reference](#component-api-reference)
11. [Data Type Mapping](#data-type-mapping)
12. [Known Differences](#known-differences)
13. [Testing Checklist](#testing-checklist)

---

## Overview

### What We Are Migrating

The evaluation-v3 component system is a two-panel layout for AI-powered candidate assessment:

- **Left Panel**: Filterable, sortable candidate list with pagination
- **Right Panel**: Detailed AI evaluation and resume view with tabbed navigation

### Current Dashboard State

| Aspect           | Current Dashboard              | New evaluation-v3                         |
| ---------------- | ------------------------------ | ----------------------------------------- |
| List Component   | `CandidateCard.tsx`            | `CandidateList.tsx` (with embedded cards) |
| Detail View      | `ApplicationDetailsDrawer.tsx` | Multiple accordion components             |
| State Management | React hooks only               | Zustand store with LRU cache              |
| Score Display    | Simple number (0-10)           | Animated ring chart with categories       |
| Styling          | Tailwind + inline              | CSS file + Tailwind                       |

### Migration Strategy

Full replacement. The new evaluation-v3 UI will completely replace the current ApplicationDetailsDrawer and CandidateCard components. All POC code will be used as-is without modifications.

**Important Principles:**

1. **Mock Data Only** - Do NOT connect to APIs. Use the mock data from POC as-is. API integration will happen later after backend responses are finalized.

2. **POC is Source of Truth** - If a feature exists in the current dashboard but NOT in the POC, remove it. The POC was designed to strip away unnecessary features.

3. **No Bulk Operations** - Multi-select, bulk status changes, and similar features are not included. Skip them.

4. **No Communications Tab** - The email/communication features are removed in the new design.

**Features NOT included in new UI:**

- Communications tab (emails)
- Multi-select mode
- Bulk status changes
- Bulk email sending

---

## Architecture Comparison

### Current Dashboard Flow

```
/jobs/[jobId]/page.tsx (1455 lines)
  |
  +-- Applications Tab
      +-- CandidateCard list (inline)
      +-- ApplicationDetailsDrawer (side panel)
          +-- Analysis Tab (SkillsAnalysis)
          +-- Overview Tab
          +-- Communications Tab
```

### New evaluation-v3 Flow

```
evaluation-v3/ (self-contained folder)
  |
  +-- ComponentsDebugPage.tsx (orchestrator - reference implementation)
  |
  +-- Left Panel: CandidateList.tsx
  |   +-- Filter by Tier
  |   +-- Filter by Status
  |   +-- Sort options
  |   +-- CandidateCard (embedded)
  |   +-- Pagination
  |
  +-- Right Panel: Evaluation Content
      +-- EvaluationTabs.tsx (AI Evaluation | Resume)
      |
      +-- AI Evaluation Tab
      |   +-- ScoreSummaryPanel.tsx
      |   +-- InsightsCard.tsx
      |   +-- SkillsGrid.tsx
      |   +-- ConstraintAccordion.tsx
      |   +-- InterviewQuestionsAccordion.tsx
      |   +-- RedFlagsAccordion.tsx
      |
      +-- Resume Tab
          +-- ResumeView.tsx
```

---

## Pre-Migration Checklist

Before starting migration, verify:

- [ ] Dashboard project builds successfully (`pnpm build`)
- [ ] You have access to POC folder at `/Volumes/Work/Subtribe/junk/pocs/frontend/src/components/evaluation-v3/`
- [ ] Node.js and pnpm are installed
- [ ] Git is clean (no uncommitted changes)

---

## Step 1: Install Dependencies

### Required New Dependencies

The POC uses Zustand for state management which is not present in the dashboard. Run:

```bash
cd /Volumes/Work/Subtribe/subtribe-frontend/dashboard
pnpm add zustand@^5.0.10
```

### Optional Dependencies (if animations break)

If any animation-related issues occur, you may need:

```bash
pnpm add framer-motion@^12.26.1
```

### Verify Installation

After installation, your `package.json` should include:

```json
{
  "dependencies": {
    "zustand": "^5.0.10"
  }
}
```

---

## Step 2: Copy Component Files

### Target Directory

Create a new self-contained folder in the dashboard:

```bash
mkdir -p /Volumes/Work/Subtribe/subtribe-frontend/dashboard/src/components/evaluation-v3
```

### Files to Copy

Copy ALL files from the POC evaluation-v3 folder. Here is the complete file list:

#### Root Component Files (14 files)

| Source File                       | Description                      |
| --------------------------------- | -------------------------------- |
| `ComponentsDebugPage.tsx`         | Main orchestrator with mock data |
| `CandidateList.tsx`               | Left panel candidate list        |
| `EvaluationTabs.tsx`              | Tab navigation component         |
| `ScoreSummaryPanel.tsx`           | Score overview with ring chart   |
| `ScoreRing.tsx`                   | Animated donut chart             |
| `InsightsCard.tsx`                | Strengths and concerns display   |
| `SkillsGrid.tsx`                  | Skill assessment grid            |
| `ConstraintAccordion.tsx`         | Pass/Review/Fail constraints     |
| `InterviewQuestionsAccordion.tsx` | Interview question suggestions   |
| `RedFlagsAccordion.tsx`           | Risk assessment flags            |
| `ResumeView.tsx`                  | Formatted resume display         |
| `StatusPill.tsx`                  | Status indicator pills           |
| `Skeleton.tsx`                    | Loading state components         |
| `index.ts`                        | Central exports                  |

#### Supporting Files (4 files)

| Source File  | Description         |
| ------------ | ------------------- |
| `icons.tsx`  | SVG icon components |
| `colors.ts`  | Color definitions   |
| `utils.ts`   | Utility functions   |
| `styles.css` | Component styles    |

#### Types Folder (1 file)

| Source File      | Description           |
| ---------------- | --------------------- |
| `types/index.ts` | TypeScript interfaces |

#### Config Folder (2 files)

| Source File          | Description            |
| -------------------- | ---------------------- |
| `config/index.ts`    | Config exports         |
| `config/variants.ts` | Styling configurations |

#### Shared Folder (4 files)

| Source File                      | Description              |
| -------------------------------- | ------------------------ |
| `shared/index.ts`                | Shared component exports |
| `shared/AnimatedPill.tsx`        | Animated pill component  |
| `shared/PersonalInfoDisplay.tsx` | Contact info display     |
| `shared/SectionHeader.tsx`       | Section header component |

#### Store Folder (3 files)

| Source File          | Description              |
| -------------------- | ------------------------ |
| `store/index.ts`     | Store exports            |
| `store/types.ts`     | Store type definitions   |
| `store/lru-cache.ts` | LRU cache implementation |

### Copy Command

Run this command to copy all files:

```bash
# Source
SRC="/Volumes/Work/Subtribe/junk/pocs/frontend/src/components/evaluation-v3"

# Destination
DEST="/Volumes/Work/Subtribe/subtribe-frontend/dashboard/src/components/evaluation-v3"

# Copy entire folder
cp -R "$SRC"/* "$DEST"/
```

### Verify Copy

After copying, the folder structure should be:

```
src/components/evaluation-v3/
+-- index.ts
+-- ComponentsDebugPage.tsx
+-- CandidateList.tsx
+-- EvaluationTabs.tsx
+-- ScoreSummaryPanel.tsx
+-- ScoreRing.tsx
+-- InsightsCard.tsx
+-- SkillsGrid.tsx
+-- ConstraintAccordion.tsx
+-- InterviewQuestionsAccordion.tsx
+-- RedFlagsAccordion.tsx
+-- ResumeView.tsx
+-- StatusPill.tsx
+-- Skeleton.tsx
+-- icons.tsx
+-- colors.ts
+-- utils.ts
+-- styles.css
+-- README.md
+-- types/
|   +-- index.ts
+-- config/
|   +-- index.ts
|   +-- variants.ts
+-- shared/
|   +-- index.ts
|   +-- AnimatedPill.tsx
|   +-- PersonalInfoDisplay.tsx
|   +-- SectionHeader.tsx
+-- store/
    +-- index.ts
    +-- types.ts
    +-- lru-cache.ts
```

---

## Step 3: Import CSS Styles

### Option A: Import in Layout (Recommended)

Add the CSS import to your root layout or the specific page that uses evaluation-v3:

```tsx
// In src/app/layout.tsx or specific page
import "@/components/evaluation-v3/styles.css";
```

### Option B: Import in Component

If you prefer scoped imports, add at the top of ComponentsDebugPage.tsx:

```tsx
import "./styles.css";
```

### CSS Variables

The `styles.css` file uses CSS custom properties. Ensure these are defined (they should already be in the copied styles.css):

```css
:root {
  --eval-transition-fast: 150ms;
  --eval-transition-normal: 200ms;
  --eval-transition-slow: 300ms;
}
```

---

## Step 4: Create Page/Route

### For Testing (Debug Page)

Create a test page to verify the migration works:

```tsx
// src/app/(dashboard)/evaluation-debug/page.tsx
import ComponentsDebugPage from "@/components/evaluation-v3/ComponentsDebugPage";

export default function EvaluationDebugPage() {
  return <ComponentsDebugPage />;
}
```

Access at: `http://localhost:3000/evaluation-debug`

### For Production Integration

When ready to integrate with the actual jobs page, you will need to:

1. Import the components in `/jobs/[jobId]/page.tsx`
2. Replace the Applications tab content
3. Connect to real API data (see Step 5)

Example integration pattern:

```tsx
// In jobs/[jobId]/page.tsx - Applications tab section

import {
  CandidateList,
  ScoreSummaryPanel,
  InsightsCard,
  SkillsGrid,
  ConstraintAccordion,
  InterviewQuestionsAccordion,
  RedFlagsAccordion,
  ResumeView,
  EvaluationTabs,
  useEvaluationTabs,
} from "@/components/evaluation-v3";
import "@/components/evaluation-v3/styles.css";

// Inside your component:
const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
  null
);
const { activeTab, setActiveTab } = useEvaluationTabs("ai");

// Render the two-panel layout similar to ComponentsDebugPage.tsx
```

---

## Step 5: Connect to API (FUTURE - DO NOT IMPLEMENT NOW)

**IMPORTANT: Skip this step during initial migration. Use mock data only.**

This section is for future reference when API integration is needed. The current implementation uses mock data from the POC; API connection will happen after backend responses are finalized.

### Current API Endpoints (Dashboard)

From `src/lib/api-client.ts`:

```typescript
// Get candidates for a job
api.applications.getJobApplications(jobId, {
  status?: string,
  search?: string,
  sort_by?: string,
  sort_dir?: string,
  page?: number,
  limit?: number
})

// Get single application details
api.applications.getApplicationById(applicationId)

// Get application status history
api.applications.getApplicationHistory(applicationId)
```

### Data Transformation Required

The POC expects specific data shapes. You will need to create transformer functions:

#### CandidateList Data

```typescript
// POC expects:
interface CandidateListItem {
  id: string;
  name: string;
  email: string;
  score: number;
  maxScore: number;
  tier: Tier;
  appliedAt?: string;
  status: ApplicationStatus;
}

// Dashboard returns:
interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ai_score?: number; // 0-100
  status: ApplicationStatus;
  applied_at: string;
}

// Transformer example:
function transformToCandidateListItem(app: Application): CandidateListItem {
  return {
    id: app.id,
    name: `${app.first_name} ${app.last_name}`,
    email: app.email,
    score: app.ai_score || 0,
    maxScore: 100,
    tier: scoreTier(app.ai_score || 0), // You need to implement this
    appliedAt: app.applied_at,
    status: app.status,
  };
}

function scoreTier(score: number): Tier {
  if (score >= 85) return "excellent_match";
  if (score >= 70) return "good_match";
  if (score >= 50) return "average_match";
  return "poor_match";
}
```

#### Evaluation Data

The POC expects detailed evaluation data:

```typescript
interface EvaluationData {
  personalInfo: PersonalInfo;
  categories: CategoryScore[];
  totalScore: number;
  maxTotalScore: number;
  tier: Tier;
  stats: QuickStats;
  strengths: string[];
  concerns: string[];
  skills: SkillMatch[];
  missingSkills: MissingSkill[];
  constraints: Constraint[];
  interviewQuestions: InterviewQuestion[];
  redFlags: RedFlag[];
  resume: ResumeData;
}
```

This evaluation data likely needs a new API endpoint or expansion of the existing `ai_evaluation` field.

### API Integration Points

Mark these as TODO in your code:

```typescript
// TODO: Replace mock data with API call
// File: ComponentsDebugPage.tsx, line ~50

// Current mock:
const mockCandidate = MOCK_CANDIDATES[currentCandidateId];

// Replace with:
const { data: candidate, isLoading } = useQuery({
  queryKey: ["candidate", currentCandidateId],
  queryFn: () => api.applications.getApplicationById(currentCandidateId),
  enabled: !!currentCandidateId,
});
```

---

## File Reference

### Complete File List with Line Counts

| File                              | Lines | Purpose           |
| --------------------------------- | ----- | ----------------- |
| `ComponentsDebugPage.tsx`         | ~400  | Main orchestrator |
| `CandidateList.tsx`               | ~450  | Left panel list   |
| `EvaluationTabs.tsx`              | ~50   | Tab navigation    |
| `ScoreSummaryPanel.tsx`           | ~150  | Score display     |
| `ScoreRing.tsx`                   | ~300  | Animated ring     |
| `InsightsCard.tsx`                | ~100  | Key insights      |
| `SkillsGrid.tsx`                  | ~250  | Skills assessment |
| `ConstraintAccordion.tsx`         | ~150  | Constraints       |
| `InterviewQuestionsAccordion.tsx` | ~120  | Questions         |
| `RedFlagsAccordion.tsx`           | ~150  | Red flags         |
| `ResumeView.tsx`                  | ~350  | Resume display    |
| `StatusPill.tsx`                  | ~80   | Status indicators |
| `Skeleton.tsx`                    | ~200  | Loading states    |
| `icons.tsx`                       | ~500  | SVG icons         |
| `colors.ts`                       | ~50   | Color system      |
| `utils.ts`                        | ~50   | Utilities         |
| `styles.css`                      | ~800  | CSS styles        |
| `types/index.ts`                  | ~150  | Type definitions  |
| `config/variants.ts`              | ~200  | Config objects    |
| `config/index.ts`                 | ~10   | Re-exports        |
| `shared/AnimatedPill.tsx`         | ~50   | Animated pill     |
| `shared/PersonalInfoDisplay.tsx`  | ~100  | Contact display   |
| `shared/SectionHeader.tsx`        | ~30   | Section header    |
| `store/index.ts`                  | ~20   | Store exports     |
| `store/types.ts`                  | ~60   | Store types       |
| `store/lru-cache.ts`              | ~50   | LRU cache         |

---

## Component API Reference

### CandidateList

```typescript
interface CandidateListProps {
  candidates: CandidateListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEmailClick?: (candidate: CandidateListItem) => void;
  onPhoneClick?: (candidate: CandidateListItem) => void;
  onResumeClick?: (candidate: CandidateListItem) => void;
  onStatusChange?: (candidateId: string, status: ApplicationStatus) => void;
  isLoading?: boolean;
  title?: string;
  className?: string;
  pageSize?: number; // default 20
  showFilters?: boolean;
  showPagination?: boolean;
}
```

### ScoreSummaryPanel

```typescript
interface ScoreSummaryPanelProps {
  categories: CategoryScore[];
  totalScore: number;
  maxTotalScore: number;
  tier: Tier;
  stats: QuickStats;
  personalInfo: PersonalInfo;
  className?: string;
}
```

### InsightsCard

```typescript
interface InsightsCardProps {
  strengths: string[];
  concerns: string[];
  className?: string;
}
```

### SkillsGrid

```typescript
interface SkillsGridProps {
  skills: SkillMatch[];
  matchedCount: number;
  totalSkills: number;
  missingSkills?: MissingSkill[];
  title?: string;
  className?: string;
}
```

### ConstraintAccordion

```typescript
interface ConstraintAccordionProps {
  constraints: Constraint[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}
```

### InterviewQuestionsAccordion

```typescript
interface InterviewQuestionsAccordionProps {
  questions: InterviewQuestion[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}
```

### RedFlagsAccordion

```typescript
interface RedFlagsAccordionProps {
  flags: RedFlag[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}
```

### ResumeView

```typescript
interface ResumeViewProps {
  data: ResumeData;
  personalInfo?: PersonalInfo;
  className?: string;
}
```

### EvaluationTabs

```typescript
interface EvaluationTabsProps {
  activeTab: TabId; // 'ai' | 'resume'
  onTabChange: (tab: TabId) => void;
  className?: string;
}
```

---

## Data Type Mapping

### Dashboard to POC Type Mapping

| Dashboard Field          | POC Field                    | Notes              |
| ------------------------ | ---------------------------- | ------------------ |
| `first_name + last_name` | `name`                       | Concatenate        |
| `email`                  | `email`                      | Direct             |
| `phone`                  | `phone`                      | Direct             |
| `ai_score` (0-100)       | `score`                      | Same scale         |
| `status`                 | `status`                     | Same enum values   |
| `applied_at`             | `appliedAt`                  | Direct             |
| `linkedin_url`           | `personalInfo.linkedin_url`  | Nested             |
| `github_url`             | `personalInfo.github_url`    | Nested             |
| `portfolio_url`          | `personalInfo.portfolio_url` | Nested             |
| N/A                      | `tier`                       | Compute from score |
| N/A                      | `categories`                 | New API needed     |
| N/A                      | `constraints`                | New API needed     |
| N/A                      | `redFlags`                   | New API needed     |
| N/A                      | `skills`                     | New API needed     |

### New Data Required

The following data is NOT currently available in the dashboard API and will need new endpoints:

1. **Category Scores** - Breakdown of score by category (skills, experience, education)
2. **Constraints** - Pass/Review/Fail eligibility checks
3. **Red Flags** - Risk assessment with severity
4. **Interview Questions** - AI-generated questions based on gaps
5. **Skill Match Details** - Signal strength and sources for each skill
6. **Structured Resume** - Parsed resume with experience, education, projects

---

## Known Differences

### Framework Differences

| Aspect  | POC (Vite)          | Dashboard (Next.js)    |
| ------- | ------------------- | ---------------------- |
| Build   | Vite                | Next.js with Turbopack |
| Routing | None (SPA)          | App Router             |
| SSR     | No                  | Yes                    |
| CSS     | Import in component | Import in layout       |

### Potential Issues

1. **Server Components**: The POC components use `useState` and `useEffect`, so they must be client components. Ensure you add `'use client'` directive to pages that use them.

2. **CSS Loading**: In Next.js, CSS might need to be imported at the layout level to ensure it's loaded before components render.

3. **Hydration Mismatch**: If you see hydration errors, ensure the component only renders on the client or that server/client rendering is consistent.

### Required Page Directive

Any page using evaluation-v3 components must have:

```tsx
'use client';

import { ... } from '@/components/evaluation-v3';
```

---

## Testing Checklist

After migration, verify:

### Visual Testing

- [ ] CandidateList renders with sample data
- [ ] Filter dropdowns work (Tier, Status)
- [ ] Sort dropdown works
- [ ] Pagination works
- [ ] Clicking candidate selects it
- [ ] ScoreRing animates on load
- [ ] ScoreRing hover effects work
- [ ] All accordions expand/collapse
- [ ] Tabs switch between AI Evaluation and Resume
- [ ] Mobile responsive layout works

### Functional Testing

- [ ] Status change updates correctly
- [ ] Email/Phone/Resume action buttons trigger callbacks
- [ ] Loading skeletons display when isLoading=true
- [ ] Empty states display when no data

### Performance Testing

- [ ] LRU cache limits candidates in memory
- [ ] No memory leaks on repeated navigation
- [ ] Smooth animations (no jank)

---

## Appendix A: Mock Data Structure

Reference the mock data in `ComponentsDebugPage.tsx` for the expected data shapes. The mock includes:

- 3 sample candidates with full evaluation data
- All tier types represented
- Various status combinations
- Complete resume data

Use this mock data as a reference when building your API transformers.

---

## Appendix B: CSS Class Reference

All CSS classes are namespaced. Key prefixes:

| Prefix         | Component                 |
| -------------- | ------------------------- |
| `eval-`        | General evaluation layout |
| `candidate-`   | CandidateList components  |
| `score-panel-` | ScoreSummaryPanel         |
| `insights-`    | InsightsCard              |
| `resume-`      | ResumeView                |

---

## Appendix C: Zustand Store Usage

The store provides:

```typescript
import {
  useCandidateStore,
  useCurrentCandidate,
} from "@/components/evaluation-v3";

// Get current candidate data
const candidate = useCurrentCandidate();

// Access store actions
const { selectCandidate, fetchCandidate } = useCandidateStore();
```

Note: The store implementation in the POC uses a simple LRU cache demo. For production, you may want to integrate with your existing data fetching strategy.

---

## Summary

### Quick Start

1. Install: `pnpm add zustand@^5.0.10`
2. Copy: `cp -R [POC]/evaluation-v3/* [DASHBOARD]/src/components/evaluation-v3/`
3. Import CSS: Add `import '@/components/evaluation-v3/styles.css';` to layout
4. Test: Create debug page and verify components render
5. Integrate: Replace Applications tab with new components
6. Connect API: Transform existing API data to match POC types

### Files Modified in Dashboard

| File                                             | Change                                      |
| ------------------------------------------------ | ------------------------------------------- |
| `package.json`                                   | Add zustand dependency                      |
| `src/app/layout.tsx`                             | Import styles.css                           |
| `src/components/evaluation-v3/`                  | New folder (all POC files)                  |
| `eslint.config.mjs`                              | Disable display-name rule for evaluation-v3 |
| `src/components/evaluation-v3/CandidateList.tsx` | Added SearchIcon import                     |
| `src/app/(dashboard)/evaluation-debug/page.tsx`  | Debug page for testing                      |
| `src/app/(dashboard)/jobs/[jobId]/page.tsx`      | (Future) Replace Applications tab content   |

### Timeline Estimate

This migration involves:

- Copying ~28 files
- Adding 1 dependency
- Creating data transformers
- Updating 1 page component

The POC components are self-contained and should work immediately after copying. The main effort will be in connecting to real API data.
