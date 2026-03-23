//preview data before input to database
import { useState } from 'react'

export default function StationPreview({ data, stationId, fuelModel, fdraId }) {
    return (
        <div className="station-preview">
            <h3>Station Preview</h3>
            <p><strong>Station ID:</strong> {stationId} ({data.stationName})</p>
            <p><strong>Fuel Model:</strong> {fuelModel}</p>
            <p><strong>FDRA:</strong> {fdraId}</p>
            
            <h4>Data Summary:</h4>
            <ul>
                <li>NFDR Records: {data.stats?.nfdrRecords || 0}</li>
                <li>Weather Records: {data.stats?.weatherRecords || 0}</li>
            </ul>
            
            {data.nfdrSample && data.nfdrSample.length > 0 && (
                <>
                    <h4>NFDR Sample Data (Last 3 days):</h4>
                    <table className="preview-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>ERC</th>
                                <th>BI</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.nfdrSample.map((record, idx) => (
                                <tr key={idx}>
                                    <td>{record.observationTime}</td>
                                    <td>{record.erc ?? 'N/A'}</td>
                                    <td>{record.bi ?? 'N/A'}</td>
                                    <td>{record.nfdrType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
            
            {data.weatherSample && data.weatherSample.length > 0 && (
                <>
                    <h4>Weather Sample Data (Last 3 days):</h4>
                    <table className="preview-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Temp Min</th>
                                <th>Temp Max</th>
                                <th>Precip (in)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.weatherSample.map((record, idx) => (
                                <tr key={idx}>
                                    <td>{record.date}</td>
                                    <td>{record.tempMin ?? 'N/A'}</td>
                                    <td>{record.tempMax ?? 'N/A'}</td>
                                    <td>{record.precipitation ?? 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}