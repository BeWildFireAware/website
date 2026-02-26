// const CSV_URL = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all&startDate=2026-01-20&endDate=2026-02-21&dataFormat=csv&stationIds=52812,54704,54702,52813&fuelModels=Y'

// // Pairs of StationId and StationName for high elevation stations
// const highElevationPairs = [
// 	['54702', 'LUJAN'],
// 	['52813', 'HUNTSMAN MESA'],
// 	['52812', 'TAYLOR PARK'],
// 	['54704', 'NEEDLE CREEK'],
// ]

import { supabase } from '@/lib/supabase'
//get todays date 
function formatedDate(date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

//map which fuel models have what ID's, for building csv urls
async function getDataMapFuelModel(){
	//grab all records currently, future optimize to grab last entry for each station
	const {data: Records, error: getDataError} = await supabase
	.from('StationRecord')
	.select('Station_ID, fuel_model')

	//basic error for now
	if(getDataError){
		console.error('Error fetching StationRecord data:', getDataError)
		return { rows: [], columnNames: [] }
	}

	//create a map for stationID->nfdr type, one csv call per fuel model
	const fuelModelMap = new Map()
	//loop through all records(will be too big eventually, need to grab most recent record for each station)
	for(const record of Records){
		const stationID = record.Station_ID
		const fuelModel = record.fuel_model || 'Y' //default y for now if null ( possibly O?)
		//make sure uniqueness in map
		if(!fuelModelMap.has(stationID)){
			fuelModelMap.set(stationID, fuelModel)
		}
	}
	//show it grabbed data and stored unique values
	console.log(`Found ${fuelModelMap.size} unique stationID->fuelModel entries`)	

	//create object, group ids by fuel model type, id= fuel model type, value = array of stationIDs
	const stationsByFuelModel = {}
	for(const [stationID, fuelModel] of fuelModelMap.entries()){
		if(!stationsByFuelModel[fuelModel]){
			stationsByFuelModel[fuelModel] = []
		}
		//add station to fuel model group
		stationsByFuelModel[fuelModel].push(stationID)
		
	}
	console.log('Stations grouped by fuel model:', Object.keys(stationsByFuelModel))
	return stationsByFuelModel
}




//build the CSV URL with date range and station IDs and specific fuel model
function buildCsvUrl(startDate, endDate, stationIds, fuelModel){ 
	const baseCSV = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all'
	const stationIdString = stationIds.join(',')//all ids separated by comma for url
	return `${baseCSV}&startDate=${startDate}&endDate=${endDate}&dataFormat=csv&stationIds=${stationIdString}&fuelModels=${fuelModel}`
}

//weather url builder, implement soon, no fuel model
function buildWeatherCsvUrl(startDate, endDate, stationIds){
	const baseWeatherCsv = 'https://fems.fs2c.usda.gov/api/climatology/download-wx-daily-summary/?dataset=all'
	const stationIdString = stationIds.join(',')//all ids separated by comma for url
	return `${baseWeatherCsv}&startDate=${startDate}&endDate=${endDate}&dataFormat=csv&stationIds=${stationIdString}`
}






//store in csv, map station name to ID, filter out bad rows
async function storeCsvData(csvRows) {
    console.log(`Storing ${csvRows.length} rows to database`)
    
    // Get station/name from supabase(csv doesnt have IDs)
    const { data: stationMap, error: mapError } = await supabase
        .from('StationRecord')
        .select('Station_ID, Station_Name')
    
	//if error above throw error, prevent crash by returning false	
    if (mapError) {
        console.error('Error fetching station mapping:', mapError)
        return { success: false, error: mapError.message }
    }
    
	//create map of station name to ID to process csv(if not station name<->id mapping dont store data)
    const nameToIdMap = {}
    stationMap.forEach(record => {
        if (record.Station_Name && record.Station_ID) {
            nameToIdMap[record.Station_Name] = record.Station_ID
        }
    })

    // NFDRS Column mapping
    const columnMapping = {
        'StationName': 'Station_Name',  
        'BI': 'BI',
        'ERC': 'ERC',
        'ObservationTime': 'Observation_Time',
        'NFDRType': 'NFDRType',
        'fuel_model': 'fuel_model',
        '1HrFM': 'onehourfm',
        '10HrFM': 'tenhourfm',
        '100HrFM': 'hundredhourfm',
        '1000HrFM': 'thousandhourfm',
        'IC': 'ic',
        'SC': 'sc',
        'KBDI': 'kbdi'
    }
	//WEATHER CSV, implement soon
	const weatherColumnMapping = {
		'StationName': 'Station_Name',
		'TemperatureMin(F)': 'temperaturemin',
		'TemperatureMax(F)': 'temperaturemax',
		'RelativeHumidityMin(%)': 'relativehumiditymin',
		'RelativeHumidityMax(%)': 'relativehumiditymax',
		'WindSpeedMax(mph)': 'windspeedmax',
		'GustDirection(degrees)': 'winddirection',
		'Precipitation24hr(in)': 'precipitation24hr',
	}

    // Transform rows first to get normalized dates and station IDs(for duplicates)
    const transformedRows = csvRows //.fliter.map.filter, all at once to get rid of bad rows
        .filter(row => {
            // if no name, not in map, or no obs date, skip
            if (!row.StationName || !nameToIdMap[row.StationName] || !row.ObservationTime) {
                return false
            }
            return true
        })
        .map(row => { //map csv row to db row
            const dbRow = {}
            
			//for each entry on NFDRS map, normalize date(stored different in csv and db)
            Object.entries(columnMapping).forEach(([csvField, dbField]) => {
                if (row[csvField] !== undefined && row[csvField] !== '') { //in not undefined or empty
                    if (dbField === 'Observation_Time' && row[csvField].includes('/')) { //if csv date has /(mm/dd/yyyy) convert to db entry
                        const [month, day, year] = row[csvField].split('/')
                        dbRow[dbField] = `${year}-${month}-${day}`
                    } else {
                        dbRow[dbField] = row[csvField] //taylor park -> 52812
                    }
                }
            })
            
            dbRow.Station_ID = nameToIdMap[row.StationName] //dbrow to add is station id from map based on station name in csv
            
            if (!dbRow.fuel_model) { //make sure fuel model is always populated, default to Y if null
                dbRow.fuel_model = 'Y'
            }
            
            return dbRow
        })
        .filter(row => row.Observation_Time && row.Station_ID) //this shouldnt be necessary with the first filter, but just in case, make sure we have station id and obs time for duplicates

    if (transformedRows.length === 0) {
        console.log('No valid rows to process')
        return { success: true, count: 0 }
    }

    // Get ALL unique combinations of (Station_ID, Observation_Time) from csv
   
    const uniqueDateCombinations = new Map() 
    
    transformedRows.forEach(row => { //for each row in rows to add get id obs time, if not in map add to map
        const key = `${row.Station_ID}:${row.Observation_Time}`
        if (!uniqueDateCombinations.has(key)) {
            uniqueDateCombinations.set(key, row)
        }
    })

    console.log(`CSV contains ${transformedRows.length} total rows with ${uniqueDateCombinations.size} unique station-date combinations`)

    // Supabase can handle IN clauses with multiple values
   
    // Group by station for more efficient querying
    const obsByStation = {} //dictionary of station id to array of obs times
    transformedRows.forEach(row => {
        if (!obsByStation[row.Station_ID]) {
            obsByStation[row.Station_ID] = []
        }
        obsByStation[row.Station_ID].push(row.Observation_Time) //ID -> [obs time 1, obs time 2, obs time 3]
    })

    // For each station, query ONLY the dates we care about
    let existingCount = 0 //count of rows that exist in db already, for logging/debug
    const existingDates = new Set()

    // evil line:
	//convert obsBystation obj into array
	//.map transforms each entry creating the array [station id, [dates]]
	//async function(returns promises), need to query db, can fail or succed depending on supabase status, prevents crash
    const stationPromises = Object.entries(obsByStation).map(async ([stationId, dates]) => { 
        // Remove duplicates from dates array
		//...: spread operator to convert set back into array immediately for use
        const uniqueDates = [...new Set(dates)] //create a new set from dates array(removes duplicates for same station), unlikely but just in case
        
        // Query only the specific dates for this station
        const { data: existingData, error: datecallerror } = await supabase
            .from('StationRecord')
            .select('Station_ID, Observation_Time')
            .eq('Station_ID', stationId)
            .in('Observation_Time', uniqueDates) // parallel query for all dates in this station

        if (datecallerror) {
            console.error(`Error checking station ${stationId}:`, datecallerror)
            return []
        }

        return existingData || [] //return array of existing records for this station, or empty array if none
    })

    // Wait for all station queries to complete
    const stationResults = await Promise.all(stationPromises) //await async promises(parallel queries)
    
    // Flatten results and add to existingDates, ex: [[obj, obj], [obj], []]-> {stationID: 52812, obsTime: 2026-01-20}, {stationID: 52812, obsTime: 2026-01-21}, etc
    stationResults.flat().forEach(record => {
        existingDates.add(`${record.Station_ID}:${record.Observation_Time}`) //add id:date to existing dates to drop
        existingCount++ //increment counter
    })

    console.log(`Found ${existingCount} existing records that match CSV dates`)

    // Filter out duplicates
    const newRows = transformedRows.filter(row => { //complete filtered data
        const key = `${row.Station_ID}:${row.Observation_Time}` //get this rows key:value
        return !existingDates.has(key) //return true or false for each row, if key in existing dates, drop it, if not, keep it
    })

    console.log(`\nDuplicate Analysis:`)
    console.log(`- Total CSV rows: ${transformedRows.length}`)
    console.log(`- Unique station-date combos: ${uniqueDateCombinations.size}`)
    console.log(`- Already in database: ${existingCount}`)
    console.log(`- New rows to insert: ${newRows.length}`)

	// If no new rows to insert, return early
    if (newRows.length === 0) {
        console.log('No new rows to insert')
        return { success: true, count: 0 }
    }

    // Insert new rows
    const { data, error: addRowsError } = await supabase
        .from('StationRecord')
        .insert(newRows)

    if (addRowsError) { //prevent crash
        console.error('Error inserting data:', addRowsError)
        return { success: false, error: addRowsError.message }
    }

    console.log(`Successfully stored ${newRows.length} new rows`)
    return { success: true, count: newRows.length }
}



export async function buildCsvStoreData() {
	//get station data and group by fuel model
	const stationsByFuelModel = await getDataMapFuelModel()
	if(Object.keys(stationsByFuelModel).length === 0){
		console.error('No station data found in db, cannot build CSV URLs')
		return { rows: [], columnNames: [], summary: {totalRows: 0} } //prevent crash but still try to return something for testing, eventually want to handle this case better

	}
	//end date = current date
	//start date = first of month
	const today = new Date()
	const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
	const startDate= formatedDate(firstOfMonth)
	const endDate = formatedDate(today)

	//prepare arrays to store results
	const allRows = []
	let allColumnNames = []

	for (const [fuelModel, stationIds] of Object.entries(stationsByFuelModel)){ //for each key->value(s) paur
		//skip empty fuel models (wvxz for now)
		if(stationIds.length === 0){
			console.log('Skipping fuel model ${fuelModel} with no station IDs')
			continue
		}
		console.log(`Processing fuel model ${fuelModel} with ${stationIds.length} station IDs`)

		const uniqueUrl = buildCsvUrl(startDate, endDate, stationIds, fuelModel)
		//const uniqueWeatherUrl = buildWeatherCsvUrl(startDate, endDate, stationIds) 
		try {
			const response = await fetch(uniqueUrl)
			if (!response.ok) {
				console.error(`Network response was not ok for fuel model ${fuelModel}`) //trhow error, dpomt crash
				continue
			}

			const csvText = await response.text()
			const lines = csvText.trim().split('\n')
			if (lines.length < 2) {
				console.warn(`No data rows found in CSV for fuel model ${fuelModel}`)
				continue
			}

			const headers = lines[0].split(',').map(col => col.replaceAll('"', ''))
			console.log("csv headers:", headers)
			if (allColumnNames.length === 0) {
				allColumnNames = headers
			}
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(',').map(val => val.replaceAll('"', ''))

				//keys are headers, values are data
				const row = {}
				headers.forEach((header, index) => {
					row[header] = values[index] || ''
				})
				row.Fuel_Model = fuelModel //add fuel model to each row for reference
				allRows.push(row)
			}	
		} catch (error) {
			console.error(`Error fetching or processing CSV for fuel model ${fuelModel}:`, error.message)
		}	
	}
	//after all csv calls, sort 
	
		
		
	//sort all rows by ObservationTime descending, 
	allRows.sort((a,b)=>b.ObservationTime.localeCompare(a.ObservationTime))
	console.log('Total rows fetched across all fuel models:', allRows.length)
	console.log('allRows sample:', allRows.slice(0, 2))
	console.log('allColumnNames:', allColumnNames)
	await storeCsvData(allRows) //store in supabase for later
	return { rows: allRows, columnNames: allColumnNames, summary: { totalRows: allRows.length } }
}





/*
const stationIds = stationsByFuelModel[fuelModel].join(',')
		const csvUrl = buildCsvUrl(startDate, endDate, stationIds, fuelModel)
		console.log(`Built CSV URL for fuel model ${fuelModel}:`, csvUrl)
export async function getCsvData() {
	const response = await fetch(buildCsvUrl())
	const csvText = await response.text()
	const lines = csvText.trim().split('\n')
	
	const columnNames = lines[0].split(',').map(col => col.replaceAll('"', ''))
	if (!columnNames.includes('StationId')){
		columnNames.push('StationId')
	}


	console.log('Column Names:', columnNames)
	const rows = []
	
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map(val => val.replaceAll('"', ''))
		const row = {}
		columnNames.forEach((col, index) => {
			row[col] = values[index] || ''
		})

		// let stationId = ''
		// for (const [id, name] of highElevationPairs) {//find StationId based on StationName
		// 	if (name === row.StationName) {
		// 		stationId = id
		// 		break
		// 	}
		// }
		// row.StationId = stationId
		rows.push(row)
	}
	//sort rows by ObservationTime descending
	rows.sort((a,b)=>b.ObservationTime.localeCompare(a.ObservationTime))
	
	return { columnNames, rows }
}
*/
