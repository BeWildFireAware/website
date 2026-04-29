//preview data before input to database
import { set } from 'date-fns';
import { se } from 'date-fns/locale';
import { useState } from 'react'
/*
section to show preview of station data before confirming add to database
print station ID(provided by user), station name(from api), fuel model(provided by user), fdra(provided by user)
bullet list of records pulled for nfdr and weather apis
table to show sample of the data pulled for each api to confirm correctness
submit/cancel buttons to confirm or deny add to database after previewing data
*/




export default function StationPreview({ data, stationId, fuelModel, fdraId, onConfirm, onDeny }) 
{
    const [isWaiting, setIsWaiting] = useState(false); //loading state for buttons after confirm
    const handleConfirm = async () => 
    {
        console.log('preview to add with info:', { stationId, fuelModel, fdraId, stationData: data });
        setIsWaiting(true);
        try {
            // Call the parent's onConfirm function which will handle the edge function call
            console.log('Calling onConfirm with station info and data...');
            await onConfirm({ stationId, fuelModel, fdraId, stationData: data });
            console.log('Station added');
        } 
        catch (err) {
            console.error('Confirm error:', err);
        } 
        finally {
            setIsWaiting(false);
        }    
    };

    const handleCancel = () => {
        // Call the parent's onDeny function to clear the preview
        onDeny();
    };
//fx to display preview of station data before confirming add to database
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
            <div className="preview-actions">
                <button className="confirm-btn" onClick={handleConfirm} disabled={isWaiting}>Confirm Add to Database</button>
                <button className="cancel-btn" onClick={handleCancel} disabled={isWaiting}>Cancel</button>
            </div>

            
        </div>
    );
}