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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Segment {
  id: number
  name: string
  distance: number
  average_grade: number
  maximum_grade: number
  region: string
}

interface SegmentTableProps {
  segments: Segment[]
  selectedSegments: Record<number, boolean>
  onSegmentCheck: (segmentId: number) => void
  onSegmentFocus: (segment: Segment) => void
  onCheckUserResults: () => void
}

export default function SegmentTable({
  segments,
  selectedSegments,
  onSegmentCheck,
  onSegmentFocus,
  onCheckUserResults
}: SegmentTableProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  if (segments.length === 0) {
    return <div>No segments available.</div>
  }

  const segmentsByRegion = segments.reduce((acc, segment) => {
    if (!acc[segment.region]) {
      acc[segment.region] = []
    }
    acc[segment.region].push(segment)
    return acc
  }, {} as Record<string, Segment[]>)

  const toggleSection = (region: string) => {
    setOpenSections(prev => ({ ...prev, [region]: !prev[region] }))
  }

  return (
    <div>
      <Table className="text-left w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Avg Grade</TableHead>
            <TableHead>Max Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-grey-light flex flex-col items-center justify-between overflow-y-scroll w-full h-[72vh]">
          {Object.entries(segmentsByRegion).map(([region, regionSegments]) => (
            <Collapsible
              key={region}
              open={openSections[region]}
              onOpenChange={() => toggleSection(region)}
            >
              <CollapsibleTrigger asChild>
                <TableRow className="flex w-full mb-4 cursor-pointer hover:bg-muted">
                  <TableCell colSpan={5} className="font-medium">
                    <div className="flex items-center">
                      {openSections[region] ? (
                        <ChevronDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      {region} ({regionSegments.length} segments)
                    </div>
                  </TableCell>
                </TableRow>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {regionSegments.map((segment) => (
                  <TableRow className="flex w-full mb-4" key={segment.id}>
                    <TableCell className='p-4 w-2/12'>
                      <Checkbox
                        checked={selectedSegments[segment.id] || false}
                        onCheckedChange={() => onSegmentCheck(segment.id)}
                      />
                    </TableCell>
                    <TableCell className="p-4 w-2/12">
                      <button
                        onClick={() => onSegmentFocus(segment)}
                        className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        {segment.name}
                      </button>
                    </TableCell>
                    <TableCell className="p-4 w-4/12">{segment.distance.toFixed(1)}</TableCell>
                    <TableCell className="p-4 w-4/12">{segment.average_grade.toFixed(1)}</TableCell>
                    <TableCell className="p-4 w-4/12">{segment.maximum_grade.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onCheckUserResults} className="mt-4">
        Check my results
      </Button>
    </div>
  )
}