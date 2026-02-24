import { buildCsvStoreData } from '../components/fetchData'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

// Define which columns to display
const COLUMNS_TO_SHOW = ['StationName','BI','ERC','ObservationTime','NFDRType', 'Fuel_Model']

// Server component that displays CSV data directly
export default async function CsvPreviewPage({ searchParams }) {
  // Fetch CSV data from the server
  const { rows, columnNames, summary } = await buildCsvStoreData()
  // Fetch dispatch areas for the select menu
  // const { data: FDRA } = await supabase
  //   .from('FDRA')
  //   .select('FDRA_ID, FDRAname')
  //   .order('FDRAname')

  // Display first 10 rows
  const displayRows = rows.slice(0, 10)

  const params = await searchParams
  const successMessage = params?.success
  const errorMessage = params?.error

  return (
    <main className="dashboard-container">
      <h1 className="dashboard-heading">CSV Preview</h1>
      <p className="record-count">Showing {displayRows.length} rows</p>

      {/* Display success or error messages from URL parameters */}
      {successMessage && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>{successMessage}</p>
      )}
      {errorMessage && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>
      )}

      {/* Click to save selected columns into the database
      <form action={saveCsvToDb}>
        <label>
          FDRA Area:&nbsp;
          <select name="fdraID" defaultValue="">
            <option value="">Select one</option>
            {FDRA?.map((area) => (//grab key and name for dropdown
              <option key={area.FDRA_ID} value={area.FDRA_ID}>
                {area.FDRAname}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Save selected columns to database</button>
      </form> */}

      {/* Display CSV data as cards */}
      <div className="csv-container">
        {/* Map through each row and create a card */}
        {displayRows.map((row, index) => (//make new array with only selected columns
          <div key={index} className="csv-card">
            {/* Display only selected columns */}
            {COLUMNS_TO_SHOW.map((col) => (
              <div key={col} className="csv-row">
                <strong>{col}:</strong> {String(row[col])}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}





// // Server action: save selected CSV columns into FDRA table
// async function saveCsvToDb(formData) {
//   'use server'
  
//   // Get FDRA from form data
//   const fdraID = formData.get('fdraID')
//   const fdraIDNumber = fdraID ? Number(fdraID) : null
//   if (!fdraIDNumber || Number.isNaN(fdraIDNumber)) {
//     redirect('/csvPreview?error=Please select a dispatch area')//re route with error
//   }

//   // Fetch CSV data from fetchData.jsx function
//   const { rows } = await getCsvData()
  
//   // debugging logs
//   let totalBI = 0
//   let totalERC = 0
//   let count = 0
//   let processedCount = 0
//   let insertedCount = 0
//   let insertErrorCount = 0
//   let skippedMissing = 0
//   let skippedNoData = 0
//   let skippedDuplicate = 0
//   for (const row of rows) {
//     // Skip rows missing match keys
//     processedCount += 1

//     if (!row.StationId || !row.StationName) {
//       console.log('Skipping row - missing StationId or StationName:', row)
//       skippedMissing += 1
//       continue
//     }

//     // Extract individual column values
//     const biValue = row.BI
//     const ercValue = row.ERC
    
//     // Convert to numbers if valid
//     const bi = biValue && biValue !== '' ? Number(biValue) : null
//     const erc = ercValue && ercValue !== '' ? Number(ercValue) : null

//     console.log('Processing row:', { StationId: row.StationId, StationName: row.StationName, bi, erc, ObservationTime: row.ObservationTime })

//     // Skip if no data to save
//     if (bi === null && erc === null) {
//       console.log('Skipping - no BI or ERC data')
//       skippedNoData += 1
//       continue
//     }

//     // Skip if Station_ID + ObservationTime already exists
//     const { data: existingRecord } = await supabase
//       .from('StationRecord')
//       .select('Record_ID')
//       .eq('Station_ID', Number(row.StationId))
//       .eq('Observation_Time', row.ObservationTime)
//       .maybeSingle()

//     if (existingRecord) {
//       console.log('Skipping - duplicate Station_ID + ObservationTime')
//       skippedDuplicate += 1
//       continue
//     }

    
//     // if we're inserting an F row, remove any previous F entry with the same station/time
//     if (row.NFDRType === 'F') {
//       const { data: deleteData, error: deleteError } = await supabase
//         .from('StationRecord')
//         .delete()
//         .eq('Station_ID', Number(row.StationId))
//         .eq('Observation_Time', row.ObservationTime)
//         .eq('NFDRType', 'F')

//       if (deleteError) {
//         console.log('Error deleting existing record:', deleteError)
//       } else if (deleteData && deleteData.length > 0) {
//         console.log(
//           'Deleted existing record(s) with same Station_ID + ObservationTime + NFDRType=F:',
//           deleteData
//         )
//       }
//     }


//     // Insert each row (duplicates allowed)
//     const { data: insertData, error: insertError } = await supabase
//       .from('StationRecord')
//       .insert([{
//         Station_ID: Number(row.StationId),
//         FDRA_ID: fdraIDNumber,
//         Station_Name: row.StationName,
//         BI: bi,
//         ERC: erc,
//         Observation_Time: row.ObservationTime,
//         NFDRType: row.NFDRType
//       }])
    
//     console.log('Insert result:', insertData, 'Error:', insertError)
//     if (!insertError) {
//       insertedCount += 1
//     } else {
//       insertErrorCount += 1
//       console.log('Insert error details:', insertError)
//     }

//     totalBI += bi
//     totalERC += erc 
//     count +=1

//     if(count>0){
//       const AVG_BI = totalBI / count
//       const AVG_ERC = totalERC / count

//       await supabase
//         .from('FDRA')
//         .update({ AVG_BI, AVG_ERC })
//         .eq('FDRA_ID', fdraIDNumber)
//     }
    
//   }
  
//   console.log('Summary:', {
//     totalRows: rows.length,
//     processedCount,
//     insertedCount,
//     insertErrorCount,
//     skippedMissing,
//     skippedNoData,
//     skippedDuplicate,
//   })

//   if (insertErrorCount > 0) {
//     redirect('/csvPreview?error=Some rows failed to save')
//   }

//   redirect('/csvPreview?success=Data saved successfully!')
// }
