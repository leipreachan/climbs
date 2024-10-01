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

export default function SegmentTable({
  segments,
  selectedSegments,
  onSegmentCheck,
  onSegmentFocus,
  onCheckUserResults
}) {
  if (segments.length === 0) {
    return <div>No segments available.</div>
  }

  return (
    <div>
      <Table class="text-left w-full">
        <TableHeader class="bg-slate-300 flex w-full">
          <TableRow class="flex w-full">
            <TableHead class="p-4 w-2/12">Select</TableHead>
            <TableHead class="p-4 w-6/12">Name</TableHead>
            <TableHead class="p-4 w-4/12">Length</TableHead>
            <TableHead class="p-4 w-4/12">Avg Grade</TableHead>
            <TableHead class="p-4 w-4/12">Max Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="bg-grey-light flex flex-col items-center justify-between overflow-y-scroll w-full h-[72vh]">
          {segments.map((segment) => (
            <TableRow class="flex w-full mb-4" key={segment.id}>
              <TableCell class="p-4 w-2/12">
                <Checkbox
                  checked={selectedSegments[segment.id] || false}
                  onCheckedChange={() => onSegmentCheck(segment.id)}
                />
              </TableCell>
              <TableCell class="p-4 w-6/12">
                <span
                  onClick={() => onSegmentFocus(segment)}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                >
                  {segment.name}
                </span>
              </TableCell>
              <TableCell class="p-4 w-4/12">{segment.distance.toFixed(1)}m</TableCell>
              <TableCell class="p-4 w-4/12">{segment.average_grade.toFixed(1)}%</TableCell>
              <TableCell class="p-4 w-4/12">{segment.maximum_grade.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onCheckUserResults} className="mt-4">
        Connect to Strava and check segments against my progress
      </Button>
    </div>
  )
}