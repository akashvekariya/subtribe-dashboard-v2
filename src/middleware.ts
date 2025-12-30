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
  // Dynamically include API URL from environment to avoid CSP violations
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const connectSrcUrls = ["'self'", apiUrl, "https://storage.googleapis.com"]
    .filter(Boolean)
    .join(" ");

  // Tawk.to domains for live chat
  const tawkDomains = "https://embed.tawk.to https://*.tawk.to wss://*.tawk.to";

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${tawkDomains}`, // Next.js + Tawk.to
    `style-src 'self' 'unsafe-inline' ${tawkDomains}`, // Tailwind + Tawk.to
    `img-src 'self' data: https: ${tawkDomains}`,
    `font-src 'self' data: ${tawkDomains}`,
    `connect-src ${connectSrcUrls} ${tawkDomains}`, // API endpoints + Tawk.to WebSocket
    `frame-src 'self' https://storage.googleapis.com ${tawkDomains}`, // PDF embedding + Tawk.to
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
