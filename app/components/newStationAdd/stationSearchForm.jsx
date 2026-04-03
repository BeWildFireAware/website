'use client'
//form for adding new station
import { stationSearch } from '../../actions/stationSearch.jsx'
import { useState, useEffect } from 'react'
import StationPreview from './previewStation.jsx'
import { addStationToDatabase, checkStationDataStatus } from '../../actions/addStation.jsx'  // <-- NEW: Added checkStationDataStatus

import { useRefresh } from '../contexts/refreshContext.jsx';


export default function StationSearchForm() {
    //state variables for form input loading state, data
    const [stationId, setStationId] = useState('');
    const [fuelModel, setFuelModel] = useState('Y'); //default Y (most common currently)
    const [fdraId, setFdraId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false); //loading state for adding station to database after preview confirmation
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [previewData, setPreviewData] = useState(null); //hold data preview for user confirmation before adding to db
    const [fdraOptions, setFdraOptions] = useState([]); //get fdra options from db to populate dropdown, set on page load with useEffect
    const [confirmMessage, setConfirmMessage] = useState(''); //message to user on succes or failure to add to db
    // States for background task tracking
    const [statusMessage, setStatusMessage] = useState('');
    const [addedStationId, setAddedStationId] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    //for entire page refresh on new data
    const {refreshFlag, triggerRefresh} = useRefresh(); //returns obj not array

    //get current fdra options to select from
    useEffect(() => {
        async function fetchFdraOptions() {
            try {
                // vetch server action for all fdras(get request)
                const response = await fetch('/api/fdra/options');
                const data = await response.json();
                if(Array.isArray(data)) {
                    setFdraOptions(data);
                }else{
                    console.error('Unexpected FDRA options format:', data);
                    setFdraOptions([]);
                }
                
            } catch (error) {
                console.error('Error fetching FDRA options:', error);
                setFdraOptions([]);
            }
        }

        fetchFdraOptions(); //call the fx save data to array
    }, [refreshFlag]); //refresh on any change

    
    // poll for station data status after addition(staion only) to see if it is working properly, background job
    useEffect(() => {
        if (!addedStationId) return;
        
        let pollInterval;
        let timeout;
        
        const checkStatus = async () => {
            setIsCheckingStatus(true); //disbale form while checking status
            console.log(`Polling status for station ${addedStationId}...`);
            
            const result = await checkStationDataStatus(addedStationId);
            console.log(`Poll result:`, result);
            
            // If the station is added and data, show success message and refresh
            if (result.success && result.hasData) {
                // Data imported successfully
                console.log(`Data found! ${result.recordCount} records are being loaded.`);
                setStatusMessage(`Historical data is being imported succesfully, ${result.recordCount} records loaded.`);
                setTimeout(() => {
                    setStatusMessage('');
                    setAddedStationId(null);
                    setIsCheckingStatus(false);
                    triggerRefresh();
                }, 5000);
                clearInterval(pollInterval);
                clearTimeout(timeout);
            } else if (!result.success) {

                // Error checking status log the actual error
                console.error(`Status check failed: ${result.error}`);
                setStatusMessage(`Could not verify data import: ${result.error}. The station was added, data may still be importing`);
                // Don't clear immediately wait and try again
                // Keep polling for a bit longer
            } else if (!result.hasData) {
                // No data yet, keep waiting
                console.log(`No data yet for station ${addedStationId}...`);
            }
        };
        
        // Poll every 3 seconds for up to 60 seconds -takes 4-15 seconds usually
        pollInterval = setInterval(checkStatus, 3000);
        timeout = setTimeout(() => {
            console.log(`Timeout reached for station ${addedStationId}`);
            setStatusMessage(`Data import is taking longer than expected.`);
            setTimeout(() => setStatusMessage(''), 10000);
            clearInterval(pollInterval);
            setAddedStationId(null);
            setIsCheckingStatus(false);
        }, 60000); // 60 second timeout
        
        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [addedStationId, triggerRefresh]);

    async function handleSubmit(event) {
        event.preventDefault();
        
        if(!stationId.trim()) {
            setError('Station ID is required');
            return;
        }
        if(!fdraId) {
            setError('Please select an FDRA');
            return;
        }
        setError('');
        setIsLoading(true); //show loading state 
        setSearchResult(null);
        setPreviewData(null); //clear previous data on new searches
        setConfirmMessage(''); //clear previous messages on new searches
        try {
            const formData = new FormData();
            formData.append('stationId', stationId);
            formData.append('fuelModel', fuelModel);
            formData.append('fdraId', fdraId);
            const result = await stationSearch(formData);
            if(result.error) {
                setError(result.error);
                setPreviewData(null); //no data on error
            } else if(result.exists) {
                setSearchResult({ message: `Station ${stationId} found in Database`, exists: true}); //return already exists
                
            }else if (result.preview) {
                setPreviewData(result.preview); //return preview data for user confirmation before adding to db
                setSearchResult({ message: `Station ${stationId} data preview available`, exists: false });//doesnt exists in db

            }
        } catch (err) {
            setError('An error occurred while searching for the station');
            console.error('Station search error:', err);
        } finally {
            setIsLoading(false); //stop loading after any result
        }

    } 
    const handleConfirm = async (stationInfo) => {
        console.log('User confirmed station add with info:', stationInfo);
        setIsAdding(true); //show adding state after user confirms preview, while waiting for edge fx
        setError(''); //clear any previous errors
        setConfirmMessage(''); //clear any previous messages
        setStatusMessage(''); // Clear status message
        try{
            const result = await addStationToDatabase ({
                stationId: stationInfo.stationId,
                fuelModel: stationInfo.fuelModel,
                fdraId: stationInfo.fdraId,
                stationName: stationInfo.stationData.stationName
            });
            console.log('Result from addStationToDatabase:', result);
            if(result.error) {
                setError(result.error);
                setConfirmMessage('Error on adding station'); //clear success message on error
            } 
            else if(result.success)
            {
                setPreviewData(null); //clear preview on successful add
                setStationId(''); //clear form on successful add
                setFuelModel('Y'); //reset to default
                setFdraId('');
                setSearchResult(null);
                setError(''); //clear any previous errors
                //Show initial success message
                setConfirmMessage('Station added! Historical data import started...');
                
                //Start polling for data import
                setAddedStationId(result.stationId || stationInfo.stationId);
                setStatusMessage('Importing historical data from 2005 to present. This may take a while...');
                
                setTimeout(() => setConfirmMessage(''), 3000);
            }
            
        }catch(error){
            setError(error.message || 'An error occurred while adding the station to the database');
            setConfirmMessage('Error on adding station'); 
        } 
        finally {
            setIsAdding(false); //adding complete
        }   
    };

    const handleDeny = () => {
        setPreviewData(null); //clear preview and return to search form for new search
        setSearchResult(null);
        setError("");
        setConfirmMessage('');
        setStatusMessage(''); 
        setAddedStationId(null); 
    };
    return (
        <div className="station-search-container">
        <form onSubmit={handleSubmit} className="station-search-form">
            <div>
                <label>Station ID:</label>
                <input
                    type="text"
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    placeholder="Enter Station ID"
                    disabled={isLoading || isAdding || isCheckingStatus} 
                />
            </div>
            <div>
                <label>Fuel Model:</label>
                <select 
                    value={fuelModel}
                    onChange={(e) => setFuelModel(e.target.value)}
                    disabled={isLoading || isAdding || isCheckingStatus} 
                >
                    <option value="V">V</option>
                    <option value="W">W</option>
                    <option value="X">X</option>
                    <option value="Y">Y</option>
                    <option value="Z">Z</option>
                </select>    
            </div>
            <div>
                <label>FDRA:</label>
                <select 
                    value={fdraId}
                    onChange={(e) => setFdraId(e.target.value)}
                    disabled={isLoading || isAdding || isCheckingStatus} // <-- NEW: Disable while checking status
                >
                    <option value="">Select an FDRA</option>
                    {fdraOptions.map(fdra => (
                        <option key={fdra.FDRA_ID} value={fdra.FDRA_ID}> 
                            {fdra.FDRAname}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" disabled={isLoading || isAdding || isCheckingStatus}> 
                {isLoading ? 'Searching...' : 'Search Station'}
            </button>
        </form> 
    
        
        {error && (
            <div className="add-station-error">
                <p className="text-red-500">{error}</p>
            </div>
        )}

        {searchResult && (
            <div className="station-search-result">
                <p>{searchResult.message}</p>
            </div>
        )} 
        {/*react components must be capitalized*/}
        {previewData && (     
            <StationPreview 
            data={previewData}
            stationId={stationId}
            fuelModel={fuelModel}
            fdraId={fdraId}
            onConfirm={handleConfirm}
            onDeny={handleDeny}
             /> 
        )}  

        {isAdding && (
            <div className="adding-station">
                <p>Adding station to database...</p>
            </div>
        )} 
        {confirmMessage && (
            <div className="confirm-message">
                <p>{confirmMessage}</p>
            </div>
        )}
        {/* Status message for background task */}
        {statusMessage && (
            <div className="status-message">
                <p>{statusMessage}</p>
            </div>
        )}
        {/* Loading indicator while checking status */}
        {isCheckingStatus && !statusMessage && (
            <div className="loading-status">
                <p>Checking data import status...</p>
            </div>
        )}
        </div>
    );
}