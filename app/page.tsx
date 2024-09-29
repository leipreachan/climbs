import { Suspense } from 'react'
import SegmentTable from '@/components/SegmentTable'
import SegmentMap from '@/components/SegmentMap'
import { getSegments } from '@/lib/data'

export default async function Home() {
  const segments = await getSegments()

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Strava Segments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Suspense fallback={<div>Loading segments...</div>}>
            <SegmentTable segments={segments} />
          </Suspense>
        </div>
        <div className="h-[600px]">
          <Suspense fallback={<div>Loading map...</div>}>
            <SegmentMap segments={segments} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}