'use client';
import { getFdraOptions, getBreakpoints, updateBreakpoints} from '@/app/actions/breakpointActions.jsx';
import { useState, useEffect } from 'react';
import ErcTable from './ercTable.jsx';
import ErcBiTable from './ercBiTable.jsx';
import { set } from 'date-fns';
import { se } from 'date-fns/locale';

const DANGER_LEVELS = ['Low', 'Moderate', 'High', 'Very High', 'Extreme'];

export default function BreakpointTable() {
    const [breakpoints, setBreakpoints] = useState([]);
    const [fdraOptions, setFdraOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [useBi, setUseBi] = useState(false); // State to toggle between tables
    const [selectedFdra, setSelectedFdra] = useState(''); // State to track selected FDRA for editing
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [saving, setSaving] = useState(false); // State to track if save is in progress

    //group by dispatch area for dropdowns
    const groupedFdras = fdraOptions.reduce((acc, fdra) => {
        const dispatchArea = fdra.DispatchName || 'Unassigned';
        if (!acc[dispatchArea]) {
            acc[dispatchArea] = [];
        }
        acc[dispatchArea].push(fdra);
        return acc;
    }, {});

    //setup for tables, fetch data
    useEffect(() => {
        getFdraOptions().then(result => {
            if(Array.isArray(result) && result.length > 0){
                setFdraOptions(result);
                setError('');
            } else {
                console.error('Failed to load FDRA options:', result.error);
                setFdraOptions([]);
                setError(result.error);
            }
        }).catch(error => {
            console.error('Error fetching FDRA options:', error);
            setFdraOptions([]);
            setError('Failed to load FDRA options');
        });
    }, []);

    useEffect(() => {
        if(!selectedFdra){
            setBreakpoints([]);
            return;
        }
        setIsLoading(true);
        getBreakpoints(selectedFdra).then(result => {
            if(result && typeof result.useBi === 'boolean' && Array.isArray(result.breakpoints)){ //make sure usebi is a boolean andbreakpointsis an array
                setUseBi(result.useBi);
                setBreakpoints(result.breakpoints);
                setError('');
            }else{
                setBreakpoints([]); 
                console.error('Failed to load breakpoints:', result.error);
                setError(result.error || 'Failed to load breakpoints');
            } 
        }).catch(error => {
            console.error('Error fetching breakpoints:', error);
            setBreakpoints([]);
            setError('Failed to load breakpoints');
        }).finally(() => {
            setIsLoading(false);
        });
    }, [selectedFdra]);

    const handleUpdate = async () => {
        setSaving(true);
        setError('');
        setSuccessMessage('');
        try{
            const result = await updateBreakpoints(selectedFdra, breakpoints);
            if(result.success){
                setSuccessMessage('Breakpoints updated successfully');
                // Optionally, you can refetch breakpoints here to ensure data is up-to-date
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('An error occurred while updating breakpoints.');
        } finally {
            setSaving(false);

        }
    };
    
    const updateBreakpoint = (index, field, value) => {
        const updatedBreakpoints = [...breakpoints];
        updatedBreakpoints[index] = { ...updatedBreakpoints[index], [field]: parseFloat(value) || 0 };
        setBreakpoints(updatedBreakpoints);
    };

    return (
        <div>
            <div className='breakpointHeader'>
                <label>Select FDRA:</label>
                <select value={selectedFdra} onChange={(e) => setSelectedFdra(e.target.value)}>
                    <option value={''}>-- Select FDRA --</option>
                    {Object.entries(groupedFdras).map(([dispatchArea, fdras]) => (
                        <optgroup key={dispatchArea} label={dispatchArea}>
                            {fdras.map((fdra) => (
                                <option key={fdra.FDRA_ID} value={fdra.FDRA_ID}>
                                    {fdra.FDRAname} (Fuel: {fdra.Fuel_Model})
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
            {isLoading && !selectedFdra && <p>No Fdra Selected please select one from the dropdown</p>}

            {error && <div className="error-message">{error}</div>}
            
            {!isLoading && selectedFdra && breakpoints.length > 0 && (
                <>
                    {!useBi ? (
                        <ErcTable breakpoints={breakpoints} dangerLevels={DANGER_LEVELS} onChange={updateBreakpoint} />
                    ) : (
                        <ErcBiTable breakpoints={breakpoints} dangerLevels={DANGER_LEVELS} onChange={updateBreakpoint} />
                    )}
                    <div className="save-button-container">
                        <button onClick={handleUpdate} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        {successMessage && <div className="success-message">{successMessage}</div>}
                    </div>
                </>
            )}
            {!isLoading && selectedFdra && breakpoints.length === 0 && (
                <p>No breakpoints found for the selected FDRA.</p>
            )}
        </div>
    );

}    
