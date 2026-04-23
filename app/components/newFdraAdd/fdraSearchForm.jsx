// form to add new fdra, also display table of existing relationships, with refresh on add, delete, and update
'use client';
import { useState, useEffect } from 'react';
import { addFdra, getDispatchAreas, getFdras } from '@/app/actions/fdraActions';
import FdraTable from './fdraTable'; //in current dir
import { useRefresh } from '../contexts/refreshContext.jsx';
import { refresh } from 'next/cache';

//create form for user to add, also display table of existing relationships

export default function FdraSearchForm() {
    //data states
    const [fdraName, setFdraName] = useState('');
    const [dispatchAreaId, setDispatchAreaId] = useState('');
    const [dispatchAreas, setDispatchAreas] = useState([]);
    const [fdras, setFdras] = useState([]);
    const [fuelModel, setFuelModel] = useState('Y');  // Default to Y
    
    // ui states, display msg, show loading
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); //loading state for form submission
    const [isRefreshing, setIsRefreshing] = useState(false); //on table refresh

    //entire page refresh on new data
    const {refreshFlag, triggerRefresh} = useRefresh(); //obj not array

    // Fetch Dispatch Areas (for dropdown), name only in dispatch areas not fdras
    useEffect(() => {
        async function fetchDispatchAreas() {
            const result = await getDispatchAreas();
            console.log('Raw dispatch areas response:', result);
            if (result.success) {
                console.log('First item keys:', result.data[0] ? Object.keys(result.data[0]) : 'No data');
                setDispatchAreas(result.data);

            } else {
                setError('Failed to load dispatch areas');
            }
        }
        fetchDispatchAreas();
    }, [refreshFlag]); // Refresh when refreshFlag changes

    // Fetch FDRAs for table display, refresh
    const refreshFdras = async () => {
        setIsRefreshing(true);
        const result = await getFdras();
        if (result.success) {
            setFdras(result.data);
        } else {
            setError('Failed to load FDRAs');
        }
        setIsRefreshing(false);
    };

    useEffect(() => {
        refreshFdras();
    }, [refreshFlag]); // Refresh when refreshFlag changes

    // Handle form submission to add new FDRA
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Client-side validation, more in edge fx

        if (!fdraName.trim()) {
            setError('FDRA name cannot be empty');
            return;
        }
        //prevent abnormal and mistake inputs
        if (fdraName.length < 2) {
            setError('FDRA name must be at least 2 characters');
            return;
        }
        if (fdraName.length > 50) { //name should not be extemely long, can adjust
            setError('FDRA name must be less than 50 characters');
            return;
        }
        if (!dispatchAreaId) {
            setError('Please select a dispatch area');
            return;
        }

        // Clear previous messages
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            // if valid passes create frm data and add user input to send to server
            const formData = new FormData();
            formData.append('fdraName', fdraName);
            formData.append('dispatchAreaId', dispatchAreaId);
            formData.append('fuelModel', fuelModel);
            const result = await addFdra(formData);
            
            if (result.success) {
                setMessage(`${result.data?.FDRAname || fdraName} added successfully`);
                // Clear form
                setFdraName('');
                setDispatchAreaId('');

                triggerRefresh(); // Refresh the entire page to update data across components

                // Refresh the table
                refreshFdras();
                // Auto clear success message after 5 seconds
                setTimeout(() => setMessage(''), 5000);
            } else {
                setError(result.error || 'Failed to add FDRA');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while adding FDRA');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fdra-search-form">
            
            <div className="add-fdra-section">
                
                
                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fdraName">FDRA Name:</label>
                        <input
                            id="fdraName"
                            type="text"
                            value={fdraName}
                            onChange={(e) => setFdraName(e.target.value)}
                            placeholder="Enter FDRA name (e.g., Northern Rockies)"
                            disabled={isLoading}
                        />
                        <small>Minimum 2 characters, maximum 50 characters</small>
                        <select
                            id="fuelModel"
                            value={fuelModel}
                            onChange={(e) => setFuelModel(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="V">V</option>
                            <option value="W">W</option>
                            <option value="X">X</option>
                            <option value="Y">Y</option>
                            <option value="Z">Z</option>
                        </select>
                        <small>Fuel model determines NFDRS fire danger data</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="dispatchArea">Dispatch Area:</label>
                        <select
                            id="dispatchArea"
                            value={dispatchAreaId}
                            onChange={(e) => setDispatchAreaId(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">Select a dispatch area</option>
                            {dispatchAreas.map((area) => (
                                <option key={area.Dispatch_ID} value={area.Dispatch_ID}>
                                    {area.DispatchAreaName || area.name || area.DispatchName || 'Unknown Area'}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add FDRA'}
                    </button>
                </form>
            </div>
            
            {/* FDRAs Table show existing FDRA-dispatch with Delete buttons */}
            <div className="fdras-section">
                <div className="fdras-header">
                    <h3>Existing FDRAs</h3>
                    <button 
                        onClick={refreshFdras} 
                        disabled={isRefreshing}
                        className="refresh-btn"
                    >
                        {isRefreshing ? 'Refreshing...' : 'Refresh List'}
                    </button>
                </div>
                
                <FdraTable 
                    fdras={fdras} 
                    dispatchAreas={dispatchAreas}
                    onRefresh={refreshFdras}
                />
            </div>
        </div>
    );
}