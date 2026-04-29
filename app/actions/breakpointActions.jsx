//server actions for breakpoints
'use server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/breakpoint-service`; //REMEMBER TO NAME THE DGE FX THIS

//get available fdras
export async function getFdraOptions() {
    try {
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getFdraOptions' })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch FDRA options');
        }   
        return result.data; // Assuming the edge function returns { success: true, data: [...] };
    } catch (error) {
        console.error('Error fetching FDRA options:', error);
        return { success: false, error: 'Failed to fetch FDRA options' };
    }
}

//frda specific breakpoints
export async function getBreakpoints(fdraId) {
    try {
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getBreakpoints', fdraId })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch breakpoints');
        }
        return { useBi: data.useBi, breakpoints: data.breakpoints }; // Assuming the edge function returns { success: true, useBi: true/false, breakpoints: [...] };

    } catch (error) {
        console.error('Error fetching breakpoints:', error);
        return { success: false, error: 'Failed to fetch breakpoints' };
    }       
}
//update breakpoints for fdra
export async function updateBreakpoints(fdraId, updatedData) {
    try {
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateBreakpoints', fdraId, updatedData })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update breakpoint');
        }
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error updating breakpoint:', error);
        return { success: false, error: 'Failed to update breakpoint' };
    }
}
