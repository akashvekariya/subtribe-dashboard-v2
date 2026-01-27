"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser, removeUserData } from "@/lib/auth";
import { Sidebar, JobContext } from "@/components/shared/Sidebar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { TawkTo } from "@/components/shared/TawkTo";
import { User, Job } from "@/types";
import { api } from "@/lib/api-client";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Job context state
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [jobStats, setJobStats] = useState<{
    total_candidates: number;
    by_status: Record<string, number>;
    by_tier: Record<string, number>;
  } | null>(null);

  // Extract jobId from pathname
  const jobId = useMemo(() => {
    const match = pathname?.match(/^\/jobs\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // Validate token with API - this will clear stale data if token is invalid
        const authUser = await getCurrentUser();

        if (!authUser) {
          // No valid user, clear cached data and redirect
          // Cookie is handled by backend
          removeUserData();
          window.location.href = "/sign-in";
          return;
        }

        // Check email verification (skip if already on verify-email page)
        if (
          !authUser.email_verified &&
          !pathname?.startsWith("/verify-email")
        ) {
          window.location.href = `/verify-email?email=${encodeURIComponent(authUser.email)}`;
          return;
        }

        // Check if user claimed org_creator invite and needs to complete onboarding
        // (pending_onboarding = true, no company yet)
        if (
          authUser.pending_onboarding &&
          !pathname?.startsWith("/onboarding")
        ) {
          window.location.href = "/onboarding";
          return;
        }

        // Check if user has no company (hasn't claimed invite yet)
        if (
          !authUser.company &&
          !authUser.pending_onboarding &&
          !pathname?.startsWith("/claim-invite")
        ) {
          window.location.href = "/claim-invite";
          return;
        }

        // Check if user's company hasn't completed onboarding
        // (team member joined company that hasn't completed setup)
        if (
          authUser.company &&
          !authUser.company.onboarding_completed &&
          !pathname?.startsWith("/onboarding")
        ) {
          window.location.href = "/onboarding";
          return;
        }

        setUser(authUser);
        setLoading(false);
      } catch {
        // Any error (401, network, etc.) should redirect to login
        // Only clear cached user data - cookie is handled by backend
        removeUserData();
        window.location.href = "/sign-in";
      }
    };

    validateAuth();
  }, [pathname]);

  // Fetch job data when jobId changes
  useEffect(() => {
    if (!jobId) {
      setCurrentJob(null);
      setJobStats(null);
      return;
    }

    const fetchJobContext = async () => {
      try {
        const [job, stats] = await Promise.all([
          api.jobs.getJobById(jobId),
          api.applications.getJobApplicationsStats(jobId),
        ]);
        setCurrentJob(job);
        setJobStats(stats);
      } catch (error) {
        console.error("Failed to fetch job context:", error);
        setCurrentJob(null);
        setJobStats(null);
      }
    };

    fetchJobContext();
  }, [jobId]);

  // Build job context for sidebar
  const jobContext: JobContext | undefined = useMemo(() => {
    if (!currentJob || !jobStats) return undefined;
    return {
      id: currentJob.id,
      title: currentJob.title,
      stats: jobStats,
    };
  }, [currentJob, jobStats]);

  // Show loading state while validating auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if onboarding is not complete - show only the onboarding page without sidebar/header
  const isOnboardingPage = pathname?.startsWith("/onboarding");
  const onboardingNotComplete =
    user?.company && !user.company.onboarding_completed;
  const pendingOnboarding = user?.pending_onboarding;

  if (isOnboardingPage || onboardingNotComplete || pendingOnboarding) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white px-4 py-2 rounded shadow-lg border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>

        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            user={user}
            jobContext={jobContext}
          />

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main content */}
            <main id="main-content" className="flex-1 overflow-y-auto">
              <div className="pt-6 pb-4">
                <div className="mx-auto px-4 sm:px-6 max-w-[1800px]">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Tawk.to Live Chat */}
        <TawkTo />
      </div>
    </ErrorBoundary>
  );
}
