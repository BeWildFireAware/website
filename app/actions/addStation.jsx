//server actons for adding, moving, updating stations and checking data

'use server';
//invocations of supabase fx (posts only) because these are js objects(form submissions)

//constants
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/add-station`;  //all actions use same edge fx

//add to db
export async function addStationToDatabase(stationInfo) {
    console.log('Adding station to database:', stationInfo);
    
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }
        //create json body with station info, send to edge function, returns success fail 
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },//add station info in body
            body: JSON.stringify({
                action: 'add',  //defined cases in backend
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
            stationId: result.stationId ||stationInfo.stationId,
            backgroundTaskStarted: result.backgroundTaskStarted || false, //flag defined in index(backend), to show user data is being added, takes a while(21 years of data)
            
        };
        
    } catch (error) {
        console.error('Error adding station:', error);
        return {
            success: false,
            error: error.message || 'Failed to add station'

        };
    }
}

export async function getAllStations() { //get all for display in table
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
            body: JSON.stringify({ action: 'listStations' })  //dont need to send anything but action(case) bc just select
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
//add new association of station to fdra, name unchanged from original code, missleading (should be add relationship)
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

//doesnt use edge fx
// Check station data import status(data being added in background ok)
export async function checkStationDataStatus(stationId) {
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        console.log(`Checking data status for station ${stationId}`);
        
        // Query NFDRRecords table to see if this station has any data, link is supabase rest api link, fast lookup, dont go through edge function because it should be adding hist data
        const response = await fetch(`${supabaseUrl}/rest/v1/NFDRRecords?Station_ID=eq.${stationId}&select=Record_ID&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });
        
        console.log(`Status check response status: ${response.status}`);
        
        // log response for debug, first 100 chars
        const responseText = await response.text();
        console.log(`Status check response body: ${responseText.substring(0, 100)}`);//decrease size?
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            return {
                success: false,
                error: `Invalid response from server: ${responseText.substring(0, 100)}` //return 100 char error message for debug
            };
        }
        
        if (!response.ok) {
            console.error('Status check failed:', data);
            return {
                success: false,
                error: data.message || `HTTP ${response.status}`
            };
        }
        
        const hasData = data && data.length > 0; //if length is 0, no data, if >0, has data, only if one record has added(dont need data here just bool)
        console.log(`Station ${stationId} has data: ${hasData}, record count: ${data?.length || 0}`);
        
        return {
            success: true,
            hasData: hasData,
            recordCount: data ? data.length : 0
        };
        
    } catch (error) {
        console.error('Error checking station data status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

//change fdra area for station(edge fx), delete old relationships(needed if fdra needs to be deleted)
export async function moveStationFdra(stationId, newFdraId, oldFdraId) {
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
                action: 'moveStationFDRA',
                stationId: parseInt(stationId),
                newFdraId: parseInt(newFdraId),
                oldFdraId: parseInt(oldFdraId)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}`);
        }

        console.log('Station FDRA moved successfully:', result);
        return {
            success: true,
            message: result.message || 'Station FDRA updated successfully',
            data: result.data
        };
    } catch (error) {
        console.error('Error moving station FDRA:', error);
        return {
            success: false,
            error: error.message || 'Failed to move station FDRA'
        };
    }
}