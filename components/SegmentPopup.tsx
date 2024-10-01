import React from 'react'

interface SegmentPopupProps {
    segment: {
        name: string
        distance: number
        average_grade: number
        maximum_grade: number
        total_elevation_gain: number
        city: string
        country: string
        elevation_profile: string
        xoms: {
            kom: number
            qom: number
        }
    }
}

function cleanCityName(city) {
    return city.replace('UK', '').replace(/,\s+?$/, '').trim();
}

export default function SegmentPopup({ segment }: SegmentPopupProps) {
    return (
        <div className="p-2 max-w-sm">
            <h3 className="text-lg font-bold mb-2">{segment.name}</h3>
            <p className="text-sm mb-1"><strong>Length:</strong> {segment.distance.toFixed(1)} m</p>
            <p className="text-sm mb-1"><strong>Avg Grade:</strong> {segment.average_grade.toFixed(1)}%</p>
            <p className="text-sm mb-1"><strong>Max Grade:</strong> {segment.maximum_grade.toFixed(1)}%</p>
            <p className="text-sm mb-1"><strong>Elevation Gain:</strong> {segment.total_elevation_gain.toFixed(1)} m</p>
            <p className="text-sm mb-1"><strong>Best Time:</strong> KOM: {segment.xoms.kom}, QOM: {segment.xoms.qom}</p>
            <p className="text-sm mb-1"><strong>Location:</strong> {[cleanCityName(segment.city || ''), segment.country].join(', ')}</p>
            <p className="text-sm mb-1"><img src={segment.elevation_profile} /></p>
        </div>
    )
}