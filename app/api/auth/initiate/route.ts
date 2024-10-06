import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const callbackUrl = searchParams.get('callbackUrl')

  if (!callbackUrl) {
    return NextResponse.json({ error: 'Missing callbackUrl' }, { status: 400 })
  }

  const encodedCallbackUrl = encodeURIComponent(callbackUrl)
  const authUrl = `https://oauth.solorider.cc/auth/signin?callbackUrl=${encodedCallbackUrl}`

  return NextResponse.redirect(authUrl)
}