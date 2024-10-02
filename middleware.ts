import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set a secure cookie for the session
  response.cookies.set('__Secure-next-auth.session-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: ['/api/auth/:path*'],
}