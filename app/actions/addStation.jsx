
'use server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/add-station`;  //all actions use same edge fx

export async function addStationToDatabase(stationInfo) {
    console.log('Adding station to database:', stationInfo);
    
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
                action: 'add',  
                stationId: stationInfo.stationId,
                fuelModel: stationInfo.fuelModel,
                fdraId: stationInfo.fdraId,
                stationName: stationInfo.stationName
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}`);
        }
        
        console.log('Station added successfully:', result);
        
        return {
            success: true,
            message: result.message || 'Station added successfully',
            recordsInserted: result.recordsInserted || 0
        };
        
    } catch (error) {
        console.error('Error adding station:', error);
        return {
            success: false,
            error: error.message || 'Failed to add station'
        };
    }
}

export async function getAllStations() {
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ action: 'listStations' })  
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}`);
        }
        
        console.log('Stations retrieved successfully:', result.length);
        return {
            success: true,
            data: result
        };
        
    } catch (error) {
        console.error('Error retrieving stations:', error);
        return {
            success: false,
            error: error.message || 'Failed to retrieve stations'
        };
    }
}
//update to new fdra
export async function updateStationFdra(stationId, newFdraId) {
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }
        
       
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
                action: 'updateStationFdra', 
                stationId: parseInt(stationId),
                newFdraId: parseInt(newFdraId)
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}`);
        }
        
        console.log('Station FDRA updated successfully:', result);
        return {
            success: true,
            message: result.message || 'Station FDRA updated successfully',
            data: result.data
        };
        
    } catch (error) {
        console.error('Error updating station FDRA:', error);
        return {
            success: false,
            error: error.message || 'Failed to update station FDRA'
        };
    }
}