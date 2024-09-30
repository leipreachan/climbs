'use client'

import { useState, useEffect } from 'react'
import SegmentTable from '@/components/SegmentTable'
import SegmentMap from '@/components/SegmentMap'

export default function Home() {
  const [segments, setSegments] = useState([])
  const [selectedSegments, setSelectedSegments] = useState({})
  const [userSegments, setUserSegments] = useState({})
  const [focusedSegment, setFocusedSegment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch('/api/segments')
        if (!response.ok) {
          throw new Error('Failed to fetch segments')
        }
        const data = await response.json()
        setSegments(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSegments()
  }, [])

  const handleCheckSegment = (segmentId) => {
    setSelectedSegments(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }))
  }

  const handleSegmentFocus = (segment) => {
    setFocusedSegment(segment)
  }

  const checkUserResults = async () => {
    try {
      const response = await fetch('/api/user-segments')
      if (!response.ok) {
        throw new Error('Failed to fetch user segments')
      }
      const userSegmentsData = await response.json()
      setUserSegments(userSegmentsData)
    } catch (err) {
      console.error('Error fetching user segments:', err)
      // You might want to set an error state here as well
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading segments...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Strava Segments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SegmentTable 
          segments={segments}
          selectedSegments={selectedSegments}
          onSegmentCheck={handleCheckSegment}
          onSegmentFocus={handleSegmentFocus}
          onCheckUserResults={checkUserResults}
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
    </main>
  )
}