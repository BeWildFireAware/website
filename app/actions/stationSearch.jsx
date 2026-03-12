// /app/actions/stationSearch.js
'use server'

/* check db for existing station, 
fetch fems, 
return prv to user, 
trigger db edge fx after confirmation
*/


export async function stationSearch(formData) {
   
}









/* // Extract data from form
    const stationId = formData.get('stationId')
    const fdraId = formData.get('fdraId')
    
    // Validate inputs
    if (!stationId || stationId.trim() === '') {
        return { found: false, error: 'Station ID is required' }
    }
    
    if (!fdraId || fdraId.trim() === '') {
        return { found: false, error: 'Please select an FDRA' }
    }

    const baseurl = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/';

    // Get date range - last 3 days of data
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 0); // Get dat

    // Format dates (YYYY-MM-DD)
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Construct URL
    const url = `${baseurl}?dataset=all&startDate=${threeDaysAgoStr}&endDate=${todayStr}&dataFormat=csv&stationIds=${stationId}`;
    
    console.log('Fetching URL:', url); // Debug log
    
    try {
        // Fetch data
        const response = await fetch(url);
        
        if (!response.ok) {
            return { 
                found: false, 
                error: `Station search failed: ${response.status} ${response.statusText}` 
            };
        }
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 2) {
            return { 
                found: false, 
                message: `No data found for Station ID ${stationId}` 
            };
        }

        // Parse headers (first line)
        const headers = lines[0].split(',').map(col => col.replace(/"/g, '').trim());
        
        // Parse data rows
        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(val => val.replace(/"/g, '').trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        // Get the most recent record (first row)
        const latestRecord = rows[0] || {};

        // Return structured data
        return { 
            found: true, 
            data: {
                stationId: stationId,
                fdraId: fdraId,
                stationName: latestRecord.StationName || '',
                erc: latestRecord.ERC || '',
                bi: latestRecord.BI || '',
                observationTime: latestRecord.ObservationTime || latestRecord.Date || '',
                nfdrType: latestRecord.NFDRType || '',
                sampleData: rows.slice(0, 3) // First 3 records for preview
            }
        };
        
    } catch (error) {
        console.error('Station search error:', error);
        return { 
            found: false, 
            error: error.message || 'Unknown error occurred' 
        };
    }*/ 