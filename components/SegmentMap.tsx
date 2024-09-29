'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function SegmentMap({ segments, selectedSegments, userSegments }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const popupRef = useRef(new mapboxgl.Popup({ offset: 15 }))

  useEffect(() => {
    if (map.current) return // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [segments[0].start_latlng[1], segments[0].start_latlng[0]],
      zoom: 9
    })

    map.current.on('load', () => {
      segments.forEach((segment) => {
        map.current.addSource(`segment-${segment.id}`, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {
              ...segment,
              description: createPopupHTML(segment)
            },
            'geometry': {
              'type': 'LineString',
              'coordinates': decodePolyline(segment.map.polyline).map(([lat, lng]) => [lng, lat])
            }
          }
        })

        map.current.addLayer({
          'id': `segment-${segment.id}`,
          'type': 'line',
          'source': `segment-${segment.id}`,
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#FF6600',
            'line-width': 4
          }
        })

        // Change cursor to pointer when hovering over a segment
        map.current.on('mouseenter', `segment-${segment.id}`, () => {
          map.current.getCanvas().style.cursor = 'pointer'
        })

        // Change cursor back when leaving a segment
        map.current.on('mouseleave', `segment-${segment.id}`, () => {
          map.current.getCanvas().style.cursor = ''
        })

        // Show popup on hover
        map.current.on('mousemove', `segment-${segment.id}`, (e) => {
          if (e.features.length > 0) {
            const coordinates = e.lngLat
            const description = e.features[0].properties.description

            popupRef.current
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map.current)
          }
        })

        // Hide popup when leaving a segment
        map.current.on('mouseleave', `segment-${segment.id}`, () => {
          popupRef.current.remove()
        })
      })
    })
  }, [segments])

  useEffect(() => {
    if (!map.current) return

    segments.forEach((segment) => {
      if (map.current.getLayer(`segment-${segment.id}`)) {
        let color = '#888' // default color

        if (selectedSegments[segment.id]) {
          color = '#FFA500' // orange for selected segments
        }

        if (userSegments[segment.id] && userSegments[segment.id].effort_count > 0) {
          color = '#4CAF50' // green for completed segments
        }

        map.current.setPaintProperty(`segment-${segment.id}`, 'line-color', color)
      }
    })
  }, [segments, selectedSegments, userSegments])

  return (
    <div ref={mapContainer} className="h-full" />
  )
}

function createPopupHTML(segment) {
  return `
    <div class="p-2 max-w-sm">
      <h3 class="text-lg font-bold mb-2">${segment.name}</h3>
      <p class="text-sm mb-1"><strong>Distance:</strong> ${segment.distance.toFixed(1)} m</p>
      <p class="text-sm mb-1"><strong>Avg Grade:</strong> ${segment.average_grade.toFixed(1)}%</p>
      <p class="text-sm mb-1"><strong>Max Grade:</strong> ${segment.maximum_grade.toFixed(1)}%</p>
      <p class="text-sm mb-1"><strong>Elevation Gain:</strong> ${segment.total_elevation_gain.toFixed(1)} m</p>
      <p class="text-sm mb-1"><strong>City:</strong> ${segment.city}</p>
      <p class="text-sm"><strong>Country:</strong> ${segment.country}</p>
    </div>
  `
}

// Helper function to decode polyline
function decodePolyline(str, precision = 5) {
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