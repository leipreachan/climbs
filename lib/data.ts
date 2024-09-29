import fs from 'fs/promises'
import path from 'path'

export async function getSegments() {
  const filePath = path.join(process.cwd(), 'data', 'segments.json')
  const jsonData = await fs.readFile(filePath, 'utf8')
  return JSON.parse(jsonData)
}