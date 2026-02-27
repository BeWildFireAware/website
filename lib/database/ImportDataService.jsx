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
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    
    const rows = []
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        const row = {}
        headers.forEach((header, index) => {
            row[header] = values[index] || ''
        })
        rows.push(row)
    }
    return rows
}

export const importService = { //group fetch, duplicate check, transform, and insert functions into a single service for easy use in the app
    async runDailyImport() {
        console.log('Starting daily import...')
        const results = {
            nfdr: { success: true, inserted: 0, total: 0 },
            weather: { success: true, inserted: 0, total: 0 }
        }
        
        try {
            // STEP 1: Get stations and mappings
            const nameToIdMap = await grabStations.nameToIdMap(supabase)
            console.log(`Found ${Object.keys(nameToIdMap).length} stations`)
            
            // STEP 2: Get date range
            const { startDate, endDate } = getDateRange()
            console.log(`Fetching data from ${startDate} to ${endDate}`)
            
            // STEP 3: Process NFDR data
            results.nfdr = await this.previewNFDRData(nameToIdMap, startDate, endDate)
            
            // STEP 4: Process Weather data
            results.weather = await this.processWeatherData(nameToIdMap, startDate, endDate)
            
            console.log('Import complete:', results)
            return results
            
        } catch (error) {
            console.error('Import failed:', error)
            throw error
        }
    },

    async previewNFDRData(nameToIdMap, startDate, endDate) {
        console.log('🔍 DEBUG - NFDR Preview Starting')
        console.log('Station name map:', Object.keys(nameToIdMap))
        
        const stationsByFuelModel = await grabStations.groupStationsByFuelModel(supabase)
        console.log('Stations by fuel model:', stationsByFuelModel)
        
        let allRows = []
        let newRows = []
        let duplicateCount = 0
        
        for (const [fuelModel, stationIds] of Object.entries(stationsByFuelModel)) {
            console.log(`\n📊 Processing fuel model ${fuelModel} with stations:`, stationIds)
            
            try {
                // Fetch CSV
                const csvText = await fetchNFDRData(startDate, endDate, stationIds, fuelModel)
                const rows = parseCSV(csvText)
                
                console.log(`  Raw CSV rows: ${rows.length}`)
                if (rows.length > 0) {
                    console.log('  First raw row sample:', rows[0])
                    console.log('  CSV Headers:', Object.keys(rows[0]))
                }
                
                // Check station name mapping
                const validRows = rows.filter(row => {
                    const hasStation = row.StationName && nameToIdMap[row.StationName]
                    if (!hasStation) {
                        console.log(`  ❌ Station "${row.StationName}" not found in mapping`)
                    }
                    return hasStation
                })
                
                console.log(`  Valid rows (with station mapping): ${validRows.length}`)
                
                if (validRows.length === 0) continue
                
                // Transform rows
                const transformedRows = validRows.map(row => {
                    const transformed = NFDRCalls.transformNFDRData(row, nameToIdMap[row.StationName])
                    console.log('  Transformed row sample:', transformed)
                    return transformed
                })
                
                allRows = [...allRows, ...transformedRows]
                
                // Check existing records
                const stationIds_ = [...new Set(transformedRows.map(r => r.Station_ID))]
                const dates = transformedRows.map(r => r.Observation_Time)
                
                console.log(`  Checking duplicates for stations:`, stationIds_)
                console.log(`  Dates:`, dates.slice(0, 3))
                
                const existingKeys = await NFDRCalls.findExistingNFDRRecords(
                    supabase, stationIds_, dates
                )
                
                console.log(`  Existing keys found:`, existingKeys.size)
                
                const newForThisGroup = transformedRows.filter(row => {
                    const key = `${row.Station_ID}:${row.Observation_Time}`
                    const exists = existingKeys.has(key)
                    if (exists) console.log(`  🔑 Key exists: ${key}`)
                    return !exists
                })
                
                console.log(`  New rows for this group: ${newForThisGroup.length}`)
                
                newRows = [...newRows, ...newForThisGroup]
                duplicateCount += transformedRows.length - newForThisGroup.length
                if (newForThisGroup.length > 0) {
                    NFDRCalls.insertNFDRRecords(supabase, newForThisGroup)
                    console.log(`  Inserted ${newForThisGroup.length} new NFDR records for fuel model ${fuelModel}`)
                }
                
            } catch (error) {
                console.error(`Error in preview for ${fuelModel}:`, error)
            }
        }
        
        return {
            rows: allRows,
            newRows: newRows,
            duplicates: duplicateCount,
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
            const validRows = rows.filter(row => 
                row.StationName && nameToIdMap[row.StationName] && row.Date
            )
            
            const transformedRows = validRows.map(row => 
                WeatherCalls.transformWeatherData(row, nameToIdMap[row.StationName])
            )
            
            if (transformedRows.length === 0) {
                console.log(`No valid weather rows`)
                return { success: true, inserted: 0, total: rows.length }
            }
            
            // Check for duplicates
            const uniqueStationIds = [...new Set(transformedRows.map(r => r.Station_ID))]
            const dates = transformedRows.map(r => r.Observation_Time)
            
            const existingKeys = await WeatherCalls.findExistingWeatherRecords(
                supabase, uniqueStationIds, dates
            )
            
            // Filter duplicates
            const newRecords = transformedRows.filter(row => {
                const key = `${row.Station_ID}:${row.Observation_Time}`
                return !existingKeys.has(key)
            })
            
            // Insert new records
            if (newRecords.length > 0) {
                const result = await WeatherCalls.insertWeatherRecords(supabase, newRecords)
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