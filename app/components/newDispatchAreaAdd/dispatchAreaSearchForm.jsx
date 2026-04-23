//this component renders the form for adding a new dispatch area, imported into the add data page
'use client'
import { useState, useEffect } from 'react'
import { getDispatchAreas, addDispatchAreas } from '../../actions/dispatchAreaActions'
import { useRefresh } from '../contexts/refreshContext.jsx'; //for entire page refresh on user input
import { set } from 'date-fns';


export default function DispatchAreaSearchForm(){
    const [dispatchName, setDispatchName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [useBi, setUseBi] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {refreshFlag, triggerRefresh} = useRefresh();

    //on submit validate input then call server action
    async function handleSubmit(event) {
        event.preventDefault();
        
        if(!dispatchName.trim()) {
            setError('Dispatch area name is required');
            return;
        }
        if(dispatchName.length > 50) {
            setError('Dispatch area name must be less than 50 characters');
            return;
        }
        if(dispatchName.length < 2){
            setError('Dispatch area name must be at least 2 characters');
            return;
        }

        setError('');
        setMessage("")
        setIsLoading(true);
        //call server action
        try {
            const formData = new FormData();
            formData.append('dispatchAreaName', dispatchName);
            formData.append('useBi', useBi);
            const result = await addDispatchAreas(formData);

            if(result.success){
                setMessage(result.message || 'Dispatch area added successfully');
                setDispatchName('');
                triggerRefresh(); // Refresh the page to show new dispatch area in table
                setTimeout(() => setMessage(''), 5000); // Clear success message after 5 seconds
            }
            else{// err
                setError(result.error || 'Failed to add dispatch area');
                setTimeout(() => setError(''), 5000); // Clear error message after 5 seconds
            }


        }catch(error){
            console.error('Error adding dispatch area:', error);
            setError('An error occurred while adding the dispatch area');
            setTimeout(() => setError(''), 5000); // Clear error message after 5 seconds
        } finally{
            setIsLoading(false);
        }
    }  

    //form
    return (
        <div className="dispatch-area-form-container">
            <form onSubmit={handleSubmit} className="dispatch-area-form">
                <div className= "form-group">
                    <label htmlFor="dispatchName">Dispatch Area Name:</label>
                    <input 
                        type="text"
                        id="dispatchName"
                        value={dispatchName}
                        onChange={(e) => setDispatchName(e.target.value)}
                        placeholder="Enter dispatch area name"
                    />
                    
                    <label htmlFor="useBi">
                        <input 
                            type="checkbox"
                            id="useBi"
                            checked={useBi}
                            onChange={(e) => setUseBi(e.target.checked)}
                        />
                        use BI+ERC: 
                    </label> 
                    <small> if checked this area will use ERC+BI to calculate breakpoints</small>
                </div>
                

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Dispatch Area'}
                </button>
            </form>
        </div>
    );
}
          