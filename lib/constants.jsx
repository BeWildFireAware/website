//url constants
export const BASE_WEATHER_CSV_URL = 'https://fems.fs2c.usda.gov/api/climatology/download-wx-daily-summary/?dataset=all'
export const BASE_NFDR_URL = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all'

//column mappings from csv to db
export const NFDR_MAPPINGS = {
    'StationName': 'Station_Name',  
    'BI': 'BI',
    'ERC': 'ERC',
    'ObservationTime': 'Observation_Time',
    'NFDRType': 'NFDRType',
    'fuel_model': 'Fuel_Model',
    '1HrFM': 'OneHourFM',
    '10HrFM': 'TenHourFM',
    '100HrFM': 'HundredHourFM',
    '1000HrFM': 'ThousandHourFM',
    'IC': 'IC',
    'SC': 'SC',
    'KBDI': 'KBDI'
}
export const WEATHER_MAPPINGS = {
    'StationName': 'Station_Name',
		'TemperatureMin(F)': 'Temp_Min',
		'TemperatureMax(F)': 'Temp_Max',
		'RelativeHumidityMin(%)': 'Relative_Humidity_Min',
		'RelativeHumidityMax(%)': 'Relative_Humidity_Max',
		'WindSpeedMax(mph)': 'Wind_Speed_Max',
		'GustDirection(degrees)': 'Gust_Direction',
		'Precipitation24hr(in)': 'Precipitation24hr',
        'Date': 'Observation_Time',
        'DailySnowFlag': 'Snow_Flag',
        'GustDirectionMaxTime(hh)': 'Gust_Direction_Max_Time',
        'MaxSolarRadiation(W/m2)': 'Max_Solar_Radiation',
}
// Define which fields are numeric (need conversion from strings in csv)
export const NFDR_NUMERIC_FIELDS = [
    'OneHourFM',
    'TenHourFM',
    'HundredHourFM',
    'ThousandHourFM',
    'IC',
    'KBDI',
    'SC',
    'ERC',
    'BI'
]

export const WEATHER_NUMERIC_FIELDS = [
    'Temp_Min',
    'Temp_Max',
    'Relative_Humidity_Min',
    'Relative_Humidity_Max',
    'Wind_Speed_Max',
    'Gust_Direction',
    'Gust_Speed',
    'Gust_Direction_Max_Time',
    'Precipitation24hr',
    'Max_Solar_Radiation'
]

// Define boolean fields
export const WEATHER_BOOLEAN_FIELDS = [
    'Snow_Flag'
]


//date format(declare once, use everywhere), so far not useful
export const DATE_FORMATS = {
    CSV_DATE: 'MM/DD/YYYY', //format of date in csv files
    DB_DATE: 'YYYY-MM-DD', //format of date in database, should match CSV_DATE for easy comparison
}