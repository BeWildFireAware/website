// const CSV_URL = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all&startDate=2026-01-20&endDate=2026-02-21&dataFormat=csv&stationIds=52812,54704,54702,52813&fuelModels=Y'

// // Pairs of StationId and StationName for high elevation stations
// const highElevationPairs = [
// 	['54702', 'LUJAN'],
// 	['52813', 'HUNTSMAN MESA'],
// 	['52812', 'TAYLOR PARK'],
// 	['54704', 'NEEDLE CREEK'],
// ]

const baseCSV = 'https://fems.fs2c.usda.gov/api/ext-climatology/download-nfdr-daily-summary/?dataset=all'

//get date
function formatedDate(date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

//build the CSV URL with date range and station IDs
function buildCsvUrl() {
	//end date = current date
	//start date = first of month
	const today = new Date()
	const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
	const startDate= formatedDate(firstOfMonth)
	const endDate = formatedDate(today)
	const fuelModels = 'Y'
	const stationIds = '52812,54704,54702,52813'
	return `${baseCSV}&startDate=${startDate}&endDate=${endDate}&dataFormat=csv&stationIds=${stationIds}&fuelModels=${fuelModels}`
}


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

