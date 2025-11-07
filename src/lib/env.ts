import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional(),
});

function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new Error(`Environment variable validation failed:\n${issues}`);
    }
    throw error;
  }
}

export const env = validateEnv();

/**
 * Get the public job application URL
 * Uses NEXT_PUBLIC_APP_URL from env, or falls back to window.location.origin in client
 */
export function getPublicJobUrl(jobSlug: string): string {
  // Server-side or if APP_URL is set
  if (env.NEXT_PUBLIC_APP_URL) {
    return `${env.NEXT_PUBLIC_APP_URL}/apply/${jobSlug}`;
  }

  // Client-side fallback
  if (typeof window !== "undefined") {
    return `${window.location.origin}/apply/${jobSlug}`;
  }

  // Default fallback (should not reach here in normal operation)
  return `/apply/${jobSlug}`;
}
