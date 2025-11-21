import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Jobs", href: "/jobs", icon: BriefcaseIcon },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
          <h1 className="text-xl font-bold text-gray-900 ml-3">Subtribe ATS</h1>
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

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
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
    </div>
  );
}
