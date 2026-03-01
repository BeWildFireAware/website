// /src/lib/database/services/importService.js
import { supabase } from '@/lib/supabase.ts'
import { grabStations } from '@/lib/database/getStations.jsx'
import { NFDRCalls } from '@/lib/database/NFDRCalls.jsx'
import { WeatherCalls } from '@/lib/database/WeatherCalls.jsx'
import { getDateRange } from '@/lib/utils/formatDate.jsx'
import {
    BASE_WEATHER_CSV_URL,
    BASE_NFDR_URL
} from '@/lib/constants.jsx'

// API client functions
async function fetchNFDRData(startDate, endDate, stationIds, fuelModel) {
    const url = `${BASE_NFDR_URL}&startDate=${startDate}&endDate=${endDate}&dataFormat=csv&stationIds=${stationIds.join(',')}&fuelModels=${fuelModel}`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error(`NFDR fetch failed: ${response.status}`)
    return response.text()
}

async function fetchWeatherData(startDate, endDate, stationIds) {
    const url = `${BASE_WEATHER_CSV_URL}&startDate=${startDate}&endDate=${endDate}&dataFormat=csv&stationIds=${stationIds.join(',')}`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}`)
    return response.text()
}

// CSV parsers
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n') //split into lines, trim to remove any leading/trailing whitespace
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim()) //remove double quotes and trim whitespace from headers
    
    const rows = []
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim()) //remove second double quotes and trim whitespace from values
        const row = {}
        headers.forEach((header, index) => {
            row[header] = values[index] || ''
        })
        rows.push(row) //row{StationName: 'Station A', ObservationTime: '2026-01-01', BI: '5', ...}
    }
    return rows
}

export const importService = { //group fetch, duplicate check, transform, and insert functions into a single service for easy use in the app
    async runDailyImport() {
        console.log('Starting daily import...')
        const results = {
            nfdr: { success: true, inserted: 0, total: 0 }, //structures to hold import results for reporting, can expand with more details as needed
            weather: { success: true, inserted: 0, total: 0 }
        }
        
        try {
            // Get stations and mappings
            const nameToIdMap = await grabStations.nameToIdMap(supabase)
            console.log(`Found ${Object.keys(nameToIdMap).length} stations`)
            
            // Get date range
            const { startDate, endDate } = getDateRange()
            console.log(`Fetching data from ${startDate} to ${endDate}`)
            
            // Process NFDR data
            results.nfdr = await this.previewNFDRData(nameToIdMap, startDate, endDate)
            
            // Process Weather data
            results.weather = await this.processWeatherData(nameToIdMap, startDate, endDate)
            
            console.log('Import complete:', results)
            return results
            
        } catch (error) {
            console.error('Import failed:', error)
            throw error
        }
    }, //separate object params (fx1, fx2) 




    async previewNFDRData(nameToIdMap, startDate, endDate) {
        
        console.log('Station name map:', Object.keys(nameToIdMap))
        
        //bug here
        const stationsByFuelModel = await grabStations.groupStationsByFuelModel(supabase) //call outside class to group by fuel model, ISSUE, chicken or egg, need data to pull new data!, do fuel models ever change? if not ADD TO Stations Table
        //console.log('Stations by fuel model:', stationsByFuelModel)
        
        //local variables to track results for reporting
        let allRows = [] //for reporting total rows processed 
        let newRows = [] //to track new rows that will be inserted, 
        let duplicateCount = 0
        
        for (const [fuelModel, stationIds] of Object.entries(stationsByFuelModel)) {
            console.log(`\n Processing fuel model ${fuelModel} with stations:`, stationIds)
            
            try {
                // Fetch CSV
                const csvText = await fetchNFDRData(startDate, endDate, stationIds, fuelModel) //outside call to fetch current data for the dates to add
                const rows = parseCSV(csvText) //get header: val pairs
                
                //console.log(`  Raw CSV rows: ${rows.length}`) //evil line for harsh debugging
                
                if (rows.length > 0) { //show example row, for debugging
                    console.log('  First raw row sample:', rows[0])
                    console.log('  CSV Headers:', Object.keys(rows[0]))
                }
                
                // Check station name mapping
                const validRows = rows.filter(row => {
                    const hasStation = row.StationName && nameToIdMap[row.StationName] //keep all rows that have station IDcsv to stationIDdb, drop all stations that dont exist in db
                    if (!hasStation) {
                        console.log(`Station "${row.StationName}" not found in mapping`)
                    }
                    return hasStation
                })
                
                console.log(`Valid rows (with station mapping): ${validRows.length}`) 
                
                if (validRows.length === 0) continue //if not valid rows, skip to next fuel model
                
                // Transform rows
                const transformedRows = validRows.map(row => {
                    const transformed = NFDRCalls.transformNFDRData(row, nameToIdMap[row.StationName]) //outside call to transform to db format, add station id, and fuel model
                    //console.log('Transformed row sample:', transformed)
                    return transformed
                })
                
                allRows = [...allRows, ...transformedRows] //all rows tranformed... to accumulate all rows for reporting total processed, turned into array for imeediate use
                
                // Check existing records
                const stationIds_ = [...new Set(transformedRows.map(r => r.Station_ID))] //staionId exists elsewhere, prevent collision
                const dates = transformedRows.map(r => r.Observation_Time)
                
                console.log(`  Checking duplicates for stations:`, stationIds_)
                
                
                const existingKeys = await NFDRCalls.findExistingNFDRRecords(supabase, stationIds_, dates) //existsing records for dates pulled from cv

                
                console.log(`  Existing keys found:`, existingKeys.size)
                //console.log(`  Sample existing key:`, [...existingKeys][0])
                
                //filter duplicates, only keep new rows that dont have existing key combinations of stationId + date + fuelModel
                const newForThisGroup = transformedRows.filter(row => {
                    const key = `${row.Station_ID}:${row.Observation_Time}:${row.Fuel_Model}`
                    //console.log(`  Checking key: ${key} - Exists: ${existingKeys.has(key)}`)
                    if (existingKeys.has(key)) {
                        // This is a duplicate - exclude it
                        return false
                    } else {
                        // This is a new record - include it
                        return true
                    }
                })
                
                console.log(`New rows for this group: ${newForThisGroup.length}`)
                
                newRows = [...newRows, ...newForThisGroup] //only new NFDR rows to be inserted, for reporting  ...immediate use

                duplicateCount += transformedRows.length - newForThisGroup.length //how many were dropped
                if (newForThisGroup.length > 0) {
                    NFDRCalls.insertNFDRRecords(supabase, newForThisGroup) //if records still, insert them
                    console.log(`Inserted ${newForThisGroup.length} new NFDR records for fuel model ${fuelModel}`)
                }
                
            } catch (error) {
                console.error(`Error in preview for ${fuelModel}:`, error)
            }
        }
        
        return {
            success: true,
            inserted: newRows.length,
            total: allRows.length
        }
    },

    async processWeatherData(nameToIdMap, startDate, endDate) {
        console.log('Processing Weather data...')
        
        // Get all station IDs
        const stationIds = Object.values(nameToIdMap)
        
        try {
            // Fetch CSV
            const csvText = await fetchWeatherData(startDate, endDate, stationIds)
            const rows = parseCSV(csvText)
            
            // Filter valid rows and transform
            const validRows = rows.filter(row => row.StationName && nameToIdMap[row.StationName] && row.Date) //keep rows with station mapping and a valid date, drop others
            console.log(`Valid weather rows: ${validRows.length} out of ${rows.length}`)
            console.log('Sample valid weather row:', validRows[0])
            
           //tranform rows to db headers 
            const transformedRows = validRows.map(row => WeatherCalls.transformWeatherData(row, nameToIdMap[row.StationName]))
            console.log('Sample transformed weather row:', transformedRows[0])
            
            if (transformedRows.length === 0) {
                console.log(`No valid weather rows`)
                return { success: true, inserted: 0, total: rows.length }
            }
            
            // Check for duplicates
            const uniqueStationIds = [...new Set(transformedRows.map(r => r.Station_ID))] //r=transformed row
            const dates = transformedRows.map(r => r.Observation_Time)
            
            const existingKeys = await WeatherCalls.findExistingWeatherRecords(uniqueStationIds, dates) //return existing dups
            console.log(`Existing weather keys found:`, existingKeys.size)
            console.log(`Sample existing weather key:`, [...existingKeys][0])
            
            // Filter duplicates
            const newRecords = transformedRows.filter(row => {
                const key = `${row.Station_ID}:${row.Observation_Time}`
                return !existingKeys.has(key) //drop all dups
            })
            console.log(`New weather records to insert: ${newRecords.length} out of ${rows.length}`)
            
            // Insert new records
            if (newRecords.length > 0) {
                const result = await WeatherCalls.insertWeatherRecords(newRecords)
                console.log(`Inserted ${result.count} new weather records (${rows.length} total processed)`)
                return { success: true, inserted: result.count, total: rows.length }
            }
            
            console.log(`No new weather records to insert (${rows.length} total processed)`)
            return { success: true, inserted: 0, total: rows.length }
            
        } catch (error) {
            console.error('Error processing weather data:', error)
            return { success: false, error: error.message, inserted: 0, total: 0 }
        }
    }
}