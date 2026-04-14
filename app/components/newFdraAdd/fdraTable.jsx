'use client';
import { useState, useEffect } from 'react';
import { deleteFdra } from '../../actions/fdraActions';
import { useRefresh } from '../contexts/refreshContext.jsx'; //for delete
//table for fdras and relationships


export default function FdraTable({ fdras, dispatchAreas, onRefresh }) {
    const [deletingId, setDeletingId] = useState(null); // Track which FDRA is being deleted
    const [delError, setDelError] = useState('');
    const { refreshFlag, triggerRefresh } = useRefresh(); // For refreshing after deletion

    //fx to get name-id values
    const getDispatchAreaName = (dispatchId) => {
        if (!dispatchAreas || dispatchAreas.length === 0) return 'Loading...';
        
        // debug checks structure
        console.log('Looking for dispatch ID:', dispatchId);
        console.log('Available dispatch areas:', dispatchAreas);
        
        // dispatchAreas data structure might be different
        const area = dispatchAreas.find((a) => {
            // Try different possible key names
            return a.Dispatch_ID === dispatchId || 
                a.id === dispatchId || 
                a.dispatch_id === dispatchId;
        });
        
        console.log('Found area:', area);
        
        // Try different possible name fields
        return area?.DispatchName || area?.name || area?.DispatchAreaName || 'Unknown Area';
    };

    const handleDelete = async (fdraId, fdraName) => {
        // Confirm deletion with user
        const userConfirm = confirm(`Are you sure you want to delete FDRA "${fdraName}"? This action will only work if there are no stations assigned to this FDRA This action cannot be undone.`);
        if (!userConfirm) return;

        setDeletingId(fdraId);
        setDelError('');
        try {
            const result = await deleteFdra(fdraId);
            if (result.success) {
                onRefresh(); // Refresh the table after deletion
                triggerRefresh(); // Refresh the entire page to update data across components
            } else {
                setDelError(result.error || 'Failed to delete FDRA');

                setTimeout(() => setDelError(''), 5000); // Clear error after 5 seconds
            }
        } catch (err) {
            console.error('Delete error:', err);
            setDelError('An error occurred while deleting the FDRA');
            setTimeout(() => setDelError(''), 5000); // Clear error after 5 seconds
        } finally {
            setDeletingId(null);
        }

    };

    //msg if no fdras(should not happen but just in case)
    if (!fdras || fdras.length === 0) {
        return <p>No FDRAs found.</p>;
    }

    return (
        <div className="fdra-table-container">
            {/* Display delete error if any */}
            {delError && (
                <div className="error-message">
                    {delError}
                </div>
            )}
            
            <table className="fdra-table">
                <thead>
                    <tr>
                        <th>FDRA Name</th>
                        <th>Fuel Model</th>
                        <th>Dispatch Area</th>
                        <th>Avg ERC</th>
                        <th>Avg BI</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fdras.map((fdra) => (
                        <tr key={fdra.FDRA_ID}>
                            <td className="fdra-name">
                                {fdra.FDRAname}
                            </td>
                            <td className="fuel-model">
                                {fdra.Fuel_Model}
                            </td>
                            <td className="dispatch-area">
                                {getDispatchAreaName(fdra.Dispatch_ID)}
                            </td>
                            <td className="avg-erc">
                                {fdra.AVG_ERC !== null && fdra.AVG_ERC !== undefined ? fdra.AVG_ERC : 0}
                            </td>
                            <td className="avg-bi">
                                {fdra.AVG_BI !== null && fdra.AVG_BI !== undefined ? fdra.AVG_BI : 0}
                            </td>
                            <td className="actions">
                                <button
                                    onClick={() => handleDelete(fdra.FDRA_ID, fdra.FDRAname)}
                                    disabled={deletingId === fdra.FDRA_ID}
                                    className="delete-btn"
                                >
                                    {deletingId === fdra.FDRA_ID ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
