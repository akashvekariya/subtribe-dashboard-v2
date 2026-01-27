# Resume Analysis Architecture

This document outlines the architecture and usage of the resume analysis feature implementation.

## 🏗️ Architecture Overview

The implementation follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                       │
│  (Components - UI only, no business logic)                   │
│  - MetricCard.tsx                                            │
│  - Card.tsx, Skeleton.tsx                                    │
│  - Analysis Tab Components                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Hook/State Layer                         │
│  (Custom hooks - state management, data fetching)            │
│  - useFeatureAccess.ts                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Service Layer                            │
│  (Data fetching, API calls, business logic)                  │
│  - analysis-stub.ts (will become real API)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       Type Layer                              │
│  (TypeScript types and interfaces)                           │
│  - types/analysis.ts                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── types/
│   └── analysis.ts                  # All analysis-related types
├── lib/
│   └── services/
│       └── analysis-stub.ts         # Stub service (replace with real API)
├── hooks/
│   └── useFeatureAccess.ts          # Custom hooks for feature flags
├── components/
│   ├── ui/
│   │   ├── Card.tsx                 # Base card component
│   │   ├── Skeleton.tsx             # Loading states
│   │   └── Tabs.tsx                 # Tab navigation (existing)
│   └── analysis/
│       └── MetricCard.tsx           # Metric display component
```

## 🎯 Key Principles

### 1. Single Responsibility

Each component has one job:

- **MetricCard**: Displays a single metric
- **Skeleton**: Shows loading state
- **Card**: Provides consistent container styling
- **useFeatureAccess**: Manages feature flag logic

### 2. Data Flow

```
API/Service → Hook → Component → User
```

Components never directly call services. Hooks manage all data fetching.

### 3. No Sensitive Data Leakage

- Premium features are controlled server-side
- Frontend only hides/shows based on flags
- Never send sensitive data to client if user lacks access

### 4. Paywall Support

- Built-in premium feature support
- Graceful degradation for free users
- Easy to lock/unlock features

## 🔧 Usage Examples

### Example 1: Basic Metric Card

```tsx
import { MetricCard } from "@/components/analysis/MetricCard";
import { ChartBarIcon } from "@heroicons/react/24/outline";

function MyComponent() {
  return (
    <MetricCard
      label="Overall Score"
      value={78}
      suffix="/100"
      icon={ChartBarIcon}
      variant="success"
      description="Strong candidate match"
      trend={{ value: "+5%", direction: "up" }}
    />
  );
}
```

### Example 2: Premium Feature with Paywall

```tsx
import { MetricCard } from "@/components/analysis/MetricCard";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

function SalaryInsight({ data }) {
  const { hasAccess, requestUpgrade } = useFeatureAccess("salary_insights");

  return (
    <MetricCard
      label="Market Salary Range"
      value={
        hasAccess
          ? `$${data.market_salary_min}-${data.market_salary_max}k`
          : "••••"
      }
      icon={CurrencyDollarIcon}
      isPremium={true}
      hasAccess={hasAccess}
      onUpgradeClick={requestUpgrade}
      description="Based on market data analysis"
    />
  );
}
```

### Example 3: Loading States

```tsx
import {
  MetricCardSkeleton,
  MetricGrid,
} from "@/components/analysis/MetricCard";

function LoadingState() {
  return (
    <MetricGrid columns={3}>
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </MetricGrid>
  );
}
```

### Example 4: Complete Analysis Tab

```tsx
"use client";

import { useEffect, useState } from "react";
import { getResumeAnalysis } from "@/lib/services/analysis-stub";
import { usePremiumAccess } from "@/hooks/useFeatureAccess";
import { MetricCard, MetricGrid } from "@/components/analysis/MetricCard";
import { Card } from "@/components/ui/Card";
import type { ResumeAnalysis } from "@/types/analysis";

