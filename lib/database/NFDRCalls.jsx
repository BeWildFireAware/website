import { supabase } from "@/lib/supabase.ts";
import {
    NFDR_MAPPINGS,
    NFDR_NUMERIC_FIELDS
} from "@/lib/constants.jsx";

import { convertDateByFormat } from "@/lib/utils/formatDate.jsx";
import { Console } from "console";
//search for dups, insert to table
export class NFDRCalls {

    static async findExistingNFDRRecords(stationIds, dates) { //for duplicates

        if(!stationIds.length || !dates.length) return new Set()
        
        const { data, error } = await supabase 
            .from('NFDRRecords')
            .select('Station_ID, Observation_Time')
            .in('Station_ID', stationIds)
            .in('Observation_Time', dates)    
        if (error) {
            console.error('Error fetching existing NFDR records:', error)
            return new Set() //return empty set on error to prevent crash, will treat as no existing records
        }
        const existingDates = new Set() 
        data?.forEach(record => {
            const dateString = record.Observation_Time //expecting format '2026-01-20'
            existingDates.add(`${record.Station_ID}:${dateString}`) //add stationID:date to set for easy lookup
        })   
        return existingDates
    }


    //insert
    // /src/lib/database/models/nfdr.js

static async insertNFDRRecords(supabase, records) {
    console.log('Attempting to insert NFDR records:', {
        count: records.length,
        sample: records[0] // Log first record to see structure
    })
    
    if(!records.length) return { success: true, count: 0 }
    
    // Validate each record before insert
    const validatedRecords = records.map(record => {
        // Make sure all required fields are present
        const validated = {
            Station_ID: record.Station_ID,
            Observation_Time: record.Observation_Time,
            Fuel_Model: record.Fuel_Model || 'Y',
            NFDRType: record.NFDRType || null,
            OneHourFM: record.OneHourFM ?? null,
            TenHourFM: record.TenHourFM ?? null,
            HundredHourFM: record.HundredHourFM ?? null,
            ThousandHourFM: record.ThousandHourFM ?? null,
            IC: record.IC ?? null,
            KBDI: record.KBDI ?? null,
            SC: record.SC ?? null,
            ERC: record.ERC ?? null,
            BI: record.BI ?? null
        }
        
        // Log any missing required fields
        if (!validated.Station_ID) console.error('Missing Station_ID in record:', record)
        if (!validated.Observation_Time) console.error('Missing Observation_Time in record:', record)
        
        return validated
    })
    
    console.log('Validated records sample:', validatedRecords[0])
    
        const { data, error } = await supabase
            .from('NFDRRecords')
            .insert(validatedRecords)
            .select()
    
        if (error) 
            {
            console.error('Error inserting NFDR records:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            return { success: false, error: error.message }
        }
    
        console.log('Insert successful. Returned data:', {
            count: data?.length || 0,
            data: data // This should contain the inserted rows
        })
    
        return { 
            success: true, 
            count: validatedRecords.length, 
            data: data || [] 
        }
    }

    //transform(string to number, headers)
    static transformNFDRData(csvData, stationId) {
         let fuelModel = csvData.FuelModel || csvData.Fuel_Model || 'Y'
    
        // Ensure it's exactly 1 character
        if (fuelModel && fuelModel.length > 1) {
            fuelModel = fuelModel.charAt(0)
        }
        const dbRow = {
            Station_ID: stationId, //add station id to each record
            Observation_Time: convertDateByFormat(csvData.ObservationTime, 'MM/DD/YYYY'), //convert date format for db
            Fuel_Model: fuelModel,
            NFDRType: csvData.NFDRType || null
        }

        Object.entries(NFDR_MAPPINGS).forEach(([csvField, dbField]) => {
            if(dbField == 'Station_ID' || dbField == 'Observation_Time') return //already mapped

            const value = csvData[csvField]
            if(value === undefined || value === null || value === '') {
                dbRow[dbField] = null //handle missing values as null
                return
            }
            if(NFDR_NUMERIC_FIELDS.includes(dbField)) {
                const numericValue = parseFloat(value)
                dbRow[dbField] = isNaN(numericValue) ? null : numericValue
            } else {
                dbRow[dbField] = value
            }
        })
        return dbRow
    }
}