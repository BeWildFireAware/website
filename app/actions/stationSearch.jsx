'use server'
/* check db for existing station, 
fetch fems, 
return preview to user, 
trigger db edge fx after confirmation
*/
import { fetchNFDRData } from '../../lib/NFDRApi.js'
import { fetchWeatherData } from '../../lib/weatherApi.js'
import { supabase } from '../../lib/supabase'

//search if station exists, if not fetch data and return preview to user for confirmation before db insert and edge fx trigger
export async function stationSearch(formData) {

    // Extract data from form, sanitize it, ? added for empty values
    const stationId = formData.get('stationId')?.toString().trim();
    const fuelModel = formData.get('fuelModel')?.toString().trim() || 'Y'; //default to Y if not provided
    const fdraId = formData.get('fdraId')?.toString().trim(); 

    console.log('Received station search request:', { stationId, fuelModel, fdraId });

    //validate inputs
    if(!stationId) {
        return { error: 'Station ID is required' }
    }
    if(!fdraId) {
        return { error: 'FDRA selection is required' }
    }
    if(!fuelModel) {
        return { error: 'Fuel model is required' }
    }
    if(!/^\d+$/.test(stationId)) {
        return { error: 'Station ID must be a valid number' }
    }

    //check stations in db/csv
    try{
        const { data: existingStation, error: stationfetchError } = await supabase
            .from('Stations')
            .select('*')
            .eq('ID', stationId)
            .single();

        if(stationfetchError && stationfetchError.code !== 'PGRST116') {
            console.error('Error checking existing station:', stationfetchError);
            return { error: 'Failed to check existing stations' }
        }
        
        if(existingStation) {
            // First, check if the FDRA exists and get its fuel model
            const { data: fdraData, error: fdraError } = await supabase
                .from('FDRA')
                .select('Fuel_Model')
                .eq('FDRA_ID', fdraId)
                .single();
            
            if(fdraError) {
                console.error('Error checking FDRA:', fdraError);
                return { error: 'Failed to check FDRA' }
            }
            
            // Check if the FDRA's fuel model matches the requested fuel model
            if(fdraData.Fuel_Model.toUpperCase() !== fuelModel.toUpperCase()) {
                return { 
                    error: `FDRA ${fdraId} uses fuel model ${fdraData.Fuel_Model}, not ${fuelModel}. Please select the correct fuel model.` 
                }
            }
            
            // Check if relationship exists (Fuel_Model column removed)
            const { data: relationship, error: relationshipError } = await supabase
                .from('Station_FDRA_Combinations')
                .select('Station_ID, FDRA_ID')
                .eq('Station_ID', stationId)
                .eq('FDRA_ID', fdraId)
                .maybeSingle();

            if(relationshipError) {
                console.error('Error checking station-FDRA relationship:', relationshipError);
                return { error: 'Failed to check station-FDRA relationship' }
            } 
            
            if(relationship) {
                console.log(`Station ${stationId} already exists in FDRA ${fdraId} with fuel model ${fuelModel}`);
                
                // Check if NFDR data exists for this station and fuel model
                const { data: nfdrData, error: nfdrError } = await supabase
                    .from('NFDRRecords')
                    .select('Record_ID')
                    .eq('Station_ID', stationId)
                    .eq('Fuel_Model', fuelModel)
                    .limit(1);
                
                if(nfdrError) {
                    console.error('Error checking NFDR records:', nfdrError);
                }
                
                const hasData = nfdrData && nfdrData.length > 0;
                
                return { 
                    exists: true, 
                    message: `Station ${stationId} already exists in FDRA ${fdraId} with fuel model ${fuelModel}.` +
                             (hasData ? ' Historical data exists.' : ' No historical data found.')
                }
            }   
            console.log(`Station exists but relationship with FDRA ${fdraId} does not exist`);
        }  
        
        console.log(`fetching nfdr data for station ${stationId} with fuel model ${fuelModel}`);

        //get api data - allow partial failures
        let nfdrData = [];
        let weatherData = [];
        let nfdrError = null;
        let weatherError = null;
        
        try {
            nfdrData = await fetchNFDRData(stationId, fuelModel);
            console.log(`NFDR data fetched for station ${stationId}:`, nfdrData.length, 'records');
        } catch (err) {
            console.error(`Error fetching NFDR data for station ${stationId}:`, err);
            nfdrError = err.message;
        }
        
        console.log(`fetching weather data for station ${stationId}`);
        try{
            weatherData = await fetchWeatherData(stationId);
            console.log(`Weather data fetched for station ${stationId}:`, weatherData.length, 'records');
        } catch (err) {
            console.error(`Error fetching weather data for station ${stationId}:`, err);
            weatherError = err.message;
        }
        
        console.log(`Data fetch complete for station ${stationId}. NFDR records: ${nfdrData.length}, Weather records: ${weatherData.length}`);
        
        // Check if we got ANY data
        if(nfdrData.length === 0 && weatherData.length === 0) {
            const errorDetails = [];
            if (nfdrError) errorDetails.push(`NFDR: ${nfdrError}`);
            if (weatherError) errorDetails.push(`Weather: ${weatherError}`);
            return { 
                error: `No data found for station ${stationId}. ${errorDetails.join('; ')}`,
                exists: false,
                preview: null
            };
        }

        //valid api data - transform for preview
        const stationName = nfdrData[0]?.StationName || weatherData[0]?.StationName || stationId;

        const preview = {
            stationName: stationName,
            stationId: stationId,
            nfdrSample: nfdrData.map(record => ({ 
                observationTime: record.ObservationTime || record.Date || 'None',
                erc: record.ERC ? parseFloat(record.ERC) : null,
                bi: record.BI ? parseFloat(record.BI) : null,
                nfdrType: record.NFDRType || 'None'
            })),
            weatherSample: weatherData.map(record => ({
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
        
        console.log(`Preview data prepared for station ${stationId}`);
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