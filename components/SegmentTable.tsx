'use client'

import { useState, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react'
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Segment } from 'next/dist/server/app-render/types'


interface UserSegmentData {
  effort_count: number,
  pr_elapsed_time: number
}

interface SegmentTableProps {
  segments: Segment[]
  selectedSegments: Record<number, boolean>
  userSegments: Record<number, UserSegmentData>
  onSegmentCheck: (segmentId: number) => void
  onSegmentFocus: (segment: Segment) => void
}

export default function SegmentTable({
  segments,
  selectedSegments,
  userSegments,
  onSegmentCheck,
  onSegmentFocus,
}: SegmentTableProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<Segment>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedSegments[row.original.id] || false}
          onChange={() => onSegmentCheck(row.original.id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <button
            onClick={() => onSegmentFocus(row.original)}
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mr-2"
          >
            {row.original.name}
          </button>
          {userSegments[row.original.id]?.effort_count > 0 && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />&nbsp;{userSegments[row.original.id]?.effort_count}
            </>
          )}
          [<a href={"https://strava.com/segments/" + row.original.id} target="_blank" title="Link to original segment">↗️</a>]
        </div>
      ),
    },
    {
      accessorKey: "distance",
      header: "Distance (m)",
      cell: ({ row }) => row.original.distance.toFixed(1),
    },
    {
      accessorKey: "average_grade",
      header: "Avg Grade (%)",
      cell: ({ row }) => row.original.average_grade.toFixed(1),
    },
    {
      accessorKey: "maximum_grade",
      header: "Max Grade (%)",
      cell: ({ row }) => row.original.maximum_grade.toFixed(1),
    },
  ]

  const segmentsByRegion: Record<string, Segment[]> = useMemo(() => {
    return segments.reduce((acc, segment) => {
      if (!acc[segment.region]) {
        acc[segment.region] = []
      }
      acc[segment.region].push(segment)
      return acc
    }, {} as Record<string, Segment[]>)
  }, [segments])

  const toggleSection = (region: string) => {
    setOpenSections(prev => ({ ...prev, [region]: !prev[region] }))
  }

  if (segments.length === 0) {
    return <div>No segments available.</div>
  }

  const calcNumberOfCheckedSegmentsPerRegion = (segments: Segment[], userSegments: Record<number, UserSegmentData>) => {
    const segmentsObj: Record<string, Segment> = segments.reduce((acc, segment) => {
      acc[segment.id] = segment;
      return acc;
    }, {});
    const regionsData: Record<string, number> = {};
    const keys: string[] = Object.keys(userSegments);
    for (const segId of keys) {
      if (userSegments[Number.parseInt(segId)].effort_count > 0 && segmentsObj[segId] != undefined) {
        const reg: string = segmentsObj[segId].region
        if (regionsData[reg] == undefined) {
          regionsData[reg] = 0;
        }
        regionsData[reg]++;
      }
    }
    return regionsData;
  }

  const regionsData = calcNumberOfCheckedSegmentsPerRegion(segments, userSegments);

  return (
    <div className="w-full space-y-4">
      <Input
        placeholder="Filter segments..."
        value={(columnFilters.find((filter) => filter.id === 'name')?.value as string) ?? ''}
        onChange={(event) =>
          setColumnFilters([
            { id: 'name', value: event.target.value },
          ])
        }
        className="max-w-sm"
      />
      {Object.entries(segmentsByRegion).map(([region, regionSegments]) => (
        <div key={region} className='shadow-lg rounded-lg border'>
          <Collapsible
            key={region}
            open={openSections[region]}
            onOpenChange={() => toggleSection(region)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-left cursor-pointer w-full justify-start bg-white text-gray-900 hover:text-white hover:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">
                {openSections[region] ? (
                  <ChevronDown className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                {region}
                &nbsp;(
                {
                  Object.entries(userSegments).length ? ((regionsData[region] ? regionsData[region] : 0) + " of " + regionSegments.length + " done")
                    : (regionSegments.length + " segment" + (regionSegments.length > 1 && "s" || ""))
                }
                )
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <DataTable
                columns={columns}
                data={regionSegments}
                sorting={sorting}
                onSortingChange={setSorting}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  )
}