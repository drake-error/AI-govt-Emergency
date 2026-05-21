/**
 * API base URL.
 *
 * - In production (Vercel): empty string → same-origin Next.js API routes
 * - In local dev: empty string → Next.js dev server handles /api/* routes
 * - Override via NEXT_PUBLIC_API_URL env var if you ever need an external backend
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
