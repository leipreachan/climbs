import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'segments.json')
    const jsonData = await fs.readFile(filePath, 'utf8')
    const segments = JSON.parse(jsonData)
    return NextResponse.json(segments)
  } catch (error) {
    console.error('Error reading segments data:', error)
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}