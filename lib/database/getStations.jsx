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
        // This is more complex - we need the latest record per station
        // For now, we can query NFDRRecords
        const { data, error } = await supabase
            .from('NFDRRecords')
            .select('Station_ID, Fuel_Model')
            .order('Observation_Time', { ascending: false }) //get most recent records first
        
        if (error) {
            console.error('Error fetching fuel models:', error)
            return {}
        }
        
        // Get unique station with most recent fuel model(expecting changes)
        const fuelModelMap = {}
        data.forEach(record => {
            if (!fuelModelMap[record.Station_ID] && record.Fuel_Model) {
                fuelModelMap[record.Station_ID] = record.Fuel_Model
            }
        })
        
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