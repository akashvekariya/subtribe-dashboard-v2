/**
 * Feature Access Hook
 *
 * Custom hook for managing feature flags and paywall access.
 * Provides clean API for checking premium feature access.
 *
 * Usage:
 * ```tsx
 * const { hasAccess, isLoading, subscription } = useFeatureAccess('salary_insights');
 * ```
 */

import { useState, useEffect } from "react";
import type { AnalysisFeatureFlags } from "@/types/analysis";
import { getAnalysisFeatureFlags } from "@/lib/services/analysis-stub";
import { getCurrentUser } from "@/lib/auth";

type PremiumFeature =
  | "salary_insights"
  | "career_trajectory"
  | "interview_readiness"
  | "diversity_insights"
  | "retention_risk";

export interface FeatureAccessResult {
  /** Whether user has access to this feature */
  hasAccess: boolean;
  /** Whether the check is loading */
  isLoading: boolean;
  /** The user's subscription tier */
  subscription: "free" | "pro" | "enterprise";
  /** Full feature flags */
  featureFlags: AnalysisFeatureFlags | null;
  /** Trigger upgrade flow */
  requestUpgrade: () => void;
}

/**
 * Hook to check access to a specific premium feature
 */
export function useFeatureAccess(feature: PremiumFeature): FeatureAccessResult {
  const [featureFlags, setFeatureFlags] = useState<AnalysisFeatureFlags | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setFeatureFlags({
            has_premium_access: false,
            available_premium_features: [],
            subscription_tier: "free",
          });
          return;
        }

        const flags = await getAnalysisFeatureFlags(user.id);
        setFeatureFlags(flags);
      } catch (error) {
        console.error("Failed to load feature flags:", error);
        // Default to free tier on error
        setFeatureFlags({
          has_premium_access: false,
          available_premium_features: [],
          subscription_tier: "free",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  const hasAccess =
    featureFlags?.available_premium_features.includes(feature) ?? false;

  const requestUpgrade = () => {
    // TODO: Implement upgrade flow
    // This could navigate to pricing page, show upgrade modal, etc.
    // window.location.href = '/pricing';
    // or: showUpgradeModal(feature);
  };

  return {
    hasAccess,
    isLoading,
    subscription: featureFlags?.subscription_tier ?? "free",
    featureFlags,
    requestUpgrade,
  };
}
