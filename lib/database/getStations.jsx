import { supabase } from "@/lib/supabase.ts";
//group of functions to grab station info, map id->name for csv
export class grabStations {

    static async getAllStations(supabase) {
        const { data, error } = await supabase
            .from('Stations')
            .select('ID, Station_Name')

        if (error) {
            console.error('Error fetching stations:', error)
            throw error
        }
        return data || [] //return the retrieved data or empty array if no data
    }

    static async nameToIdMap(supabase){
        const stations = await this.getAllStations(supabase) //get all stations using this instance
        const nameToIdMap = {}
        stations.forEach(station => {
            if(station.Station_Name && station.ID) { //check if station name and ID exist
                nameToIdMap[station.Station_Name] = station.ID //map name to id
            }
        })
        return nameToIdMap    
    }
    //for NFDR data need fuel model

    static async getStationFuelModels() {
        // First, get all stations
        const { data: allStations, error: stationsError } = await supabase
            .from('Stations')
            .select('ID')
        
        if (stationsError) {
            console.error('Error fetching all stations:', stationsError)
            return {}
        }
        
        // Then get existing fuel models from records
        const { data: existingRecords, error: recordsError } = await supabase
            .from('NFDRRecords')
            .select('Station_ID, Fuel_Model')
            .order('Observation_Time', { ascending: false })
        
        if (recordsError) {
            console.error('Error fetching fuel models:', recordsError)
            return {}
        }
        
        // Create map with defaults for all stations
        const fuelModelMap = {}
        
        // First, set default 'Y' for ALL stations
        allStations.forEach(station => {
            fuelModelMap[station.ID] = 'Y'
        })
        
        // Then override with any existing fuel models from records
        existingRecords.forEach(record => {
            // Only override if we don't already have a fuel model for this station
            // or if we want to use the most recent
            if (record.Fuel_Model) {
                fuelModelMap[record.Station_ID] = record.Fuel_Model
            }
        })
        
        console.log(`Fuel model map created for ${Object.keys(fuelModelMap).length} stations`)
        return fuelModelMap
    }
    
    //group stations by fuel model, return {fuelModel: [stationId, stationId], fuelModel2: [stationId, etc]}
    static async groupStationsByFuelModel() {
        const fuelModelMap = await this.getStationFuelModels()
        
        const stationsByFuelModel = {} 
        
        Object.entries(fuelModelMap).forEach(([stationId, fuelModel]) => {
            if (!stationsByFuelModel[fuelModel]) {
                stationsByFuelModel[fuelModel] = []
            }
            stationsByFuelModel[fuelModel].push(stationId)
        })
        
        return stationsByFuelModel
    }







}