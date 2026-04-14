'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [dispatchData, setDispatchData] = useState([])
  const [fdraData, setFdraData] = useState([])
  const [dispatchError, setDispatchError] = useState(null)
  const [fdraError, setFdraError] = useState(null)
  const [selectedDispatch, setSelectedDispatch] = useState(null)

  // Fetch DispatchArea data
  useEffect(() => {
    const fetchDispatch = async () => {
      const { data, error } = await supabase
        .from('DispatchArea')
        .select('Dispatch_ID, DispatchName')
      setDispatchData(data ?? [])
      setDispatchError(error)
    }
    fetchDispatch()
  }, [])

  // Fetch FDRA data
  // Fetch FDRA data
  useEffect(() => {
    const fetchFdra = async () => {
      const { data, error } = await supabase
        .from('FDRA')
        .select('FDRA_ID, FDRAname, AVG_BI, AVG_ERC, Dispatch_ID') // <-- add Dispatch_ID
      setFdraData(data ?? [])
      setFdraError(error)
    }
    fetchFdra()
  }, [])

  // Filtered DispatchArea JSX
  const renderDispatchCards = () => {
  if (dispatchError) return <p>Error loading Dispatch Areas: {dispatchError.message}</p>
  if (!selectedDispatch) return <p>Please select a Dispatch Area.</p>

  const filtered = dispatchData.filter(area => area.Dispatch_ID == selectedDispatch)
  if (filtered.length === 0) return <p>No Dispatch Area found for this ID</p>

  return (
    <div className="cards-grid">
      {filtered.map(area => (
        <div key={area.Dispatch_ID} className="area-card">
          <h3 className="dashboard-subheading">{area.DispatchName ?? 'Unnamed Area'}</h3>
          <p>Dispatch ID: {area.Dispatch_ID}</p>
        </div>
      ))}
    </div>
  )
}

  return (
    <main className="dashboard-container">
      {/* Dispatch Areas */}
      <section className="DispatchArea-section">
        <h2 className="dashboard-heading">Dispatch Areas</h2>
        <button onClick={() => setSelectedDispatch(1)}>Montrose</button>
        <button onClick={() => setSelectedDispatch(2)}>Grand Junction</button>
        <button onClick={() => setSelectedDispatch(3)}>Durango</button>

        {renderDispatchCards()}
      </section>

      {/* FDRA Records */}
        <section className="FDRA-section">
          <h2 className="dashboard-heading">FDRA Records</h2>

          {fdraError ? (
            <div className="error-message">
              <p className="error-title">FDRA Error:</p>
              <p className="error-body">{fdraError.message}</p>
            </div>
          ) : !selectedDispatch ? (
            <p>Please select a Dispatch Area to see FDRA records.</p>
          ) : (
            <div className="cards-grid">
            {fdraData
              .filter(fdra => fdra.Dispatch_ID == selectedDispatch)
              .map(fdra => (
                <div key={fdra.FDRA_ID} className="area-card">
                  <h3 className="dashboard-subheading">{fdra.FDRAname ?? 'Unnamed FDRA'}</h3>
                  <p>BI: {fdra.AVG_BI}</p>
                  <p>ERC: {fdra.AVG_ERC}</p>
                </div>
            ))}
          </div>
          )}
        </section>
    </main>
  )
}