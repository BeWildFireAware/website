//preview data before input to database
import {useState} from 'react'

export default function StationPreview({data, stationId, fuelModel, fdraId}) {
    return (
        <div className="station-preview">
            <h3>Station Preview</h3>
            <p><strong>Station ID:</strong> {stationId} ({data.stationName})</p>
            <p><strong>Fuel Model:</strong> {fuelModel}</p>
            <p><strong>FDRA:</strong> {fdraId}</p>
            <h4>Preview Data:</h4>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}