'use server'

// Import Supabase client for database operations
import { supabase } from '@/lib/supabase'

// Import form components for adding data
import AddDispatchForm from '../components/Dispatch/AddDispatchForm.jsx'
import AddFDRAForm from '../components/FDRA/AddFDRAForm.jsx'

// Import section components for displaying data
import DispatchAreasSection from '../components/Dispatch/DispatchAreasSection.jsx'
import FdraSection from '../components/FDRA/FdraSection.jsx'
import StatusSection from '../components/StatusSection.jsx'
import StationSection from '../components/Station/StationSection.jsx'

// Server action to add a new dispatch area to the database
export async function addDispatchArea(formData) {
  // Extract dispatch name from form data
  const dispatchName = formData.get('dispatchName')
  
  // Validate dispatch name is not empty
  if (!dispatchName || dispatchName.trim() === '') {
    return { error: 'Dispatch name is required' }
  }

  // Insert new dispatch area into Supabase database
  const { data, error } = await supabase
    .from('DispatchArea')
    .insert([{ DispatchName: dispatchName }])

  // Handle database error
  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

// Server action to add FDRA (Fire Danger Rating Area) data to the database
export async function addFDRAData(formData) {
  // Extract FDRA form fields
  const FDRAname = formData.get('FDRAname')
  const AVG_BI = formData.get('AVG_BI') // Build Index
  const AVG_ERC = formData.get('AVG_ERC') // Energy Release Component
  const Dispatch_ID = formData.get('Dispatch_ID')

  // Validate FDRA name
  if (!FDRAname || FDRAname.trim() === '') {
    return { error: 'FDRA name is required' }
  }

  // Validate BI (Build Index)
  if (AVG_BI === '' || AVG_BI === null ) {
    return { error: 'Valid BI is required' }
  }

  // Validate ERC (Energy Release Component)
  if (AVG_ERC === '' || AVG_ERC === null ) {
    return { error: 'Valid ERC is required' }
  }

  // Validate FDRA ID
  if (!Dispatch_ID || isNaN(Number(Dispatch_ID))) {
    return { error: 'Dispatch area is required' }
  }

  // Insert FDRA record into Supabase database
  const { data, error } = await supabase
    .from('FDRA')
    .insert([{ 
      FDRAname: FDRAname, 
      ...(AVG_BI && { AVG_BI: Number(AVG_BI) }),
      ...(AVG_ERC && { AVG_ERC: Number(AVG_ERC) }),
      Dispatch_ID: Number(Dispatch_ID) 
    }])

  // Handle database error
  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

/**
 * Main page component that fetches and displays wildfire data
 * Fetches dispatch areas and FDRA records from Supabase
 * Displays forms for adding new data and shows current data in cards
 */
export default async function Home() {
  // Fetch all dispatch areas from database
  // Fetch all dispatch areas from database
  const { data: dispatchData, error: dispatchError } = await supabase
    .from('DispatchArea')
    .select('Dispatch_ID, DispatchName')

  // Fetch all FDRA records from database
  const { data: fdraData, error: fdraError } = await supabase
    .from('FDRA')
    .select('FDRA_ID, FDRAname, AVG_BI, AVG_ERC, Dispatch_ID')

  const { data: stationData, error: stationError } = await supabase
    .from('StationRecord')
    .select('Record_ID, Station_ID, Station_Name, BI, ERC, FDRA_ID, NFDRType')
  
  // Debug logs (commented out)
  // console.log('DispatchArea data:', dispatchData)
  // console.log('DispatchArea error:', dispatchError)
  // console.log('FDRA data:', fdraData)
  // console.log('FDRA error:', fdraError)

  return (
    <main className="dashboard-container">
      {/* Add Dispatch Area Form Section */}
      <section className="add-dispatch-section">
        <h2 className="dashboard-heading">Add Dispatch Area</h2>
        <AddDispatchForm />
      </section>

      {/* Add FDRA Form */}
      <section className="add-fdra-section">
        <h2 className="dashboard-heading">Add FDRA</h2>
        <AddFDRAForm dispatchData={dispatchData} />
      </section>

      {/* Dispatch Areas Section */}
      <DispatchAreasSection dispatchData={dispatchData} dispatchError={dispatchError} />

      {/* FDRA Section */}
      <FdraSection fdraData={fdraData} fdraError={fdraError} />
      {/* Stations Section */}
      <StationSection stationData={stationData} stationError={stationError} />

      {/* Connection Status */}
      <StatusSection dispatchError={dispatchError} fdraError={fdraError} stationError={stationError} />
    </main>
  )
} 












// import DispatchAreasSection from './components/DispatchAreasSection'
// import FdraSection from './components/FdraSection'
// import StatusSection from './components/StatusSection'
// import type { DispatchArea, FDRARecord } from './types'







{/* --- IGNORE --- */}
/*


{/*      
      {/* ================= FDRA TABLE ================= 
      <section className="FDRA-section">
        <h2 className="dashboard-heading">FDRA Records</h2>
        
        {fdraError && (
          <div className="error-message">
            <p className="error-title">FDRA Error</p>
            <p className="error-body">{fdraError.message}</p>
          </div>
        )}

        {!fdraError && (
          <div>
            <p className="record-count">
              Total Records: {fdraData?.length ?? 0}
            </p>

            <div className="cards-grid">
              {fdraData?.map((fdra) => (
                <div key={fdra.FDRA_ID} className="area-card">
                  <h3 className="dashboard-subheading">
                    {fdra.FDRAname ?? 'Unnamed FDRA'}
                  </h3>
                  <p className="text-black">BI: {fdra.BI}</p>
                  <p className="text-black">ERC: {fdra.ERC}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FDRA Data Section       <section>
        <h2 className="dashboard-heading">FDRA Data</h2>
        
        {fdraError ? (
          <div className="error-message">
            <p className="error-title text-black">Error with FDRA table:</p>
            <p className="error-body">{fdraError.message}</p>
          </div>
        ) : (
          <div>
            <p className="text-black mb-2">Found {fdraData?.length || 0} FDRA records</p>
            
            {fdraData && fdraData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {fdraData[0] && Object.keys(fdraData[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fdraData.map((record: any, index: number) => (
                      <tr key={record.FDRA_ID || index}>
                        {Object.values(record).map((value: any, i: number) => (
                          <td key={i}>{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="warning-message">
                <p className="warning-text">FDRA table exists but has no data.</p>
              </div>
            )}
          </div>
        )}
      </section>
/*}

          </div>

          <div className={`status-card ${fdraError ? 'status-error' : 'status-success'}`}>
            <p className="font-medium text-black">FDRA Table:</p>
            <p className={`text-lg font-bold ${fdraError ? 'status-text-error' : 'status-text-success'}`}>
              {fdraError ? '❌ Error' : '✅ Connected'}
            </p>
            <p className="text-black">Records: {fdraData?.length || 0}</p>
            {fdraError && (
              <p className="text-sm text-red-600 mt-2">{fdraError.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Summary 
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 mt-8">
        <h2 className="dashboard-heading text-black">Data Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <p className="text-sm text-gray-600">Total Areas</p>
            <p className="text-2xl font-bold text-black">{dispatchData?.length || 0}</p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-gray-600">FDRA Records</p>
            <p className="text-2xl font-bold text-black">{fdraData?.length || 0}</p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-green-600">
              {dispatchError || fdraError ? 'Error' : 'Active'}
            </p>
          </div>
          <div className="summary-card">
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-lg font-semibold text-black">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
*/