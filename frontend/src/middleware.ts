import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware passthrough — no auth/session management needed for this portal.
 * All routes are publicly accessible.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Only run middleware on page routes, skip static assets and API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
