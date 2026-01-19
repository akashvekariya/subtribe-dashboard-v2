# Refactoring Decisions Needed

## Pending Decisions

### 1. analysis.ts - Premium Features Types
**File:** `src/types/analysis.ts` (235 lines)
**Usage:** Only 2 files (`useFeatureAccess.ts`, `analysis-stub.ts`)
**Question:** Is the premium analysis feature active or should it be removed as dead code?

### 2. Component Types Location
**Current:** `src/components/evaluation/types/index.ts` (221 lines)
**Question:** Keep component-specific types close to components OR move to `src/types/evaluation-ui.ts`?

### 3. Similar-but-Different Types
These types have same names but different structures (API vs UI format):
- `RedFlag` - UI version has `id` field, API version doesn't
- `SkillMatch` - Completely different fields
- `InterviewQuestion` - UI version has `id` field

**Question:** Rename to clarify (e.g., `RedFlagUI` vs `RedFlag`)? Or keep separate?

### 4. Large Page Components
**File:** `src/app/(dashboard)/jobs/[jobId]/page.tsx` (850 lines)
**Question:** Should this be decomposed into smaller components?

---

## Completed Refactoring

### Phase 1: Remove Dead Evaluation Code
- Removed ~2,848 lines of dead v1 evaluation components
- Moved types to `src/types/evaluation.ts`
- Commit: `a982599`

### Phase 1.5: Rename evaluation-v3 to evaluation
- Removed debug files (~2,991 lines)
- Renamed folder to `evaluation`
- Commit: `2b93c39`

### Phase 2: Type Consolidation (Partial)
- Removed duplicate `ApplicationStatus` from component types
- Removed duplicate `DimensionLevel` from component types
- Removed duplicate `ManipulationCheck` from component types
- Commit: `0930f6c`

### Phase 3: Split api-client.ts by Domain
- Created `src/lib/api/` folder with 12 domain modules
- Reduced api-client.ts from 1,366 lines to 6-line re-export
- Commit: `c224f1a`

### Phase 4: CandidateList Props Refactoring
- Created `useCandidateList` hook for state management
- Created `CandidateListContext` for data sharing
- Reduced CandidateList props from 26 to 7 (73% reduction)
- Commit: `b926252`

### Phase 5: Extract Magic Numbers to Constants
- Created `src/lib/constants.ts` with SCORING, AI_SCORE, PAGINATION, TIME constants
- Updated candidates.ts, status-update-config.ts, useCandidateList.ts, jobs.ts
- Commit: `caa4c3d`

### Phase 6: Remove Debug Console Statements
- Removed debug console.log from calibration, evaluation, and hooks
- Kept console.error in catch blocks for error debugging
- Commit: `3436231`

### Phase 7: Fix File Naming Conventions
- Renamed `calibrationSummary.ts` to `calibration-summary.ts`
- Updated all imports
- Commit: `e543eb4`

### Phase 8: Remove Unused Dependencies
- Removed `date-fns` from package.json (no imports found)
- Native Intl APIs used for date formatting
- Commit: `396b0ea`

---

## Summary

**Total commits:** 10
**Estimated lines removed:** ~6,000+
**Key improvements:**
- Removed dead code (evaluation v1, debug files)
- Better code organization (api split, hooks, context)
- Reduced prop drilling (26 → 7 props)
- Centralized constants
- Consistent naming conventions
