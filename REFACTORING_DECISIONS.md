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

---

## Completed Refactoring

### Phase 1: Remove Dead Evaluation Code ✅
- Removed ~2,848 lines of dead v1 evaluation components
- Moved types to `src/types/evaluation.ts`
- Commit: `a982599`

### Phase 1.5: Rename evaluation-v3 to evaluation ✅
- Removed debug files (~2,991 lines)
- Renamed folder to `evaluation`
- Commit: `2b93c39`

### Phase 2: Type Consolidation (Partial) ✅
- Removed duplicate `ApplicationStatus` from component types
- Removed duplicate `DimensionLevel` from component types
- Removed duplicate `ManipulationCheck` from component types
- Updated component imports to use centralized types

---

## Remaining Phases

- [ ] Phase 3: Split api-client.ts by domain
- [ ] Phase 4: Refactor CandidateList props drilling
- [ ] Phase 5: Extract magic numbers to constants
- [ ] Phase 6: Standardize error handling
- [ ] Phase 7: Fix file naming conventions
- [ ] Phase 8: Clean up remaining debug/dev code
- [ ] Phase 9: Remove unused dependencies (date-fns)
- [ ] Phase 10: Decompose large page components
