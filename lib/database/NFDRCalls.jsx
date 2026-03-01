import { supabase } from "@/lib/supabase.ts";
import {
    NFDR_MAPPINGS,
    NFDR_NUMERIC_FIELDS
} from "@/lib/constants.jsx";

import { convertDateByFormat } from "@/lib/utils/formatDate.jsx";

//search for dups, insert to table

export class NFDRCalls { //group of functons



    static async findExistingNFDRRecords(supabase, stationIds, dates, fuelModels) { //will probably need to add fuel models infuture if they can change,
        if(!stationIds.length || !dates.length) return new Set()

        // We need to check exact combinations of Station_ID + Observation_Time + Fuel_Model
        const { data, error } = await supabase 
            .from('NFDRRecords')
            .select('Station_ID, Observation_Time, Fuel_Model')
            .in('Station_ID', stationIds)
            .in('Observation_Time', dates) //dates to check for

        if (error) {
            console.error('Error fetching existing NFDR records:', error)
            return new Set()
        }

        const existingKeys = new Set() 
        data?.forEach(record => {  //if record exists loop though, create key
            const key = `${record.Station_ID}:${record.Observation_Time}:${record.Fuel_Model}` 
            existingKeys.add(key)
        })   

        console.log(`Found ${existingKeys.size} existing record combinations`)
        return existingKeys //all existing combinations in db
    }

    // Before inserting, check against database one more time, not used currently, may be useful for testing later?
    static async validateRecordsBeforeInsert(supabase, records) {
        // Group by station for efficient querying
        const recordsByStation = {}
        records.forEach(record => {
            if (!recordsByStation[record.Station_ID]) {
                recordsByStation[record.Station_ID] = []
            }
            recordsByStation[record.Station_ID].push(record)
        })
        
        const validRecords = []
        
        for (const [stationId, stationRecords] of Object.entries(recordsByStation)) {
            const dates = stationRecords.map(r => r.Observation_Time)
            const fuelModels = stationRecords.map(r => r.Fuel_Model)
            
            // Query existing records for this station
            const { data: existing } = await supabase
                .from('NFDRRecords')
                .select('Observation_Time, Fuel_Model')
                .eq('Station_ID', stationId)
                .in('Observation_Time', dates)
            
            // Create set of existing combinations
            const existingCombos = new Set()
            existing?.forEach(record => {
                existingCombos.add(`${record.Observation_Time}:${record.Fuel_Model}`)
            })
            
            // Filter records
            stationRecords.forEach(record => {
                const combo = `${record.Observation_Time}:${record.Fuel_Model}`
                if (!existingCombos.has(combo)) {
                    validRecords.push(record)
                } else {
                    console.log(`Duplicate prevented: Station ${stationId}, Date ${record.Observation_Time}, Fuel ${record.Fuel_Model}`)
                }
            })
        }
        
        return validRecords
    }


    //insert
    // /src/lib/database/models/nfdr.js

    static async insertNFDRRecords(supabase, records) {
        console.log(`📝 Attempting to insert ${records.length} NFDR records`)
        
        if(!records.length) return { success: true, count: 0 }
        
        // Log what we're about to insert
        const keysToInsert = records.map(r => 
            `${r.Station_ID}:${r.Observation_Time}:${r.Fuel_Model}`
        )
        console.log('Keys to insert:', keysToInsert.slice(0, 5))
        
        const { data, error } = await supabase
            .from('NFDRRecords')
            .insert(records)
            .select()
        
        if (error) {
            // Check for unique constraint violation
            if (error.code === '23505') { // PostgreSQL violation code for unqie constraint, kept happening
                console.error('Unique constraint violation:', { message: error.message,details: error.details})
                
                // Try to identify which records caused the violation
                // Insert one by one to find problematic records, for debugging, not efficient for large batches but helps identify issues
                const successfulInserts = []
                const failedInserts = []


                //will need refactor for larger batches, but for now this will help identify which records are causing duplicates or other issues
                for (const record of records) {
                    const { error: rnumError } = await supabase
                        .from('NFDRRecords')
                        .insert(record)
                        .select()
                    
                    if (rnumError) { //if error with individual record, check if it's duplicate or other error
                        if (rnumError.code === '23505') {
                            console.log('Duplicate skipped:', `${record.Station_ID}:${record.Observation_Time}:${record.Fuel_Model}`)
                            failedInserts.push(record) //add failed lines
                        } else {
                            console.error('Other error:', rnumError)
                        }
                    } else {
                        successfulInserts.push(record)
                    }
                }
                
                return {  //fix output in future (reminants of testing/debugging)
                    success: true, 
                    count: successfulInserts.length,
                    failed: failedInserts.length,
                    note: `${successfulInserts.length} inserted, ${failedInserts.length} duplicates skipped`
                }
            }
            
            console.error('Error inserting NFDR records:', error)
            return { success: false, error: error.message }
        }
        
        console.log(`Successfully inserted ${data?.length || 0} records`)
        return { success: true, count: data?.length || 0, data }
    }

    //transform(string to number, headers)
    static transformNFDRData(csvData, stationId) {
        // Allowed columns in NFDRRecords table (excluding those i set manually)
        const ALLOWED_DB_FIELDS = new Set([ //all numeric fields (string to float or int)
            'OneHourFM', 'TenHourFM', 'HundredHourFM', 'ThousandHourFM',
            'IC', 'KBDI', 'SC', 'ERC', 'BI', 'NFDRType'
        ]);

        // Set Fuel_Model with default
        let fuelModel = csvData.FuelModel || csvData.Fuel_Model || 'Y';
        if (fuelModel && fuelModel.length > 1) fuelModel = fuelModel.charAt(0);

        const dbRow = {
            Station_ID: stationId,
            Observation_Time: convertDateByFormat(csvData.ObservationTime, 'MM/DD/YYYY'),
            Fuel_Model: fuelModel,
            NFDRType: csvData.NFDRType || null
        };

        Object.entries(NFDR_MAPPINGS).forEach(([csvField, dbField]) => { //get constant mapping of csv to db fields, loop through each field in csv
            // Skip fields we already set or that are not allowed
            if (dbField === 'Station_ID' || dbField === 'Observation_Time' || dbField === 'Fuel_Model') return;
            if (!ALLOWED_DB_FIELDS.has(dbField)) return; // Ignore unknown columns (like Station_Name)

            const value = csvData[csvField];
            if (value === undefined || value === null || value === '') {
                dbRow[dbField] = null;
                return;
            }
            if (NFDR_NUMERIC_FIELDS.includes(dbField)) {
                const numericValue = parseFloat(value);
                dbRow[dbField] = isNaN(numericValue) ? null : numericValue; // Convert to number, set to null if conversion fails
            } else {
                dbRow[dbField] = value; // For NFDRType (string)
            }
        });

        return dbRow;
    }
}