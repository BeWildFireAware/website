'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FdraPage() {
  const pathname = usePathname()
  const id = pathname?.split('/fdra/')[1]
  const [data, setData] = useState(null)

  const todayStr = '2026-03-01'

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      console.log('Fetching FDRA ID:', id)

      // Get FDRA + DispatchArea
      const { data: fdra, error: fdraError } = await supabase
        .from('FDRA')
        .select('FDRAname, DispatchArea ( DispatchName )')
        .eq('FDRA_ID', id)
        .single()
      if (fdraError) console.error('FDRA error:', fdraError)
      console.log('FDRA data:', fdra)

      console.log('Using hard-coded date for debugging:', todayStr)

      // Fetch StationRecords
      const { data: stationRecords, error: stationError } = await supabase
        .from('StationRecord')
        .select('Station_ID, BI, ERC, Observation_Time, FDRA_ID, Station_Name')
        .eq('Observation_Time::date', todayStr)
      if (stationError) console.error('StationRecord error:', stationError)

      // Fetch NFDRRecords
      const { data: nfdrRecords, error: nfdrError } = await supabase
        .from('NFDRRecords')
        .select(`
          Station_ID, Observation_Time, Fuel_Model, NFDRType,
          OneHourFM, TenHourFM, HundredHourFM, ThousandHourFM,
          IC, KBDI, SC, ERC, BI
        `)
        .eq('Observation_Time::date', todayStr)
      if (nfdrError) console.error('NFDRRecords error:', nfdrError)

      // Fetch Stations table to fill missing names/FDRA_ID (MAY NEED TO REMOVE LATER ON)
      const stationNames = [...new Set(stationRecords.map(r => r.Station_Name).filter(Boolean))]
      const { data: stations, error: stationsError } = await supabase
        .from('Stations')
        .select('ID, Station_Name, FDRA_ID')
        .in('Station_Name', stationNames)
      if (stationsError) console.error('Stations table error:', stationsError)
      const stationMap = Object.fromEntries(stations.map(s => [s.Station_Name, s]))

      // Merge data
      const seen = new Set()
      const combinedRecords = stationRecords
        .map(r => {
          const stationInfo = stationMap[r.Station_Name]
          return {
            ...r,
            FDRA_ID: r.FDRA_ID ?? stationInfo?.FDRA_ID ?? null
          }
        })
        .filter(r => {
          const key = `${r.Station_Name}_${r.Observation_Time}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map(r => {
          // Merge NFDRRecord if exists
          const nfdr = nfdrRecords.find(
            n => n.Station_ID === r.Station_ID && n.Observation_Time === r.Observation_Time
          )
          return { ...r, ...nfdr } // BI/ERC etc. will overwrite if needed
        })

      setData({
        ...fdra,
        StationRecord: combinedRecords
      })
    }

    fetchData()
  }, [id])

  if (!data) return <p>Loading...</p>

  const records = data.StationRecord.filter(r => r.FDRA_ID === parseInt(id, 10))

  // Numeric keys to average
  const numericKeys = ['BI', 'ERC', 'OneHourFM', 'TenHourFM', 'HundredHourFM', 'ThousandHourFM', 'KBDI', 'SC', 'IC']

  const calcAvg = (key) => {
    const values = records.map(r => Number(r[key])).filter(v => !isNaN(v))
    return values.length ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2) : '-'
  }

  return (
    <main>
      <h2>Dispatch Area</h2>
      <p>{data.DispatchArea?.DispatchName}</p>

      <h2>FDRA</h2>
      <p>{data.FDRAname}</p>

      <h2>Station Records for {todayStr}</h2>
      {records.length === 0 && <p>No station records for this FDRA on this date.</p>}

      {records.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Station</th>
              {numericKeys.map(k => (
                <th key={k} style={{ border: '1px solid #ccc', padding: '4px' }}>{k}</th>
              ))}
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Fuel Model</th>
              <th style={{ border: '1px solid #ccc', padding: '4px' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r.Station_Name ?? 'Unnamed'}</td>
                {numericKeys.map(k => (
                  <td key={k} style={{ border: '1px solid #ccc', padding: '4px' }}>{r[k] ?? '-'}</td>
                ))}
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r.Fuel_Model ?? '-'}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{r.Observation_Time}</td>
              </tr>
            ))}
            {/* Summary row with averages */}
            <tr style={{ fontWeight: 'bold', background: '#258a43' }}>
              <td style={{ border: '1px solid #ccc', padding: '4px' }}>Averages</td>
              {numericKeys.map(k => (
                <td key={k} style={{ border: '1px solid #ccc', padding: '4px' }}>{calcAvg(k)}</td>
              ))}
              <td style={{ border: '1px solid #ccc', padding: '4px' }}>-</td>
              <td style={{ border: '1px solid #ccc', padding: '4px' }}>-</td>
            </tr>
          </tbody>
        </table>
      )}
    </main>
  )
}