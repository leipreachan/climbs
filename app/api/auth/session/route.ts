import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { session, originalUrl } = await request.json()

  // Set a cookie with the session data
  cookies().set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  // Instead of redirecting, send a success response
  return NextResponse.json({ success: true, redirectUrl: originalUrl })
}