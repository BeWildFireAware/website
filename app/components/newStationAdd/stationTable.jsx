//station table component for listing stations and changing their FDRA associations
'use client';
import { useState, useEffect } from 'react';
import { getAllStations, updateStationFdra } from '@/app/actions/addStation';
import { useRefresh } from '../contexts/refreshContext';

export default function StationTable() {
    const [stations, setStations] = useState([]);
    const [fdras, setFdras] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null); // Track which station is being updated
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { refreshFlag, triggerRefresh } = useRefresh();

    // Fetch FDRAs for dropdown
    useEffect(() => {
        async function fetchFdras() {
            try {
                const response = await fetch('/api/fdra/options');
                const data = await response.json();
                setFdras(data);
            } catch (error) {
                console.error('Error fetching FDRAs:', error);
            }
        }
        fetchFdras();
    }, [refreshFlag]); //refresh when flag chagnes

    //fetch stations helper fx
    const fetchStations = async () => {
        setIsLoading(true);
        const result = await getAllStations();
        if (result.success) {
            setStations(result.data);
        } else {
            setError('Failed to load stations');
        }
        setIsLoading(false); //turn off loading state after fetch completes
    };

    useEffect(() => {
        fetchStations();
    }, [refreshFlag]); //caller for fetch stations fx

    // Handle FDRA update for a station
    const handleFdraChange = async (stationId, newFdraId) => {
        if (!newFdraId) return;
        
        setUpdatingId(stationId);
        setError('');
        setSuccessMessage('');
        
        try {
            const result = await updateStationFdra(stationId, newFdraId);
            
            if (result.success) {
                setSuccessMessage(result.message);
                triggerRefresh(); // Refresh the page
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(result.error);
                setTimeout(() => setError(''), 5000);
            }
        } catch (err) {
            setError('An error occurred while updating the station');
            setTimeout(() => setError(''), 5000);
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading && stations.length === 0) { //waiting for data
        return <div className="loading">Loading stations...</div>;
    }

    if (stations.length === 0) { //after waiting if still no data, show me
        return <div className="no-data">No stations found.</div>;
    }

    return (
        <div className="station-table-container">
            <h3>Stations</h3>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
            
            <table className="station-table">
                <thead>
                    <tr>
                        <th>Station Name</th>
                        <th>FDRA</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stations.map((station) => (
                        <tr key={station.ID}>
                            <td className="station-name">
                                {station.Station_Name}
                            </td>
                            <td className="station-fdra">
                                {updatingId === station.ID ? (
                                    <select
                                        defaultValue={station.FDRA_ID}
                                        onChange={(e) => handleFdraChange(station.ID, e.target.value)}
                                        className="fdra-select"
                                        autoFocus
                                    >
                                        {fdras.map((fdra) => (
                                            <option key={fdra.FDRA_ID} value={fdra.FDRA_ID}>
                                                {fdra.FDRAname}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="fdra-name">
                                        {station.FDRAname || 'Unknown'}
                                    </span>
                                )}
                            </td>
                            <td className="station-actions">
                                {updatingId === station.ID ? (
                                    <button
                                        onClick={() => setUpdatingId(null)}
                                        className="cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setUpdatingId(station.ID)}
                                        className="edit-btn"
                                    >
                                        Change FDRA
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}