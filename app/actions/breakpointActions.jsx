'use server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/breakpoint-service`; //REMEMBER TO NAME THE DGE FX THIS

export async function getFdraOptions() {
    try {
        const response = await fetch(`${EDGE_FUNCTION_URL}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getFdraOptions' })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch FDRA options');
        }   
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching FDRA options:', error);
        return { success: false, error: 'Failed to fetch FDRA options' };
    }
}


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
        return { success: true, data };

    } catch (error) {
        console.error('Error fetching breakpoints:', error);
        return { success: false, error: 'Failed to fetch breakpoints' };
    }       
}
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
        return { success: true, data };
    } catch (error) {
        console.error('Error updating breakpoint:', error);
        return { success: false, error: 'Failed to update breakpoint' };
    }
}
