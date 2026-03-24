// /app/actions/addStation.jsx
'use server';

/**
 * Server action to add a new station to the database
 * Calls the Supabase Edge Function to fetch full historical data
 * @param {Object} stationInfo - Station information object containing stationId, fuelModel, fdraId, and stationName
 * @returns {Promise<Object>} - Result of the operation, promise is returned
 */
export async function addStationToDatabase(stationInfo) {
    console.log('Adding station to database:', stationInfo);
    
    try {
        // Get the Supabase URL and anon key from environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        //Call the Supabase Edge Function
        // The edge function will handle:
        // Fetching full data from Jan 1 to today+6 for both NFDR and Weather
        // Transforming the data
        // Inserting into the database
        const response = await fetch(`${supabaseUrl}/functions/v1/add-station`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
                stationId: stationInfo.stationId,
                fuelModel: stationInfo.fuelModel,
                fdraId: stationInfo.fdraId,
                stationName: stationInfo.stationName
            })
        });
        
        // Parse the response
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
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