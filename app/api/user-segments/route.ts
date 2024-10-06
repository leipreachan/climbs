import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getSession } from "@/lib/server-utils"

export async function GET() {
  const session = getSession()

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const filePath = path.join(process.cwd(), 'data', 'segments.json')
  const jsonData = await fs.readFile(filePath, 'utf8')
  const segments = JSON.parse(jsonData)
  // const reply = require('@/data/userSegments.json');
  // return NextResponse.json(reply);
  const userSegments: Record<number, { effort_count: number, pr_elapsed_time: number, pr_date: string }> = {}

  for (const segment of segments) {
    try {
      const response = await fetch(`https://www.strava.com/api/v3/segments/${segment.id}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      })
      const data = await response.json()
      userSegments[segment.id] = data.athlete_segment_stats
    } catch (error) {
      console.error(`Error fetching data for segment ${segment.id}:`, error)
    }
  }

  return NextResponse.json(userSegments)
}