'use client'

//DON'T USE STATION RECORD
//NFDRRECORDS AND WEATHER DATA RECORDS

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LineChart } from '@mui/x-charts/LineChart';

export default function FdraPage() {
  const pathname = usePathname()
  const id = pathname?.split('/fdra/')[1]
  const [data, setData] = useState(null)
  const [dailyAvgERC, setDailyAvgERC] = useState([])
  const [dailyAvgERC2018, setDailyAvgERC2018] = useState([])
  const [historicalDates, setHistoricalDates] = useState([])
  const [dates2018, setDates2018] = useState([])
  const [allDates, setAllDates] = useState([])
  const [next6Days, setNext6Days] = useState([])

  // Error states
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [fdraError, setFdraError] = useState(null)
  const [stationError, setStationError] = useState(null)
  const [nfdrError, setNfdrError] = useState(null)

  // Toggle this: set to a string like '2026-03-01' to use hardcoded, or null to use today
  const hardcodedDate = null

  const formatLocalDate = (date) => {
    const yr = date.getFullYear()
    const mo = String(date.getMonth() + 1).padStart(2, '0')
    const da = String(date.getDate()).padStart(2, '0')
    return `${yr}-${mo}-${da}`
  }

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setIsLoading(true)
      setErrorMessage('')
      
      try {
        const now = new Date()
        const currentYear = now.getFullYear()

        // 1. Pull FDRA data
        const { data: fdra, error: fdraError } = await supabase
          .from('FDRA')
          .select('FDRAname, AVG_BI, AVG_ERC, DispatchArea(DispatchName)')
          .eq('FDRA_ID', id)
          .single()

        if (fdraError) {
          console.error('FDRA Data Error:', fdraError);
          setErrorMessage('Unable to load Fire Danger Resource Assessments (FDRA). Please refresh the page or contact support if the issue persists.');
          setIsLoading(false);
          return;
        }

        // 2. Pull station IDs
        const { data: stationLinks, error: linkError } = await supabase
          .from('Station_FDRA_Combinations')
          .select('Station_ID')
          .eq('FDRA_ID', id)

        if (linkError){
          console.error('Station Link Data Error:', linkError);
          setErrorMessage('Unable to load station links for this FDRA. Please refresh the page or contact support if the issue persists.');
          setIsLoading(false);
          return;
        }

        const stationIds = stationLinks.map(s => s.Station_ID)

        if (!stationIds.length) {
          console.warn('No stations found for FDRA:', id)
          setErrorMessage('No stations found for this FDRA.');
          setIsLoading(false);
          return
        }

        // 3. Pull stations
        const { data: stations, error: stationError } = await supabase
          .from('Stations')
          .select('ID, Station_Name')
          .in('ID', stationIds)

        if (stationError){
          console.error('Station Data Error:', stationError);
          setErrorMessage('Unable to load station data for this FDRA. Please refresh the page or contact support if the issue persists.');
          setIsLoading(false);
          return;
        } 

        // 4. Pull NFDRRecords (CURRENT YEAR + NEXT 6 DAYS ✅)
        const todayStr = formatLocalDate(now)

        const futureDate = new Date()
        futureDate.setDate(now.getDate() + 6)
        const futureStr = formatLocalDate(futureDate)

        // ---------- CURRENT YEAR + FORECAST ----------
        const { data: nfdrRecords, error: nfdrError } = await supabase
          .from('NFDRRecords')
          .select(`
            Station_ID, Observation_Time,
            ERC, BI
          `)
          .in('Station_ID', stationIds)
          .gte('Observation_Time', `${currentYear}-01-01`)
          .lte('Observation_Time', futureStr)
        
        if (nfdrError){
          console.error('NFDRRecords Data Error:', nfdrError);
          setErrorMessage('Unable to load NFDR records for this FDRA. Please refresh the page or contact support if the issue persists.');
          setIsLoading(false);
          return;
        }

        // ---------- 2018 ONLY ----------
        const { data: nfdrRecords2018, error: nfdrError2018 } = await supabase
          .from('NFDRRecords')
          .select(`
            Station_ID, Observation_Time,
            ERC, BI
          `)
          .in('Station_ID', stationIds)
          .gte('Observation_Time', '2018-01-01')
          .lte('Observation_Time', '2018-12-31')

        // 2018 data is optional for comparison, don't fail if it's missing
        if (nfdrError2018){
          console.warn('NFDRRecords 2018 Data Error (non-critical):', nfdrError2018);
          // Continue without 2018 data instead of failing
        }

        // ---------- DEDUPE CURRENT ----------
        const uniqueMap = new Map()
        nfdrRecords.forEach(r => {
          const date = r.Observation_Time.slice(0, 10)
          const key = `${r.Station_ID}-${date}`

          const existing = uniqueMap.get(key)

          if (!existing || new Date(r.Observation_Time) > new Date(existing.Observation_Time)) {
            uniqueMap.set(key, r)
          }
        })

        const dedupedRecords = Array.from(uniqueMap.values())

        // ---------- DEDUPE 2018 ----------
        const uniqueMap2018 = new Map()
        if (nfdrRecords2018 && !nfdrError2018) {
          nfdrRecords2018.forEach(r => {
            const date = r.Observation_Time.slice(0, 10)
            const key = `${r.Station_ID}-${date}`

            const existing = uniqueMap2018.get(key)

            if (!existing || new Date(r.Observation_Time) > new Date(existing.Observation_Time)) {
              uniqueMap2018.set(key, r)
            }
          })
        }

        const dedupedRecords2018 = Array.from(uniqueMap2018.values())

        // ---------- DATE SETUP ----------
        const activeDateStr = hardcodedDate ?? todayStr

        const next6 = Array.from({ length: 6 }).map((_, i) => {
          const d = new Date(activeDateStr)
          d.setDate(d.getDate() + i + 1)
          return formatLocalDate(d)
        })

        const allDatesCombined = Array.from(
          new Set([activeDateStr, ...next6])
        )

        // GROUP CURRENT DATES
        const recordsByDate = {}
        dedupedRecords.forEach(r => {
          const date = r.Observation_Time.slice(0, 10)
          if (!recordsByDate[date]) recordsByDate[date] = []
          recordsByDate[date].push(r)
        })

        // GROUP 2018 DATES
        const recordsByDate2018 = {}
        dedupedRecords2018.forEach(r => {
          const date = r.Observation_Time.slice(0, 10)
          if (!recordsByDate2018[date]) recordsByDate2018[date] = []
          recordsByDate2018[date].push(r)
        })

        // TODAY
        const todayRecords = recordsByDate[activeDateStr] ?? []

        const calculatedAvgBI = todayRecords.length
          ? Number((todayRecords.reduce((s, r) => s + (r.BI ?? 0), 0) / todayRecords.length).toFixed(2))
          : null

        const calculatedAvgERC = todayRecords.length
          ? Number((todayRecords.reduce((s, r) => s + (r.ERC ?? 0), 0) / todayRecords.length).toFixed(2))
          : null

        // HISTORICAL (CURRENT YEAR ONLY)
        const histDates = []
        let d = new Date(currentYear, 0, 1)

        while (d.getFullYear() === currentYear) {
          histDates.push(formatLocalDate(d))
          d.setDate(d.getDate() + 1)
        }

        const avgERC = histDates.map(date => {
          const recs = recordsByDate[date]
          if (!recs?.length) return null

          const avg = recs.reduce((s, r) => s + (r.ERC ?? 0), 0) / recs.length
          return Number(avg.toFixed(2))
        })

        // HISTORICAL (2018) - only if we have data
        let avgERC2018Aligned = new Array(histDates.length).fill(null)
        
        if (dedupedRecords2018.length > 0) {
          const hist2018Dates = []
          let d2018 = new Date(2018, 0, 1)

          while (d2018.getFullYear() === 2018) {
            hist2018Dates.push(formatLocalDate(d2018))
            d2018.setDate(d2018.getDate() + 1)
          }

          const avgERC2018 = hist2018Dates.map(date => {
            const recs = recordsByDate2018[date]
            if (!recs?.length) return null

            const avg = recs.reduce((s, r) => s + (r.ERC ?? 0), 0) / recs.length
            return Number(avg.toFixed(2))
          })

          avgERC2018Aligned = histDates.map(date => {
            const monthDay = date.slice(5)
            const date2018 = `2018-${monthDay}`

            const index = hist2018Dates.indexOf(date2018)
            return index !== -1 ? avgERC2018[index] : null
          })
        }

        // MERGE
        const combinedRecords = []

        stations.forEach(station => {
          allDatesCombined.forEach(date => {
            const recs = (recordsByDate[date] ?? []).filter(
              r => r.Station_ID === station.ID
            )

            if (recs.length) {
              recs.forEach(r =>
                combinedRecords.push({ ...station, ...r, FDRA_ID: id })
              )
            } else {
              combinedRecords.push({
                ...station,
                Observation_Time: date,
                FDRA_ID: id
              })
            }
          })
        })

        // SET STATE
        setDailyAvgERC(avgERC)
        setHistoricalDates(histDates)
        setDailyAvgERC2018(avgERC2018Aligned)
        setNext6Days(next6)
        setAllDates(allDatesCombined)

        setData({
          ...fdra,
          StationRecord: combinedRecords,
          calculatedAvgBI,
          calculatedAvgERC
        })
        
      } catch (error) {
        console.error('Unexpected error:', error);
        setErrorMessage('An unexpected error occurred while loading the data. Please refresh the page or contact support if the issue persists.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [id])

  if(isLoading) {
    return <p style={{ color: 'white' }}>Loading data...</p>
  }

  if (errorMessage) {
    return <p style={{ color: 'red' }}>{errorMessage}</p>
  }


  if (!data) return <p>No Data Available</p>
  const todayStr = formatLocalDate(new Date())

  //Used for past sprint, might need to keep to show more data
  //const numericKeys = ['BI', 'ERC', 'OneHourFM', 'TenHourFM', 'HundredHourFM', 'ThousandHourFM', 'KBDI', 'SC', 'IC']

  //Hardcoded for now, will calculate in the future
  const percentile90 = historicalDates.map(() => 50)

  const chartDates = [...historicalDates, ...allDates]

  const forecastSeriesData = chartDates.map(date => {
    if (date < todayStr) return null

    const recs = (data?.StationRecord ?? []).filter(
      r => r.Observation_Time.slice(0, 10) === date && r.ERC != null
    )

    if (!recs.length) return null

    const avg = recs.reduce((s, r) => s + r.ERC, 0) / recs.length
    return Number(avg.toFixed(2))
  })

  return (
    <main>
      <h2 style={{ color: 'white' }}>
        Dispatch Area: {data?.DispatchArea?.DispatchName}
      </h2>

      <h2 style={{ color: 'white' }}>
        FDRA: {data?.FDRAname}
      </h2>

      <LineChart 
        height={400} 
        grid={{ horizontal: true }} 
        xAxis={[{ scaleType: 'point', data: chartDates, tickInterval: chartDates.filter(date => date.endsWith('-01')), valueFormatter: (value) => new Date(value + 'T00:00:00').toLocaleString('default', { month: 'short' }), }]} 
        series={[ 
          {
            label: `${new Date().getFullYear()} Observed Avg. ERC`,
            data: chartDates.map((date, i) => {
              if (date > todayStr) return null
              return dailyAvgERC[i] ?? null
            }),
            showMark: false,
            color: '#0072B2',
            valueFormatter: (value, context) => {
                if(value === null) return ''
              
                const date = chartDates[context.dataIndex]
                return `${date}: ${value}`
            }
          }, 
            {            
              label: 'Forecast ERC',
              data: forecastSeriesData,
              showMark: false,
              color: '#E69F00',
              valueFormatter: (value, context) => {
                if(value === null) return ''
              
                const date = chartDates[context.dataIndex]
                return `${date}: ${value}`
              }
            }, 
            { label: '90th Percentile ERC', 
              data: [...percentile90, ...Array(next6Days.length).fill(null)], 
              showMark: false, 
              color: '#CC79A7', 
              valueFormatter: (value, context) => { 
                const date = chartDates[context.dataIndex]
                return `${date}: ${value}`
              }
            },
            {
              label: '2018 Avg. ERC',
              data: chartDates.map((date, i) => {
                // Only plot for historical portion
                if (i >= historicalDates.length) return null
                return dailyAvgERC2018[i] ?? null
              }),
              showMark: false,
              color: '#009E73',
              valueFormatter: (value, context) => {
                if (value === null) return ''

                const date = chartDates[context.dataIndex]
                return `${date}: ${value}`
              }
            },
        ]} 
        slotProps={{ tooltip: { trigger: 'axis', }, }} 
        
        sx={{ 
              backgroundColor: '#333333',
              '& .MuiChartsAxis-line': { stroke: '#ffffff !important' }, 
              '& .MuiChartsAxis-tick': { stroke: '#ffffff' }, 
              '& .MuiChartsAxis-tickLabel': { fill: '#ffffff !important', fontWeight: 600 }, 
              '& .MuiChartsAxis-label': { fill: '#ffffff !important' }, 
              '& .MuiChartsLegend-label': { fill: '#ffffff !important', color: '#ffffff !important' }, 
              '& .MuiChartsGrid-line': { stroke: 'rgba(255,255,255,0.2)' }, 
              }} 
        />

      {allDates.map(date => {
        const records = data.StationRecord.filter(
          r => r.FDRA_ID === id &&
              r.Observation_Time.slice(0, 10) === date
        )

        return (
          <section key={date}>
            <h2>Station Records for {date}</h2>
            {records.length === 0 ? (
              <p>No records for this date.</p>
            ) : (
              <ul>
                {records.map((r, idx) => (
                  <li key={idx}>
                    {r.Station_Name ?? `Station ${r.Station_ID}`} — ERC: {r.ERC ?? 'N/A'}, BI: {r.BI ?? 'N/A'}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </main>
  )
}