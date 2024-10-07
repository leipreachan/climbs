import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { session, originalUrl } = await request.json()

  // Set a cookie with the session data
  cookies().set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Allow cross-site cookie setting
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  // Set CORS headers
  const response = NextResponse.json({ success: true, redirectUrl: originalUrl })
  response.headers.set('Access-Control-Allow-Origin', 'https://oauth.solorider.cc')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', 'https://oauth.solorider.cc')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}