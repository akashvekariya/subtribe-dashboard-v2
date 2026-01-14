# Evaluation V3 - Candidate Evaluation Dashboard

A two-panel layout component system for AI-powered candidate assessment.

## Overview

This dashboard provides a comprehensive view for evaluating job candidates with:
- **Left Panel**: Filterable, sortable candidate list
- **Right Panel**: Detailed AI evaluation and resume view with tabbed navigation

## Architecture

```
ComponentsDebugPage (Main Entry)
|
+-- Left Panel: CandidateList
|   +-- Filter by Tier
|   +-- Filter by Status
|   +-- Sort options
|   +-- CandidateCard (repeated)
|   +-- Pagination
|
+-- Right Panel: Evaluation Content
    +-- EvaluationTabs (AI Evaluation | Resume)
    |
    +-- AI Evaluation Tab
    |   +-- ScoreSummaryPanel
    |   +-- InsightsCard
    |   +-- SkillsGrid
    |   +-- ConstraintAccordion
    |   +-- InterviewQuestionsAccordion
    |   +-- RedFlagsAccordion
    |
    +-- Resume Tab
        +-- ResumeView
```

## Features Not Currently Rendered

The following features have CSS/code support but are NOT rendered in the current implementation:

| Feature | Status | Notes |
|---------|--------|-------|
| Search Input | CSS exists (`.candidate-search-*`) | Not rendered in current view |

---

## Component Reference

| Component | File | Purpose |
|-----------|------|---------|
| ComponentsDebugPage | `ComponentsDebugPage.tsx` | Main dashboard orchestrator, handles layout and state |
| CandidateList | `CandidateList.tsx` | Left sidebar with candidate cards, filtering, sorting, pagination |
| ScoreSummaryPanel | `ScoreSummaryPanel.tsx` | Score overview with animated ring chart and category breakdown |
| InsightsCard | `InsightsCard.tsx` | Displays candidate strengths and concerns |
| SkillsGrid | `SkillsGrid.tsx` | Skill assessment grid with signal strength indicators |
| ConstraintAccordion | `ConstraintAccordion.tsx` | Expandable list of Pass/Review/Fail constraints |
| InterviewQuestionsAccordion | `InterviewQuestionsAccordion.tsx` | Suggested interview questions organized by category |
| RedFlagsAccordion | `RedFlagsAccordion.tsx` | Risk assessment flags with severity levels |
| ResumeView | `ResumeView.tsx` | Formatted resume display (experience, education, projects) |
| EvaluationTabs | `EvaluationTabs.tsx` | Tab navigation between AI Evaluation and Resume |

---

## Supporting Files

| File | Purpose |
|------|---------|
| `types/index.ts` | TypeScript interfaces and type definitions |
| `config/variants.ts` | Styling configurations (pills, tiers, statuses, sort options) |
| `config/index.ts` | Re-exports all configuration |
| `utils.ts` | Utility functions (`getInitials`, `formatRelativeDate`, `formatDate`) |
| `icons.tsx` | SVG icon components (stroke and filled variants) |
| `colors.ts` | Color definitions and helper functions |
| `styles.css` | Component styles and CSS custom properties |
| `shared/` | Reusable components (`AnimatedPill`, `PersonalInfoDisplay`, `SectionHeader`) |
| `store/` | Zustand store with LRU cache for candidate data |
| `Skeleton.tsx` | Loading state skeleton components |
| `index.ts` | Central exports for all components and types |

---

## Data Types

### PersonalInfo
```typescript
interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}
```

### SkillMatch
```typescript
interface SkillMatch {
  skill: string;
  signal_strength: SignalStrength; // 'strong' | 'moderate' | 'academic' | 'listed' | 'missing'
  sources: SkillSource[];
}
```

### Constraint
```typescript
interface Constraint {
  name: string;
  description: string;
  status: EligibilityStatus; // true | 'review' | false
  details: string;
}
```

### InterviewQuestion
```typescript
interface InterviewQuestion {
  category: string;
  question: string;
  context: string;
}
```

### RedFlag
```typescript
interface RedFlag {
  flag_type: string;
  severity: FlagSeverity; // 'concern' | 'investigate' | 'info'
  description: string;
  context?: string;
}
```

### ResumeData
```typescript
interface ResumeData {
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  certifications: ResumeCertification[];
}
```

---

## Configuration Objects

### Tier Styles
```typescript
tierStyles: Record<Tier, { label: string; className: string; color: string }>
// Tiers: 'excellent_match' | 'good_match' | 'average_match' | 'poor_match'
```

### Status Styles
```typescript
statusStyles: Record<ApplicationStatus, { label: string; className: string }>
// Statuses: 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
```

### Signal Config
```typescript
signalConfig: Record<SignalStrength, { label: string; variant: PillVariant; textColor: string; description: string }>
```

---

## Usage

```tsx
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
} from './components/evaluation-v3';

// Use the main debug page as reference implementation
import ComponentsDebugPage from './components/evaluation-v3/ComponentsDebugPage';
```

---

## Mobile Responsiveness

| Viewport | Behavior |
|----------|----------|
| Desktop (768px+) | Side-by-side panels |
| Mobile (<768px) | Single panel with slide-in detail panel from right |

Mobile-specific classes:
- `.eval-mobile-header` - Mobile header bar
- `.eval-mobile-overlay` - Backdrop overlay
- `.eval-layout-sidebar` - Transforms to full-screen on mobile
- `.eval-layout-detail` - Slides in from right on mobile

---

## State Management

The component system uses Zustand for state management with an LRU cache:

```typescript
import { useCandidateStore, useCurrentCandidate } from './components/evaluation-v3';

// Access current candidate data
const candidate = useCurrentCandidate();

// Access store actions
const { selectCandidate, fetchCandidate } = useCandidateStore();
```

---

## File Organization

```
evaluation-v3/
+-- index.ts              # Main exports
+-- types/
|   +-- index.ts          # Type definitions
+-- config/
|   +-- index.ts          # Config exports
|   +-- variants.ts       # Styling configurations
+-- store/
|   +-- index.ts          # Zustand store
|   +-- types.ts          # Store-specific types
|   +-- lru-cache.ts      # LRU cache implementation
+-- shared/
|   +-- index.ts          # Shared component exports
|   +-- AnimatedPill.tsx
|   +-- PersonalInfoDisplay.tsx
|   +-- SectionHeader.tsx
+-- ComponentsDebugPage.tsx
+-- CandidateList.tsx
+-- ScoreSummaryPanel.tsx
+-- ScoreRing.tsx
+-- InsightsCard.tsx
+-- SkillsGrid.tsx
+-- ConstraintAccordion.tsx
+-- InterviewQuestionsAccordion.tsx
+-- RedFlagsAccordion.tsx
+-- ResumeView.tsx
+-- EvaluationTabs.tsx
+-- StatusPill.tsx
+-- Skeleton.tsx
+-- icons.tsx
+-- colors.ts
+-- utils.ts
+-- styles.css
+-- README.md
```
