//server actions for fdra management(create delete, list)
'use server';

//file that calls edge function
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fdra-service`;

//get all fdras for display
export async function getFdras() {
    try {
        
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({ action: 'list' })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch FDRAs');
        }
        return { success: true, data: data };
    } catch (error) {
        console.error('Error fetching FDRAs:', error);
        return { success: false, error: 'Failed to fetch FDRAs' };
    }
}
//add fdra, send to edge fx, edge fx adds to db, returns success fail
export async function addFdra(formData) {
    try {
        //get vals to send to edge fx
        const fdraName = formData.get('fdraName');
        const dispatchAreaId = formData.get('dispatchAreaId');
        const fuelModel = formData.get('fuelModel'); //get fuel model


        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'add', FDRAname: fdraName, Dispatch_ID: parseInt(dispatchAreaId, 10), FuelModel: fuelModel })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add Fdra');
        }
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error adding Fdra:', error);
        return { success: false, error: 'Failed to add Fdra' };
    }
}
//get dispatch areas for dropdown in add fdra form
export async function getDispatchAreas() {
    try {
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'dispatchAreas' })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch dispatch areas');
        }
        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching dispatch areas:', error);
        return { success: false, error: 'Failed to fetch dispatch areas' };
    }
}
//delete fdra if no stations assigned
export async function deleteFdra(fdraId) {
    try{
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', FdraID : fdraId})
        });
        const result = await response.json();
        if(!response.ok){
            throw new Error(result.error || 'Failed to delete FDRA');
        }
        return { success: true, message: result.message };

    } catch (error) {
        console.error('Error deleting FDRA:', error);
        return { success: false, error: 'Failed to delete FDRA' };
    }
}