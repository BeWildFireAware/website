//absolute path values for now
import { supabase } from '@/lib/supabase.ts' 

export class ForecastUpdate {
    
    static async updateObservedForecasts(transformedData, type) {
        //if date is less than today and Forecast, add to update list
        const today = new Date()
        const todaystring = today.toISOString().split('T')[0]

        let updatedCount = 0
        let skipped = 0
        let updatedRows = []
        
        if(type === 'NFDR') {
           
            
            // Get unique station IDs from transformed data
            const stationIds = [...new Set(transformedData.map(r => r.Station_ID))] // STEP 1: Find ALL forecast records in the DATABASE for these stations
            
            // Get all forecast records from database for these stations
            const { data: dbForecasts, error } = await supabase
                .from('NFDRRecords')
                .select('Record_ID, Station_ID, Observation_Time, Fuel_Model')
                .in('Station_ID', stationIds) 
                .lt('Observation_Time', todaystring) // less than
                .eq('NFDRType', 'F')
            
            if (error) {
                console.error('Error fetching NFDR forecasts:', error)
                return { updatedCount: 0, skipped: 0, updatedRows: [] }
            }
            
            console.log(`Found ${dbForecasts?.length || 0} NFDR forecast records in database to check`)
            
            // For each database forecast, find matching observed data in CSV
            for (const dbForecast of dbForecasts || []) {
                // Find matching observed row in transformedData
                const observedRow = transformedData.find(row => 
                    row.Station_ID === dbForecast.Station_ID &&
                    row.Observation_Time === dbForecast.Observation_Time &&
                    row.NFDRType === 'O'
                )
                
                if (observedRow) {
                    // Update the database record with observed data
                    const updated = await this.updateRecordToObserved(dbForecast, type, observedRow)
                    
                    if (updated) {
                        updatedCount++
                        // Find and mark the corresponding row in transformedData
                        const csvRow = transformedData.find(r => 
                            r.Station_ID === dbForecast.Station_ID &&
                            r.Observation_Time === dbForecast.Observation_Time
                        )
                        if (csvRow) {
                            csvRow.wasUpdated = true
                            updatedRows.push(csvRow)
                        }
                    } else {
                        skipped++
                    }
                }
            }
        }
        
        else if(type === 'Weather') {
            // Find ALL forecast records in the DB for past dates
            console.log('Looking for Weather forecast records in database...')
            
            const stationIds = [...new Set(transformedData.map(r => r.Station_ID))]
            
            const { data: dbForecasts, error } = await supabase
                .from('WeatherDataRecords')
                .select('Weather_ID, Station_ID, Observation_Time')
                .in('Station_ID', stationIds)
                .lt('Observation_Time', todaystring) // Only past dates
                .eq('Observation_Type', 'F')
            
            if (error) {
                console.error('Error fetching Weather forecasts:', error)
                return { updatedCount: 0, skipped: 0, updatedRows: [] }
            }
            
            console.log(`Found ${dbForecasts?.length || 0} Weather forecast records in database to check`)
            
            // For each database forecast, find matching observed data in CSV
            for (const dbForecast of dbForecasts || []) {
                const observedRow = transformedData.find(row => 
                    row.Station_ID === dbForecast.Station_ID &&
                    row.Observation_Time === dbForecast.Observation_Time &&
                    row.Observation_Type === 'O'
                )
                
                if (observedRow) {
                    const updated = await this.updateRecordToObserved(dbForecast, type, observedRow) //udpate row in db
                    
                    if (updated) {
                        updatedCount++
                        const csvRow = transformedData.find(r => 
                            r.Station_ID === dbForecast.Station_ID &&
                            r.Observation_Time === dbForecast.Observation_Time
                        )
                        if (csvRow) {
                            csvRow.wasUpdated = true
                            updatedRows.push(csvRow)
                        }
                    } else {
                        skipped++
                    }
                }
            }
        }
        
        console.log(`Updated ${updatedCount} records to observed, skipped ${skipped}`)
        return {
            updatedCount,
            skipped,
            updatedRows
        }
    }

    static async findPreviousForecasts(stationId, date, type) {
        // This function is now mostly replaced by the database query above
        // But keeping for backward compatibility
        if(type === 'NFDR') {
            const { data, error } = await supabase
                .from('NFDRRecords')
                .select('Record_ID, Station_ID, Observation_Time, Fuel_Model')
                .eq('Station_ID', stationId)
                .eq('Observation_Time', date)
                .eq('NFDRType', 'F')
                .maybeSingle() //ONLY ACCEPT 1 ROW, if multiple something is wrong with data integrity

            if (error) {
                console.error('Error fetching previous NFDR records:', error)
                return null
            }
            return data ? [data] : []  //return data if exists else []
        }
        else if(type === 'Weather') {
            const { data, error } = await supabase
                .from('WeatherDataRecords')
                .select('Weather_ID, Station_ID, Observation_Time')
                .eq('Station_ID', stationId)
                .eq('Observation_Time', date)
                .eq('Observation_Type', 'F')
                .maybeSingle()

            if(error) {
                console.error('Error fetching previous Weather records:', error)
                return null
            }
            return data ? [data] : []
        }
    }

    static async updateRecordToObserved(existingRecord, type, newData) {

        //make copy of data not pointer
        const updatedData = {...newData}
        
        //delete keys(doesnt need update), we do need recordID to be able to update it so dont delete that
        delete updatedData.Station_ID
        delete updatedData.Observation_Time

        if(type === 'NFDR') {
            delete updatedData.Fuel_Model
            updatedData.NFDRType = 'O'

            const {error} = await supabase
                .from('NFDRRecords')
                .update(updatedData)
                .eq('Record_ID', existingRecord.Record_ID)
            
            if(error) {
                console.error('Error updating NFDR record:', error)
                return false
            }   
            console.log(`Updated NFDR record for Station ${existingRecord.Station_ID} on ${existingRecord.Observation_Time}`)
            return true 
        }

        else if(type === 'Weather') {
            updatedData.Observation_Type = 'O'
            
            const {error} = await supabase
                .from('WeatherDataRecords')  
                .update(updatedData)
                .eq('Weather_ID', existingRecord.Weather_ID)
            
            if(error) {
                console.error('Error updating Weather record:', error)
                return false
            }
            console.log(`Updated Weather record for Station ${existingRecord.Station_ID} on ${existingRecord.Observation_Time}`)
            return true
        }
    }
}