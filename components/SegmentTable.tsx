'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SegmentTable({ segments }) {
  const [selectedSegments, setSelectedSegments] = useState({})
  const [userSegments, setUserSegments] = useState({})

  const handleCheckSegment = (segmentId) => {
    setSelectedSegments(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }))
  }

  const checkUserResults = async () => {
    // Simulate API call to get user segments
    const userSegmentsData = await fetch('/api/user-segments').then(res => res.json())
    setUserSegments(userSegmentsData)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Distance (m)</TableHead>
            <TableHead>Avg Grade (%)</TableHead>
            <TableHead>Max Grade (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((segment) => (
            <TableRow key={segment.id}>
              <TableCell>
                <Checkbox
                  checked={selectedSegments[segment.id] || false}
                  onChange={() => handleCheckSegment(segment.id)}
                />
              </TableCell>
              <TableCell>{segment.name}</TableCell>
              <TableCell>{segment.distance.toFixed(1)}</TableCell>
              <TableCell>{segment.average_grade.toFixed(1)}</TableCell>
              <TableCell>{segment.maximum_grade.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={checkUserResults} className="mt-4">
        Check my results
      </Button>
    </div>
  )
}