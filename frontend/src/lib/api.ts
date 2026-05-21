/**
 * Central API base URL.
 * Set NEXT_PUBLIC_API_URL in .env.local for local dev,
 * and in Vercel environment variables for production (pointing to Railway).
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
