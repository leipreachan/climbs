import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const segments = require('@/data/segments.json')
  const userSegments: Record<number, { effort_count: number }> = {}

  for (const segment of segments) {
    try {
      const response = await fetch(`https://www.strava.com/api/v3/segments/${segment.id}/all_efforts`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      })
      const data = await response.json()
      userSegments[segment.id] = { effort_count: data.length }
    } catch (error) {
      console.error(`Error fetching data for segment ${segment.id}:`, error)
    }
  }

  return NextResponse.json(userSegments)
}