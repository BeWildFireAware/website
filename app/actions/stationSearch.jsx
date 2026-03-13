'use server'
/* check db for existing station, 
fetch fems, 
return prv to user, 
trigger db edge fx after confirmation
*/
import { fetchNFDRData } from '../../lib/NFDRApi.js'
import { fetchWeatherData } from '../../lib/weatherApi.js'
import { supabase } from '../../lib/supabase/server.js'
import { parse } from 'node:path';

export async function stationSearch(formData) {

    // Extract data from form, sanitize it, ? added for empty values
    const stationId = formData.get('stationId')?.toString().trim(); //
    const fuelModel = formData.get('fuelModel')?.toString().trim() || 'Y'; //default to Y if not provided
    const fdraId = formData.get('fdraId')?.toString().trim(); 

    console.log('Received station search request:', { stationId, fuelModel, fdraId }); //debug log

    //validate inputs
    if(!stationId) {
        return { error: 'Station ID is required' }
    }
    if(!fdraId) {
        return { error: 'FDRA selection is required' }
    }
    //should default to Y, but just in case
    if(!fuelModel) {
        return { error: 'Fuel model is required' }
    }
    //helpful guide to writing regular expressions https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
    //^=start of string, $=end of string, \d=any digit, +means any of the next elements, so start at start check if number till end must be valid
    if(!/^\d+$/.test(stationId)) { //station id should be numbers all the way through (doesnt accept empty, hex, decimals, letters)
        return { error: 'Station ID must be a valid number' }
    }

    //check stations in db/csv
    try{
        const { data: existingStation, error: stationfetchError } = await supabase
            .from('Stations')
            .select('*')
            .eq('ID', stationId)
            .single(); //should only be one station with given id, if any

        if(stationfetchError) {
            console.error('Error checking existing station:', stationfetchError);
            return { error: 'Failed to check existing stations' }
        }
        if(existingStation) {
            console.log(`Station ${stationId} already exists in database`); //debug log
            return { exists: true, message: `Station ${stationId} already exists in database` }
        }  
        
        console.log(`fetching nfdr data for station ${stationId} with fuel model ${fuelModel}`); //debug log

        //get api data
        let nfdrData = []; //local variable to hold data from fetch
        let weatherData = [];
        try {
            nfdrData = await fetchNFDRData(stationId, fuelModel);
            console.log(`NFDR data fetched for station ${stationId}:`, nfdrData); //debug log
        } catch (nfdrError) {
            console.error(`Error fetching NFDR data for station ${stationId}:`, nfdrError);
            return { error: 'Failed to fetch NFDR data for the station' }
        }
        console.log(`fetching weather data for station ${stationId}`); //debug log
        try{
            weatherData = await fetchWeatherData(stationId);
            console.log(`Weather data fetched for station ${stationId}:`, weatherData); //debug log
        } catch (weatherError) {
            console.error(`Error fetching weather data for station ${stationId}:`, weatherError);
            return { error: 'Failed to fetch weather data for the station' }
        }

        if(nfdrData.length === 0 && weatherData.length === 0) { //should always return data for both apis, if not something went wrong (will there ever be a case without nfdr/weather data?)
            return { error: 'No data found for the specified station, please make sure the ID is correct' }
        }

        //valid api adta
        //transform for preview
        const stationName = nfdrData[0]?.StationName || weatherData[0]?.StationName || stationId; //try to get station name from either source, default to id if not available(should never happen)

        const preview = { //obj to hold header value for both nfdr and weater for one preview record
            stationName: stationName,
            stationId: stationId,

            nfdrSample: nfdrData.slice(0,3).map(record => ({ 
                observationTime: record.ObservationTime || record.Date || 'None', //some records(nfdr/weather) have ObservationTime, some have Date, use whatever is available in case they ever switch
                erc: record.ERC ? parseFloat(record.ERC) : 'None', //parse to float if available, otherwise return 'None'
                bi: record.BI ? parseFloat(record.BI) : 'None',
                nfdrType: record.NFDRType || 'None'
            })),
            weatherSamples: weatherData.slice(0,3).map(record => ({
                date: record.Date || record.ObservationTime || 'None',
                tempMin: row['TemperatureMin(F)'] ? parseFloat(row['TemperatureMin(F)']) : 'null',
                tempMax: row['TemperatureMax(F)'] ? parseFloat(row['TemperatureMax(F)']) : 'null',
                precipitation: row['Precipitation24hr(In)'] ? parseFloat(row['Precipitation24hr(In)']) : 'null',
            })),
            //check if it received the correct amount of rows
            stats: {
                nfdrRecords: nfdrData.length,
                weatherRecords: weatherData.length
            }
        }
        console.log(`Preview data prepared for station ${stationId}`); //debug log
        return { success: true, exists: false,preview: preview, message: `Preview data prepared for station ${stationId}` } //return preview data for user confirmation before adding to db
    } catch(error) {
        console.error('Error during station search process:', error);
        return { error: 'An unexpected error occurred during the station search process' }
    }

   
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