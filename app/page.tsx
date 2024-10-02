'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from "next-auth/react"
import SegmentTable from '@/components/SegmentTable'
import SegmentMap from '@/components/SegmentMap'
import { Button } from '@/components/ui/button'
import { useRouter } from "next/navigation"

interface Segment {
  id: number
  name: string
  distance: number
  average_grade: number
  maximum_grade: number
  region: string
  start_latlng: [number, number]
  end_latlng: [number, number]
  map: {
    polyline: string
  }
}

export default function Home() {
  const { data: session } = useSession()
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegments, setSelectedSegments] = useState<Record<number, boolean>>({})
  const [userSegments, setUserSegments] = useState<Record<number, { effort_count: number, pr_elapsed_time: number }>>({})
  const [focusedSegment, setFocusedSegment] = useState<Segment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUserDataLoading, setUserDataLoading] = useState(false)

  const router = useRouter()

  const handleSignIn = async () => {
    const result = await signIn("strava", { callbackUrl: `${window.location}`, redirect: false })

    if (result?.url) {
      router.push(result.url)
    }
  }

  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch('/api/segments')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch segments')
        }
        const data = await response.json()
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid or empty segments data')
        }
        setSegments(data)
      } catch (err) {
        console.error('Error fetching segments:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSegments()
  }, [])

  const handleCheckSegment = (segmentId: number) => {
    setSelectedSegments(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }))
  }

  const handleSegmentFocus = (segment: Segment) => {
    setFocusedSegment(segment)
  }

  const checkUserResults = async () => {
    if (!session) {
      signIn("strava")
      return
    }

    setUserDataLoading(true);
    try {
      const response = await fetch('/api/user-segments')
      if (!response.ok) {
        throw new Error('Failed to fetch user segments')
      }
      const userSegmentsData = await response.json()
      setUserSegments(userSegmentsData)
    } catch (err) {
      console.error('Error fetching user segments:', err)
      setError('Failed to fetch user segments. Please try again.')
    }
    setUserDataLoading(false);
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading segments...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <p className="mt-4">
          Please make sure that the &apos;data/segments.json&apos; file exists and contains valid segment data.
        </p>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Strava Segments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SegmentTable
          segments={segments}
          selectedSegments={selectedSegments}
          userSegments={userSegments}
          onSegmentCheck={handleCheckSegment}
          onSegmentFocus={handleSegmentFocus}
        />
        <div className="h-[600px]">
          <SegmentMap
            segments={segments}
            selectedSegments={selectedSegments}
            userSegments={userSegments}
            focusedSegment={focusedSegment}
          />
        </div>
      </div>
      {!session && (
        <Button onClick={handleSignIn} variant="ghost" className="stravaConnect" />
      ) || (
          <Button onClick={checkUserResults} className="mt-4" disabled={isUserDataLoading}>
            {(isUserDataLoading && ("Loading your data... (it may take a while...)") || ("Check my Strava results"))}
          </Button>
        )}
    </main>
  )
}