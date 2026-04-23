'use server';
//server actions for dispatch areas, called from dispatchAreaSearchForm.jsx
//calls supabase
//call supabase edge fx
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/dispatch-service`;

export async function addDispatchAreas(formData) {
    const name = formData.get('dispatchAreaName');
    const useBiVal = formData.get('useBi') // Convert string to boolean(if null then false)
    const useBi = useBiVal === 'true' || useBiVal === 'on'; //checkbox returns on
    if (!name || !name.trim()) {
        return { success: false, error: 'Dispatch area name cannot be empty' };
    }
    if (name.length < 2) {
        return { success: false, error: 'Dispatch area name must be at least 2 characters' };
    }
    if (name.length > 50) {
        return { success: false, error: 'Dispatch area name must be less than 50 characters' };
    }
    try{
        const response = await fetch(`${EDGE_FUNCTION_URL}`,{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY,
                'prefer': 'return=representation'
            },
            body: JSON.stringify({ action: 'add', DispatchName: name.trim(), UseBi: useBi }) //call this action from supabase index with these vals
            
                
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add dispatch area');
        }
        const result = await response.json();
        return { success: true, data: result.data, message: 'Dispatch area added successfully' };
    }
    catch(error){
        console.error('Error adding dispatch area:', error);
        return { success: false, error: error.message || 'Failed to add dispatch area' };
    }

}
export async function deleteDispatchAreas(dispatchId, dispatchName) { //leaving in dispatch name in case fx call uses name(backwards compatibility)
    if(!dispatchId) {
        return { success: false, error: 'Invalid dispatch area ID' };
    }
    
    try{
        //check if any dependencies(fdras)
        const response = await fetch(`${EDGE_FUNCTION_URL} `,{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ action: 'checkDependencies', Dispatch_ID: parseInt(dispatchId) }) //supabase action

        });
        const fdras = await response.json();
        if (fdras && fdras.length > 0) {
            return { success: false, error: 'Cannot delete dispatch area with existing dependencies' };
        }
        //if no dependencies, proceed to delete
        const deleteResponse = await fetch(`${EDGE_FUNCTION_URL} `,{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ action: 'delete', Dispatch_ID: parseInt(dispatchId) })
        });
        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.error || 'Failed to delete dispatch area');
        }
        return { success: true, message: 'Dispatch area deleted successfully' };

       
    }catch(error){
        console.error('Error deleting dispatch area:', error);
        return { success: false, error: error.message || 'Failed to delete dispatch area' };
    }    
}
export async function getDispatchAreas() {
    try{
        const response = await fetch(`${EDGE_FUNCTION_URL}?select=DispatchName,Dispatch_ID&order=DispatchName`,{
            method: "POST",
            headers: {
                'Content-Type' : 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ action: 'list' })  
        });
        if (!response.ok) {
            throw new Error('Failed to fetch dispatch areas');
        }
        const dispatchAreas = await response.json();
        return { success: true, data: dispatchAreas || []};
    } catch (error) {
        console.error('Error fetching dispatch areas:', error);
        return { success: false, data: [],error: error.message || 'Failed to fetch dispatch areas' };
    }
}
