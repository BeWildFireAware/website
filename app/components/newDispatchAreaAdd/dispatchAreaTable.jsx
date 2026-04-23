//table for dispatch areas
'use client';
import { useState, useEffect, use } from 'react';
import { getDispatchAreas, deleteDispatchAreas } from '../../actions/dispatchAreaActions';
import {useRefresh} from '../contexts/refreshContext.jsx'; //for delete and refresh after delete
import { set } from 'date-fns';

export default function DispatchAreaTable() {
    const [dispatchAreas, setDispatchAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { refreshFlag, triggerRefresh } = useRefresh(); // For refreshing after deletion
    const [deletingId, setDeletingId] = useState(null); // Track which dispatch area is being deleted
    const [delError, setDelError] = useState('');


//get areas for table
    const fetchDispatchAreas = async () => {
        setIsLoading(true);
        const result = await getDispatchAreas();
        if(result.success){
            setDispatchAreas(result.data);
        }else{
            setError('Failed to load dispatch areas');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDispatchAreas();
    }, [refreshFlag]); // Fetch dispatch areas when refresh flag changes

    const handleDelete = async (dispatchId, dispatchName) => {
        const userConfirm = confirm(`Are you sure you want to delete dispatch area "${dispatchName}"? This action will only work if there are no FDRAs`);
        if (!userConfirm) return;

        setDeletingId(dispatchId);
        setDelError('');

        try{
            const result = await deleteDispatchAreas(dispatchId, dispatchName);
            if(result.success){
                triggerRefresh(); // Refresh the page to show updated dispatch areas
            }else{
                setDelError(result.error || 'Failed to delete dispatch area');
                setTimeout(() => setDelError(''), 5000); // Clear error after 5 seconds
            }
        }catch(error){
            console.error('Error deleting dispatch area:', error);
            setDelError('An error occurred while deleting the dispatch area');
            setTimeout(() => setDelError(''), 5000); // Clear error after 5 seconds
        } finally{
            setDeletingId(null);
        }
    };

    if(isLoading && dispatchAreas.length === 0) {
        return <p>Loading dispatch areas...</p>;
    }
    if(dispatchAreas.length === 0) {
        return <p>No dispatch areas found. Please add a new dispatch area. or check database for error</p>;
    }

    return(
        <div className="dispatch-area-table-container">
            <h3>Dispatch Areas</h3>
            {delError && <p className="error-message">{delError}</p>}
            <table className="dispatch-area-table">
                <thead>
                    <tr>
                        <th>Dispatch Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dispatchAreas.map((area) => (
                        <tr key={area.Dispatch_ID}>
                            <td>{area.DispatchName}</td>
                            <td>
                                <button onClick={() => handleDelete(area.Dispatch_ID, area.DispatchName)}>
                                    {deletingId === area.Dispatch_ID ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}