export function AnalysisTab({ applicationId }: { applicationId: string }) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPremiumAccess } = usePremiumAccess();

  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      try {
        const result = await getResumeAnalysis(applicationId, hasPremiumAccess);
        setAnalysis(result.data);
      } catch (error) {
        console.error("Failed to load analysis:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [applicationId, hasPremiumAccess]);

  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  if (!analysis) {
    return <div>Failed to load analysis</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <MetricGrid columns={3}>
        <MetricCard
          label="Overall Score"
          value={analysis.overall_score}
          suffix="/100"
          variant={analysis.overall_score >= 70 ? "success" : "warning"}
        />
        <MetricCard
          label="Skills Match"
          value={analysis.job_fit.skills_match_percentage}
          suffix="%"
        />
        <MetricCard
          label="Experience Match"
          value={analysis.job_fit.experience_match_percentage}
          suffix="%"
        />
      </MetricGrid>

      {/* Premium Features */}
      {analysis.salary_insights && (
        <Card>
          <h3>Salary Insights</h3>
          {/* Render salary data */}
        </Card>
      )}
    </div>
  );
}
```

## 🔄 Migrating from Stub to Real API

When the backend API is ready, update `analysis-stub.ts`:

```tsx
// BEFORE (Stub)
export async function getResumeAnalysis(id: string) {
  await simulateDelay();
  return { success: true, data: mockData };
}

// AFTER (Real API)
export async function getResumeAnalysis(id: string) {
  const response = await api.analysis.get(id);
  return response;
}
```

**No changes needed in components!** The service layer abstraction means components remain unchanged.

## 🎨 Design System Integration

### Colors & Variants

- `default`: Gray (neutral metrics)
- `success`: Green (positive metrics, high scores)
- `warning`: Yellow (caution, moderate scores)
- `danger`: Red (negative metrics, low scores)
- `info`: Blue (informational metrics)

### Sizing

- `sm`: Compact cards for dashboard grids
- `md`: Standard size (default)
- `lg`: Large cards for hero metrics

### BEM Naming

Components follow BEM conventions where applicable:

```scss
.card {
} // Block
.card__header {
} // Element
.card--elevated {
} // Modifier
```

## 🔐 Security Considerations

### 1. Server-Side Validation

```tsx
// ❌ Bad: Checking access only on frontend
if (user.isPremium) {
  return premiumData;
}

// ✅ Good: Server validates, frontend only shows/hides
const data = await api.getAnalysis(id); // Server checks access
return data.salary_insights || null;
```

### 2. No Sensitive Data in Frontend

```tsx
// ❌ Bad: Sending all data to client, hiding with CSS
<div className={!hasAccess && "hidden"}>{sensitiveData}</div>;

// ✅ Good: Server doesn't send data user can't access
{
  analysis.salary_insights && hasAccess && (
    <SalaryCard data={analysis.salary_insights} />
  );
}
```

## 📊 Type Safety

All types are defined in `types/analysis.ts`:

```tsx
import type { ResumeAnalysis } from "@/types/analysis";

// TypeScript ensures correctness
function processAnalysis(analysis: ResumeAnalysis) {
  // IDE autocomplete works
  console.log(analysis.job_fit.overall_fit_score);

  // Type errors caught at build time
  // console.log(analysis.invalid_field); // ❌ Error
}
```

## 🧪 Testing Strategy

### Component Testing

```tsx
import { render } from "@testing-library/react";
import { MetricCard } from "@/components/analysis/MetricCard";

test("displays metric correctly", () => {
  const { getByText } = render(<MetricCard label="Score" value={85} />);
  expect(getByText("85")).toBeInTheDocument();
});

test("shows lock for premium without access", () => {
  const { getByTestId } = render(
    <MetricCard label="Score" value={85} isPremium hasAccess={false} />
  );
  expect(getByTestId("lock-icon")).toBeInTheDocument();
});
```

### Service Testing

```tsx
import { getResumeAnalysis } from "@/lib/services/analysis-stub";

test("returns analysis data", async () => {
  const result = await getResumeAnalysis("test-id", true);
  expect(result.success).toBe(true);
  expect(result.data.overall_score).toBeGreaterThan(0);
});
```

## 🚀 Next Steps

1. **Create Analysis Tab Component**
   - Use Tabs component from `@/components/ui/Tabs`
   - Implement Basic Details and Analysis tabs

2. **Build Specific Metric Sections**
   - Skills Analysis component
   - Experience Timeline component
   - Resume Quality component

3. **Implement Real API**
   - Replace stub service with real API calls
   - Add error handling
   - Add retry logic

4. **Add Upgrade Flow**
   - Implement `requestUpgrade` function
   - Create pricing/upgrade modal
   - Add analytics tracking

5. **Performance Optimization**
   - Add caching for analysis results
   - Implement optimistic UI updates
   - Add background data refresh

## 📝 Code Style Guidelines

### Component Structure

```tsx
// 1. Imports
import * as React from "react";
import { cn } from "@/lib/utils";

// 2. Types
interface Props {
  // ...
}

// 3. Component
export function Component({ prop }: Props) {
  // 3a. Hooks
  const [state, setState] = useState();

  // 3b. Effects
  useEffect(() => {}, []);

  // 3c. Handlers
  const handleClick = () => {};

  // 3d. Render
  return <div />;
}
```

### Naming Conventions

- **Components**: PascalCase (`MetricCard`)
- **Hooks**: camelCase with `use` prefix (`useFeatureAccess`)
- **Services**: camelCase (`getResumeAnalysis`)
- **Types**: PascalCase (`ResumeAnalysis`)
- **CSS Classes**: kebab-case BEM (`metric-card__value`)

## 📖 Additional Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [BEM Naming](https://getbem.com/naming/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Ready to implement!** All the foundational pieces are in place. You can now build the Analysis tab and start adding metrics.
