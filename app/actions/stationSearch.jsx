'use server'
/* check db for existing station, 
fetch fems, 
return prv to user, 
trigger db edge fx after confirmation
*/
import { fetchNFDRData } from '../../lib/NFDRApi.js'
import { fetchWeatherData } from '../../lib/weatherApi.js'
import { supabase } from '../../lib/supabase/server.js'


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

        if(stationfetchError && stationfetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error checking existing station:', stationfetchError);
            return { error: 'Failed to check existing stations' }
        }
        if(existingStation) {
            console.log(`Station ${stationId} already exists in database`); //debug log
            return { exists: true, message: `Station ${stationId} already exists in database` }
        }  
        
        console.log(`fetching nfdr data for station ${stationId} with fuel model ${fuelModel}`); //debug log

        //get api data - allow partial failures
        let nfdrData = []; //local variable to hold data from fetch
        let weatherData = [];
        let nfdrError = null;
        let weatherError = null;
        
        try {
            nfdrData = await fetchNFDRData(stationId, fuelModel);
            console.log(`NFDR data fetched for station ${stationId}:`, nfdrData.length, 'records'); //debug log
        } catch (err) {
            console.error(`Error fetching NFDR data for station ${stationId}:`, err);
            nfdrError = err.message;
            // Don't return yet - try to get weather data
        }
        
        console.log(`fetching weather data for station ${stationId}`); //debug log
        try{
            weatherData = await fetchWeatherData(stationId);
            console.log(`Weather data fetched for station ${stationId}:`, weatherData.length, 'records'); //debug log
        } catch (err) {
            console.error(`Error fetching weather data for station ${stationId}:`, err);
            weatherError = err.message;
        }

        // Check if we got ANY data
        if(nfdrData.length === 0 && weatherData.length === 0) {
            const errorDetails = [];
            if (nfdrError) errorDetails.push(`NFDR: ${nfdrError}`);
            if (weatherError) errorDetails.push(`Weather: ${weatherError}`);
            return { 
                error: `No data found for station ${stationId}. ${errorDetails.join('; ')}` 
            };
        }

        //valid api data
        //transform for preview
        const stationName = nfdrData[0]?.StationName || weatherData[0]?.StationName || stationId;

        const preview = {
            stationName: stationName,
            stationId: stationId,
            // Fix: Use consistent property name 'nfdrSample' (not 'nfdrSamples')
            nfdrSample: nfdrData.slice(0,3).map(record => ({ 
                observationTime: record.ObservationTime || record.Date || 'None',
                erc: record.ERC ? parseFloat(record.ERC) : null,
                bi: record.BI ? parseFloat(record.BI) : null,
                nfdrType: record.NFDRType || 'None'
            })),
            // Fix: Use 'record' not 'row' in the map
            weatherSample: weatherData.slice(0,3).map(record => ({
                date: record.Date || record.ObservationTime || 'None',
                tempMin: record['TemperatureMin(F)'] ? parseFloat(record['TemperatureMin(F)']) : null,
                tempMax: record['TemperatureMax(F)'] ? parseFloat(record['TemperatureMax(F)']) : null,
                precipitation: record['Precipitation24hr(in)'] ? parseFloat(record['Precipitation24hr(in)']) : null,
            })),
            stats: {
                nfdrRecords: nfdrData.length,
                weatherRecords: weatherData.length,
                hasNfdr: nfdrData.length > 0,
                hasWeather: weatherData.length > 0
            }
        }
        console.log(`Preview data prepared for station ${stationId}`); //debug log
        return { 
            success: true, 
            exists: false,
            preview: preview, 
            message: `Preview data prepared for station ${stationId}` 
        }
    } catch(error) {
        console.error('Error during station search process:', error);
        return { error: 'An unexpected error occurred during the station search process' }
    }
}