import { Metadata } from "next";
import DashboardLayoutClient from "./DashboardLayoutClient";

/**
 * Dashboard Layout - Server Component
 *
 * Exports metadata with noindex to prevent search engine indexing
 * This is part of the triple protection strategy:
 * 1. robots.txt blocks /dashboard routes
 * 2. noindex meta tags (this file)
 * 3. Authentication redirect (handled in client component)
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
