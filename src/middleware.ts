import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Generate unique request ID for tracking
  const requestId = crypto.randomUUID();

  // Skip logging for static assets to reduce noise
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  // Create response
  const response = NextResponse.next();

  // Add security headers (production-grade)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (CSP)
  // Allow Next.js assets, API calls, and external resources
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.thesubtribe.com https://dashboard.thesubtribe.com https://*.run.app", // API endpoints
    "frame-src 'self' https://storage.googleapis.com", // Allow PDF embedding from Google Cloud Storage
    "object-src 'self' https://storage.googleapis.com", // Allow PDF embedding via object/embed tags
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);

  // Log request (single JSON entry with all context)
  if (!isStaticAsset) {
    const duration = Date.now() - startTime;

    logger.info("Request processed", {
      requestId,
      method: request.method,
      path: pathname,
      status: response.status,
      duration,
      userAgent: request.headers.get("user-agent") || "unknown",
    });
  }

  return response;
}

export const config = {
  // Exclude all static assets from middleware to reduce overhead
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|webp|mp4|webm)$).*)",
  ],
};
