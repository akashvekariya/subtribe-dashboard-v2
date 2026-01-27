"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/auth";
import { User } from "@/types";
import {
  BriefcaseIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { name: "Team", href: "/team", icon: UserGroupIcon },
];

// Status menu items with user-friendly labels
const statusItems = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

// Tier menu items with user-friendly labels
const tierItems = [
  { key: "strong_match", label: "Strong" },
  { key: "good_match", label: "Good" },
  { key: "moderate_match", label: "Moderate" },
  { key: "weak_match", label: "Weak" },
  { key: "mismatch", label: "Mismatch" },
];

export interface JobContext {
  id: string;
  title: string;
  stats: {
    total_candidates: number;
    by_status: Record<string, number>;
    by_tier: Record<string, number>;
  };
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user?: User | null;
  jobContext?: JobContext;
}

export function Sidebar({
  collapsed,
  onToggle,
  user,
  jobContext,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    await logoutUser();
    window.location.href = "/sign-in";
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email || "User";
  };

  // Check if a job context link is active
  const isJobContextLinkActive = (
    statusFilter?: string,
    tierFilter?: string
  ) => {
    if (!jobContext) return false;
    const isOnApplicationsPage = pathname?.includes(
      `/jobs/${jobContext.id}/applications`
    );
    if (!isOnApplicationsPage) return false;

    const currentStatus = searchParams.get("status");
    const currentTier = searchParams.get("tier");

    if (statusFilter) {
      return currentStatus === statusFilter && !currentTier;
    }
    if (tierFilter) {
      return currentTier === tierFilter && !currentStatus;
    }
    // "All Candidates" - no filters
    return !currentStatus && !currentTier;
  };

  // Build URL for job context links
  const buildJobContextUrl = (statusFilter?: string, tierFilter?: string) => {
    if (!jobContext) return "#";
    const base = `/jobs/${jobContext.id}/applications`;
    if (statusFilter) return `${base}?status=${statusFilter}`;
    if (tierFilter) return `${base}?tier=${tierFilter}`;
    return base;
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-3 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900 ml-3">Subtribe</h1>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/jobs" && pathname?.startsWith("/jobs"));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed
                  ? // Collapsed state - even borders
                    isActive
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-700 rounded-lg justify-center"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent rounded-lg justify-center"
                  : // Expanded state - left border
                    isActive
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 rounded-r-lg"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-r-lg"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  isActive
                    ? "text-blue-700"
                    : "text-gray-500 group-hover:text-gray-700",
                  "flex-shrink-0 h-5 w-5",
                  !collapsed && "mr-3"
                )}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Job Context Menu - Only show when viewing a job and not collapsed */}
      {jobContext && !collapsed && (
        <div className="flex-1 overflow-y-auto border-t border-gray-200">
          <div className="py-4">
            {/* Job Title */}
            <h2 className="px-4 text-xs font-semibold text-gray-900 uppercase tracking-wide truncate mb-3">
              {jobContext.title}
            </h2>

            {/* Overview Link */}
            <Link
              href={`/jobs/${jobContext.id}`}
              className={cn(
                "group flex items-center justify-between mx-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === `/jobs/${jobContext.id}`
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span>Overview</span>
            </Link>

            {/* All Candidates */}
            <Link
              href={buildJobContextUrl()}
              className={cn(
                "group flex items-center justify-between mx-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isJobContextLinkActive()
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span>All Candidates</span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isJobContextLinkActive() ? "text-blue-500" : "text-gray-400"
                )}
              >
                {jobContext.stats.total_candidates}
              </span>
            </Link>

            {/* Pipeline Stage Section */}
            <div className="mt-5">
              <h3 className="px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Pipeline
              </h3>
              <div className="space-y-px">
                {statusItems.map((item) => {
                  const count = jobContext.stats.by_status[item.key] || 0;
                  const isActive = isJobContextLinkActive(item.key);
                  return (
                    <Link
                      key={item.key}
                      href={buildJobContextUrl(item.key)}
                      className={cn(
                        "group flex items-center justify-between mx-3 pl-5 pr-3 py-1.5 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          isActive ? "text-blue-500" : "text-gray-400"
                        )}
                      >
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Match Quality Section */}
            <div className="mt-5">
              <h3 className="px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Match Quality
              </h3>
              <div className="space-y-px">
                {tierItems.map((item) => {
                  const count = jobContext.stats.by_tier[item.key] || 0;
                  const isActive = isJobContextLinkActive(undefined, item.key);
                  return (
                    <Link
                      key={item.key}
                      href={buildJobContextUrl(undefined, item.key)}
                      className={cn(
                        "group flex items-center justify-between mx-3 pl-5 pr-3 py-1.5 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          isActive ? "text-blue-500" : "text-gray-400"
                        )}
                      >
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer when no job context */}
      {(!jobContext || collapsed) && <div className="flex-1" />}

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "w-full flex items-center rounded-lg hover:bg-gray-50 transition-colors p-2",
              collapsed ? "justify-center" : "gap-3"
            )}
            title={collapsed ? getUserDisplayName() : undefined}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {getInitials()}
              </span>
            </div>

            {/* User info - only show when expanded */}
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              className={cn(
                "absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",
                collapsed ? "left-0 w-48" : "left-0 right-0"
              )}
            >
              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
