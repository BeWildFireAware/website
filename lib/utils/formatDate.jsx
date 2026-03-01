//utlis are used for simple functions to be used elsewhere(many places)
//functions to format date as YYYY-MM-DD for db/csv queries, duplicates

export function formattedDate(date) { //will need future refactor for forecast data dates only
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}
export function getDateRange(){ //return start and end date for csv query, ex: 2026-01-01 to 2026-01-31
    const today = new Date()
    //const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstOfMonth = new Date(today)
    firstOfMonth.setDate(today.getDate() - 30) //get data for last 30 days, can adjust as needed
    return {
        startDate: formattedDate(firstOfMonth),
        endDate: formattedDate(today)
    }
}

//functions to convert date formats, in csv mm/dd/yyy in db and csv calls use yyyy-mm-dd,
export function convertDateFormat(dateString) {
    if(!dateString || !dateString.includes('/')) return dateString // if not existing or in correct format, no need to format
    const [month, day, year] = dateString.split('/')
    return `${year}-${month}-${day}`
}
export function convertDateByFormat(dateString, format) {
    if(format === 'MM/DD/YYYY') {
        return convertDateFormat(dateString)
    }
    return dateString //if already in correct format, return as is
}

