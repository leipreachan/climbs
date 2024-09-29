import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulate user segments data
  const userSegments = {
    6670984: { effort_count: 2 },
    // Add more segments as needed
  }

  return NextResponse.json(userSegments)
}