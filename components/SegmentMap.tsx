'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import SegmentPopup from './SegmentPopup'
import ReactDOMServer from 'react-dom/server'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

interface Segment {
  id: number
  name: string
  distance: number
  average_grade: number
  maximum_grade: number
  total_elevation_gain: number
  city: string
  country: string
  start_latlng: [number, number]
  map: {
    polyline: string
  }
}

interface SegmentMapProps {
  segments: Segment[]
  selectedSegments: Record<number, boolean>
  userSegments: Record<number, { effort_count: number }>
  focusedSegment: Segment | null
}

export default function SegmentMap({ segments, selectedSegments, userSegments, focusedSegment }: SegmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef(new mapboxgl.Popup({ offset: 15 }));
  const segmentDefaultColor = "#FF8800";

  useEffect(() => {
    if (map.current) return // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: segments.length > 0 ? [segments[0].start_latlng[1], segments[0].start_latlng[0]] : [0, 0],
      zoom: 9
    })

    map.current.on('load', () => {
      segments.forEach((segment) => {
        map.current!.addSource(`segment-${segment.id}`, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {
              ...segment,
              description: ReactDOMServer.renderToString(<SegmentPopup segment={segment} />)
            },
            'geometry': {
              'type': 'LineString',
              'coordinates': decodePolyline(segment.map.polyline).map(([lat, lng]) => [lng, lat])
            }
          }
        })

        map.current!.addLayer({
          'id': `segment-${segment.id}`,
          'type': 'line',
          'source': `segment-${segment.id}`,
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': segmentDefaultColor,
            'line-width': 4
          }
        })

        // Change cursor to pointer when hovering over a segment
        map.current!.on('mouseenter', `segment-${segment.id}`, () => {
          map.current!.getCanvas().style.cursor = 'pointer'
        })

        // Change cursor back when leaving a segment
        map.current!.on('mouseleave', `segment-${segment.id}`, () => {
          map.current!.getCanvas().style.cursor = ''
        })

        // Show popup on hover
        map.current!.on('mousemove', `segment-${segment.id}`, (e) => {
          if (e.features.length > 0) {
            const coordinates = e.lngLat
            const description = e.features[0].properties.description

            popupRef.current
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map.current!)
          }
        })

        // Hide popup when leaving a segment
        map.current!.on('mouseleave', `segment-${segment.id}`, () => {
          popupRef.current.remove()
        })
      })
    })
  }, [segments])

  useEffect(() => {
    if (!map.current) return

    segments.forEach((segment) => {
      if (map.current!.getLayer(`segment-${segment.id}`)) {
        let color = segmentDefaultColor // default color

        if (selectedSegments[segment.id]) {
          color = '#FFA500' // orange for selected segments
        }

        if (userSegments[segment.id] && userSegments[segment.id].effort_count > 0) {
          color = '#4CAF50' // green for completed segments
        }

        map.current!.setPaintProperty(`segment-${segment.id}`, 'line-color', color)
      }
    })
  }, [segments, selectedSegments, userSegments])

  useEffect(() => {
    if (!map.current || !focusedSegment) return

    const coordinates = decodePolyline(focusedSegment.map.polyline)
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend([coord[1], coord[0]])
    }, new mapboxgl.LngLatBounds([coordinates[0][1], coordinates[0][0]], [coordinates[0][1], coordinates[0][0]]))

    map.current.fitBounds(bounds, {
      padding: 150,
      duration: 1000
    })

    // Highlight the focused segment
    map.current.setPaintProperty(`segment-${focusedSegment.id}`, 'line-color', '#FF0000')
    map.current.setPaintProperty(`segment-${focusedSegment.id}`, 'line-width', 6)

    // Show popup for the focused segment
    const popupContent = ReactDOMServer.renderToString(<SegmentPopup segment={focusedSegment} />)
    const popupCoordinates = coordinates[Math.floor(coordinates.length / 2)]
    
    popupRef.current
      .setLngLat([popupCoordinates[1], popupCoordinates[0]])
      .setHTML(popupContent)
      .addTo(map.current)

    // Clean up function to reset the segment style when focus changes
    return () => {
      if (map.current!.getLayer(`segment-${focusedSegment.id}`)) {
        map.current!.setPaintProperty(`segment-${focusedSegment.id}`, 'line-color', '#888')
        map.current!.setPaintProperty(`segment-${focusedSegment.id}`, 'line-width', 4)
      }
      popupRef.current.remove()
    }
  }, [focusedSegment])

  return (
    <div ref={mapContainer} className="h-full" />
  )
}

function decodePolyline(str: string, precision = 5) {
  let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision || 5)

  while (index < str.length) {
    byte = null
    shift = 0
    result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1))

    shift = result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1))

    lat += latitude_change
    lng += longitude_change

    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}