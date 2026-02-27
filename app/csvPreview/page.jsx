import { buildCsvStoreData } from '../components/fetchData'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { importService} from '@/lib/database/ImportDataService.jsx'
// Define which columns to display
const COLUMNS_TO_SHOW = ['StationName','BI','ERC','ObservationTime','NFDRType', 'Fuel_Model']

// Server component that displays CSV data directly
export default async function CsvPreviewPage({ searchParams }) {
  // Fetch CSV data from the server
  const { rows, columnNames, summary } = await importService.runDailyImport() //fetch and import data, return rows for preview and summary of import results
  // Fetch dispatch areas for the select menu
  // const { data: FDRA } = await supabase
  //   .from('FDRA')
  //   .select('FDRA_ID, FDRAname')
  //   .order('FDRAname')

  // Display first 10 rows
  //const displayRows = rows.slice(0, 10)
}  