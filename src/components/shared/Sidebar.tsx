import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BriefcaseIcon, HomeIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Jobs", href: "/jobs", icon: BriefcaseIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Subtribe ATS</h1>
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
                isActive
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent",
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-r-lg transition-colors"
              )}
            >
              <item.icon
                className={cn(
                  isActive
                    ? "text-blue-700"
                    : "text-gray-500 group-hover:text-gray-700",
                  "mr-3 flex-shrink-0 h-5 w-5"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
