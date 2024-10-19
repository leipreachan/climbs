import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const useSecureCookies = (process.env.NEXTAUTH_URL || '').startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : ''
const sessionCookieName = `${cookiePrefix}next-auth.session-token`;
export async function GET() {
  const sessionCookie = cookies().get(sessionCookieName)
  console.log(sessionCookieName);
  console.log(sessionCookie);

  let session = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value)
    } catch (error) {
      console.error('Error parsing session cookie:', error)
    }
  }

  const response = NextResponse.json(session)

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://climbs.solorider.cc')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export async function POST(request: Request) {
  const { session } = await request.json()

  const response = NextResponse.json({ success: true })
  
  // Set a cookie with the session data
  response.cookies.set(sessionCookieName, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Allow cross-site cookie setting
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.OAUTH_DOMAIN || 'https://oauth.solorider.cc')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  
  response.headers.set('Access-Control-Allow-Origin', process.env.OAUTH_DOMAIN || 'https://oauth.solorider.cc')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
}