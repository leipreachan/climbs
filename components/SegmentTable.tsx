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
                  onCheckedChange={() => onSegmentCheck(segment.id)}
                />
              </TableCell>
              <TableCell>
                <span
                  onClick={() => onSegmentFocus(segment)}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                >
                  {segment.name}
                </span>
              </TableCell>
              <TableCell>{segment.distance.toFixed(1)}</TableCell>
              <TableCell>{segment.average_grade.toFixed(1)}</TableCell>
              <TableCell>{segment.maximum_grade.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onCheckUserResults} className="mt-4">
        Check my results
      </Button>
    </div>
  )
}