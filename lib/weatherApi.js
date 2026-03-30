//handle comms with FEMS weather
import { BASE_WEATHER_CSV_URL } from "./constants"; 


export async function fetchWeatherData(stationId) { //check if data exists for new station

    //get sample of data for now
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

//remove time from date string
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0]; 

    const url = `${BASE_WEATHER_CSV_URL}&startDate=${threeDaysAgoStr}&endDate=${todayStr}&dataFormat=csv&stationIds=${stationId}`;

    try{
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}: ${response.statusText}`);
        
        const csvText = await response.text();
        return parseWeatherCSV(csvText);
    }catch(error){
        console.error('Error fetching weather data for station ${stationId}:', error);
        throw error;
    }

}
function parseWeatherCSV(csvText){
    const lines = csvText.trim().split('\n');

    if(lines.length < 2) {
        console.log('No weather data available for station ${stationId}');
        return []; //no data
    }  
    const rows = []; //hold all rows (headers + data, headers+data)

    const headers = lines[0].split(',').map(col => col.replace(/"/g, '').trim()); //get headers from first line, remove quotes and trim whitespace
    for(let i = 1; i < lines.length; i++){
        const values = lines[i].split(',').map(val => val.replace(/"/g, '').trim()); //remove quotes and trim whitespace from values
    
        const row = {}; //individual row object to hold header-value pairs, ad row to row as index
        headers.forEach((header, index) => {
            row[header] = values[index] || null; //map header to value, use null of value is mising(bug or not?)
        });
        rows.push(row);
    }
    return rows; //return array of row objects
}