import { supabase } from "@/lib/supabase.ts";
import {
    WEATHER_MAPPINGS,
    WEATHER_NUMERIC_FIELDS
} from "@/lib/constants.jsx";
import { convertDateByFormat } from "@/lib/utils/formatDate.jsx";
import { WEATHER_BOOLEAN_FIELDS } from "../constants";

export class WeatherCalls {
    static async findExistingWeatherRecords(stationIds, dates) { //for duplicates
        if(!stationIds.length || !dates.length) return new Set()
        
        const { data, error } = await supabase 
            .from('WeatherDataRecords')
            .select('Station_ID, Observation_Time')
            .in('Station_ID', stationIds)
            .in('Observation_Time', dates)
        if (error) {
            console.error('Error fetching existing weather records:', error)
            return new Set() //return empty set on error to prevent crash, will treat as no existing records
        }
        const existingDates = new Set()
        data?.forEach(record => { //if data exists, loop through and add stationID:date to set for easy lookup of existing records when filtering new data before insert
            const dateString = record.Observation_Time //expecting format '2026-01-20'
            existingDates.add(`${record.Station_ID}:${dateString}`) //add stationID:date to set for easy lookup
        })    
        return existingDates
    }

    static async insertWeatherRecords(records) {
        if(!records.length) return { success: true,count: 0 }
        const { data, error } = await supabase
            .from('WeatherDataRecords')
            .insert(records)
            .select() //supabase specific, return inserted rows for data instead of empty
        if (error) {
            console.error('Error inserting weather records:', error)
            return { success: false, error: error.message }
        }    
        return { success: true, count: records.length, data } //return count of inserted records
    }


    static transformWeatherData(csvData, stationId) {
        const dbRow = {
            Station_ID: stationId, //add station id to each record
            Observation_Time: convertDateByFormat(csvData.Date, 'MM/DD/YYYY'), //convert date format for db
            Snow_Flag: csvData.DailySnowFlag === '1' ? true : false, //convert to boolean
            Observation_Type: csvData.ObservationType || 'O' //default to 'O' for observed if not provided
        }
        
        Object.entries(WEATHER_MAPPINGS).forEach(([csvField, dbField]) => {
            if(dbField == 'Station_ID' || dbField == 'Observation_Time' || dbField == 'Snow_Flag' || dbField == 'Observation_Type') return //already mapped

            const value = csvData[csvField]
            if(value === undefined || value === null || value === '') {
                dbRow[dbField] = null //set missing values to null for db
                return
            }
            if(WEATHER_NUMERIC_FIELDS.includes(dbField)) {
                const num = parseFloat(value) //convert numeric fields to numbers
                dbRow[dbField] = isNaN(num) ? null : num
            }
            else if(WEATHER_BOOLEAN_FIELDS.includes(dbField)) {
                dbRow[dbField] = value === '1' ? true : false //convert to boolean
            }  
            else{
                dbRow[dbField] = value //keep as string
            } 
        })
        return dbRow
    }        
}    
