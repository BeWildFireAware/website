'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LineChart } from '@mui/x-charts/LineChart';
import Link from "next/link";
import { getBreakpoints } from '@/app/actions/breakpointActions';

const DANGER_LEVELS = ['Low', 'Moderate', 'High', 'Very High', 'Extreme'];

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
  const [breakpoints, setBreakpoints] = useState([])
  const [useBi, setUseBi] = useState(false)

  // Toggle this: set to a string like '2026-03-01' to use hardcoded, or null to use today
  const hardcodedDate = null

  //Used for past sprint, might need to keep to show more data
  const numericKeys = ['BI', 'ERC', 'OneHourFM', 'TenHourFM', 'HundredHourFM', 'ThousandHourFM', 'KBDI', 'SC', 'IC']

  const calculateAverages = (records) => {
    const result = {}

    numericKeys.forEach(key => {
      const valid = records.filter(r => r[key] != null)

      result[key] = valid.length
        ? Number(
            (valid.reduce((sum, r) => sum + Number(r[key]), 0) / valid.length).toFixed(2)
          )
        : null
    })

    return result
  }

  const formatLocalDate = (date) => {
    const yr = date.getFullYear()
    const mo = String(date.getMonth() + 1).padStart(2, '0')
    const da = String(date.getDate()).padStart(2, '0')
    return `${yr}-${mo}-${da}`
  }

  //Convert degrees to compass directions
  const getWindDirection = (deg) => {
    if (deg == null) return null

    const directions = ['N','NE','E','SE','S','SW','W','NW']
    const index = Math.round(deg / 45) % 8

    return directions[index]
  }

  //Determine fire danger level from ERC (and optionally BI) based on breakpoints
  const getDangerLevel = (avgErc, avgBi = null) => {
    if (avgErc == null || !breakpoints.length) return null

    // Sort breakpoints by ERC threshold descending to find highest matching level
    const sortedBps = [...breakpoints].sort((a, b) => b.Erc_Breakpoint - a.Erc_Breakpoint)

    for (const bp of sortedBps) {
      const ercMet = avgErc >= bp.Erc_Breakpoint

      // If using BI, both conditions must be met
      if (useBi && bp.Bi_Breakpoint != null) {
        const biMet = avgBi != null && avgBi >= bp.Bi_Breakpoint
        if (ercMet && biMet) {
          return DANGER_LEVELS[bp.Danger_Level - 1]
        }
      } else {
        // ERC only
        if (ercMet) {
          return DANGER_LEVELS[bp.Danger_Level - 1]
        }
      }
    }

    return DANGER_LEVELS[0] // Default to 'Low' if no breakpoint matched
  }

  //Calculate weather averages
  const calculateWeatherAverages = (records) => {
    if (!records?.length) return {}

    const avg = (key) => {
      const valid = records.filter(r => r[key] != null)
      return valid.length
        ? Number((valid.reduce((s, r) => s + Number(r[key]), 0) / valid.length).toFixed(2))
        : null
    }

    //Getting most common Wind Direction
    const mostCommonDir = (() => {
      const dirs = records
        .map(r => getWindDirection(r.Gust_Direction))
        .filter(Boolean)

      if (!dirs.length) return null

      const counts = {}
      dirs.forEach(d => counts[d] = (counts[d] || 0) + 1)

      return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0]
    })()

    return {
      WindSpeed: avg('Wind_Speed_Max'),
      WindDir: mostCommonDir,
      Rain: avg('Precipitation24hr'),
      MaxTemp: avg('Temp_Max'),
      MinRH: avg('Relative_Humidity_Min'),
      MaxRH: avg('Relative_Humidity_Max')
    }
  }

  // Fetch breakpoints for this FDRA
  useEffect(() => {
    if (!id) return

    const fetchBreakpointsData = async () => {
      const result = await getBreakpoints(id)
      if (result && Array.isArray(result.breakpoints)) {
        setBreakpoints(result.breakpoints)
        setUseBi(result.useBi || false)
      }
    }

    fetchBreakpointsData()
  }, [id])

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const now = new Date()
      const currentYear = now.getFullYear()

      //Pull FDRA data
      const { data: fdra, error: fdraError } = await supabase
        .from('FDRA')
        .select('FDRAname, AVG_BI, AVG_ERC, DispatchArea(DispatchName), Danger_Level, ERC_Percentile, BI_Percentile, ERC_90th, BI_90th')
        .eq('FDRA_ID', id)
        .single()

      if (fdraError) return console.error(fdraError)

      //Pull station IDs
      const { data: stationLinks, error: linkError } = await supabase
        .from('Station_FDRA_Combinations')
        .select('Station_ID')
        .eq('FDRA_ID', id)

      if (linkError) return console.error(linkError)

      const stationIds = stationLinks.map(s => s.Station_ID)

      if (!stationIds.length) {
        console.warn('No stations found for FDRA:', id)
        return
      }

      //Pull stations
      const { data: stations, error: stationError } = await supabase
        .from('Stations')
        .select('ID, Station_Name')
        .in('ID', stationIds)

      if (stationError) return console.error(stationError)

      //Pull NFDRRecords (CURRENT YEAR + NEXT 6 DAYS)
      const todayStr = formatLocalDate(now)

      const futureDate = new Date()
      futureDate.setDate(now.getDate() + 6)
      const futureStr = formatLocalDate(futureDate)

      //Pulling current year with forecast
      const { data: nfdrRecords, error: nfdrError } = await supabase
        .from('NFDRRecords')
        .select(`
          Station_ID, Observation_Time,
          ERC, BI,
          OneHourFM, TenHourFM, HundredHourFM, ThousandHourFM,
          IC, KBDI, SC
        `)
        .in('Station_ID', stationIds)
        .gte('Observation_Time', `${currentYear}-01-01`)
        .lte('Observation_Time', futureStr)

      //Pulling 2018
      const { data: nfdrRecords2018, error: nfdrError2018 } = await supabase
        .from('NFDRRecords')
        .select(`
          Station_ID, Observation_Time,
          ERC, BI,
          OneHourFM, TenHourFM, HundredHourFM, ThousandHourFM,
          IC, KBDI, SC
        `)
        .in('Station_ID', stationIds)
        .gte('Observation_Time', '2018-01-01')
        .lte('Observation_Time', '2018-12-31')

      //Pulling Weather Data
      const { data: weatherRecords, error: weatherError } = await supabase
        .from('WeatherDataRecords')
        .select(`
          Station_ID, Observation_Time,
          Temp_Min, Temp_Max,
          Relative_Humidity_Min, Relative_Humidity_Max,
          Wind_Speed_Max,
          Gust_Direction,
          Precipitation24hr
        `)
        .in('Station_ID', stationIds)
        .gte('Observation_Time', `${currentYear}-01-01`)
        .lte('Observation_Time', futureStr)

      if (weatherError) return console.error(weatherError)

      //Deduping current year
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

      //Deduping 2018
      const uniqueMap2018 = new Map()
      nfdrRecords2018.forEach(r => {
        const date = r.Observation_Time.slice(0, 10)
        const key = `${r.Station_ID}-${date}`

        const existing = uniqueMap2018.get(key)

        if (!existing || new Date(r.Observation_Time) > new Date(existing.Observation_Time)) {
          uniqueMap2018.set(key, r)
        }
      })

      const dedupedRecords2018 = Array.from(uniqueMap2018.values())

      //Date Setup
      const latestDate = dedupedRecords?.length
        ? new Date(Math.max(...dedupedRecords.map(r => new Date(r.Observation_Time))))
        : now

      const activeDateStr = hardcodedDate ?? todayStr

      const next6 = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(activeDateStr)
        d.setDate(d.getDate() + i + 1)
        return formatLocalDate(d)
      })

      const allDatesCombined = Array.from(
        new Set([activeDateStr, ...next6])
      )

      //Grouping Current Dates
      const recordsByDate = {}
      dedupedRecords.forEach(r => {
        const date = r.Observation_Time.slice(0, 10)
        if (!recordsByDate[date]) recordsByDate[date] = []
        recordsByDate[date].push(r)
      })

      //Grouping 2018 Dates
      const recordsByDate2018 = {}
      dedupedRecords2018.forEach(r => {
        const date = r.Observation_Time.slice(0, 10)
        if (!recordsByDate2018[date]) recordsByDate2018[date] = []
        recordsByDate2018[date].push(r)
      })

      const weatherByDate = {}
      weatherRecords.forEach(r => {
        const date = r.Observation_Time.slice(0, 10)
        if (!weatherByDate[date]) weatherByDate[date] = []
        weatherByDate[date].push(r)
      })

      //Today
      const todayRecords = recordsByDate[activeDateStr] ?? []
      const todayWeather = weatherByDate[activeDateStr] ?? []

      const todayAverages = {
        ...calculateAverages(todayRecords),
        ...calculateWeatherAverages(todayWeather)
      }

      //Historical (CURRENT YEAR ONLY)
      const histDates = []
      let d = new Date(currentYear, 0, 1)

      while (d.getFullYear() === currentYear) {
        histDates.push(formatLocalDate(d))
        d.setDate(d.getDate() + 1)
      }

      const avgERC = histDates.map(date => {
        const recs = recordsByDate[date]
        if (!recs?.length) return null

        const valid = recs.filter(r => r.ERC != null)
        if (!valid.length) return null

        const avg = valid.reduce((s, r) => s + r.ERC, 0) / valid.length
        return Number(avg.toFixed(2))
      })

      //Historical (2018)
      const hist2018Dates = []
      let d2018 = new Date(2018, 0, 1)

      while (d2018.getFullYear() === 2018) {
        hist2018Dates.push(formatLocalDate(d2018))
        d2018.setDate(d2018.getDate() + 1)
      }

      const avgERC2018 = hist2018Dates.map(date => {
        const recs = recordsByDate2018[date]
        if (!recs?.length) return null

        const valid = recs.filter(r => r.ERC != null)
        if (!valid.length) return null

        const avg = valid.reduce((s, r) => s + r.ERC, 0) / valid.length
        return Number(avg.toFixed(2))
      })

      const avgERC2018Aligned = histDates.map(date => {
        const monthDay = date.slice(5)
        const date2018 = `2018-${monthDay}`

        const index = hist2018Dates.indexOf(date2018)
        return index !== -1 ? avgERC2018[index] : null
      })

      //Merge (NFDR + WEATHER)
      const combinedRecords = []

      stations.forEach(station => {
        allDatesCombined.forEach(date => {

          const recs = (recordsByDate[date] ?? []).filter(
            r => r.Station_ID === station.ID
          )

          const weatherForStation = (weatherByDate[date] ?? []).filter(
            w => w.Station_ID === station.ID
          )

          const weatherAvg = calculateWeatherAverages(weatherForStation)

          if (recs.length) {
            recs.forEach(r =>
              combinedRecords.push({
                ...station,
                ...r,
                ...weatherAvg,
                FDRA_ID: id
              })
            )
          } else {
            combinedRecords.push({
              ...station,
              Observation_Time: date,
              ...weatherAvg,
              FDRA_ID: id
            })
          }
        })
      })

      //Set state
      setDailyAvgERC(avgERC)
      setHistoricalDates(histDates)
      setDates2018(hist2018Dates)
      setDailyAvgERC2018(avgERC2018Aligned)
      setNext6Days(next6)
      setAllDates(allDatesCombined)

      setData({
        ...fdra,
        StationRecord: combinedRecords,
        todayAverages
      })
    }

    fetchData()
  }, [id])

  //Loading
  if (!data) return <p>Loading...</p>
  const todayStr = formatLocalDate(new Date())

  //90th Percentile lines
  const erc90 = data?.ERC_90th ?? null
  const bi90 = data?.BI_90th ?? null

  //Getting correct dates
  const chartDates = [...historicalDates, ...allDates]

  //Getting forecast info
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
      
      <div className="danger-card">
        <h2 style={{ color: 'white' }}>
          Dispatch Area: {data?.DispatchArea?.DispatchName}
        </h2>

        <h2 style={{ color: 'white' }}>
          FDRA: {data?.FDRAname}
        </h2>

        <Link href="/learn-more/overview" className="card-link">
          <h2 className="danger-level">
            Fire Danger Level:{" "}
            <span
              className={
                data?.Danger_Level === "Very High"
                  ? "fire-danger-very-high"
                  : `fire-danger-${data?.Danger_Level?.toLowerCase()}`
              }
            >
              {data?.Danger_Level}
            </span>
          </h2>
        </Link>

      </div>
      

      <br></br>

      <details>
          <summary>In-Depth Values</summary>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            maxWidth: '900px',
            marginBottom: '20px',
            color: 'black'
          }}>
            {[
              { label: 'ERC %', value: data?.ERC_Percentile },
              { label: 'BI %', value: data?.BI_Percentile },
              { label: 'Winds', value: data?.todayAverages?.WindSpeed ?? 'N/A' },
              { label: 'Wind Dir', value: data?.todayAverages?.WindDir ?? 'N/A' },
              { label: '24hr Rain', value: data?.todayAverages?.Rain ?? 'N/A' },
              { label: 'Max Temp', value: data?.todayAverages?.MaxTemp ?? 'N/A' },
              { label: 'Min RH', value: data?.todayAverages?.MinRH ?? 'N/A' },
              { label: 'Max RH', value: data?.todayAverages?.MaxRH ?? 'N/A' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#2f4f2f',
                padding: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                <div>{item.label}</div>
                <div style={{ background: 'white', marginTop: '5px', padding: '5px' }}>
                  {item.value ?? 'N/A'}
                </div>
              </div>
            ))}
          </div>
      </details>


      <details>
        <summary>Graph</summary>
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
              { 
                label: '90th Percentile ERC', 
                data: chartDates.map(() => erc90), 
                showMark: false, 
                color: '#CC79A7', 
              },
              { 
                label: '90th Percentile BI', 
                data: chartDates.map(() => bi90), 
                showMark: false, 
                color: '#D55E00', 
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
      </details>

      <details>
        <summary>{data?.FDRAname} Extended Forecast</summary>
        <table className = "frontend-table">
          <thead>
            <tr>
              <th></th>
              {allDates.map(date => (
                <th key={date}>{date}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Fire Danger Level Row */}
            <tr>
              <td style={{ fontWeight: 'bold' }}>Fire Danger</td>
              {allDates.map(date => {
                const recs = data.StationRecord.filter(
                  r => r.Observation_Time.slice(0, 10) === date
                )

                // Calculate average ERC for this date
                const ercValid = recs.filter(r => r.ERC != null)
                const avgErc = ercValid.length
                  ? ercValid.reduce((s, r) => s + Number(r.ERC), 0) / ercValid.length
                  : null

                // Calculate average BI for this date (if using BI)
                const biValid = recs.filter(r => r.BI != null)
                const avgBi = biValid.length
                  ? biValid.reduce((s, r) => s + Number(r.BI), 0) / biValid.length
                  : null

                const dangerLevel = getDangerLevel(avgErc, avgBi)

                return (
                  <td
                    key={date}
                    className={
                      dangerLevel === 'Very High'
                        ? 'fire-danger-very-high'
                        : dangerLevel
                          ? `fire-danger-${dangerLevel.toLowerCase()}`
                          : ''
                    }
                  >
                    {dangerLevel || 'N/A'}
                  </td>
                )
              })}
            </tr>

            {[
              {
                label: 'Average ERC',
                key: 'ERC'
              },
              {
                label: 'Average BI',
                key: 'BI'
              },
              {
                label: '100hr Fuels',
                key: 'HundredHourFM'
              },
              {
                label: 'Max RH',
                key: 'MaxRH'
              },
              {
                label: 'Winds',
                key: 'WindSpeed'
              },
              {
                label: 'Temperature',
                key: 'MaxTemp'
              },
              {
                label: 'Relative Humidity',
                key: 'MinRH'
              },
              {
                label: 'Wind Direction',
                key: 'WindDir'
              },
              {
                label: 'Precipitation',
                key: 'Rain'
              },

            ].map(row => (
              <tr key={row.label}>
                <td style={{ fontWeight: 'bold' }}>{row.label}</td>

                {allDates.map(date => {
                  const recs = data.StationRecord.filter(
                    r => r.Observation_Time.slice(0, 10) === date
                  )

                  const valid = recs.filter(r => r[row.key] != null)

                  // Special handling for Wind Direction (mode instead of average)
                  if (row.key === 'WindDir') {
                    if (!valid.length) return <td key={date}>N/A</td>

                    const counts = {}
                    valid.forEach(r => {
                      const dir = r[row.key]
                      counts[dir] = (counts[dir] || 0) + 1
                    })

                    const mostCommon = Object.entries(counts)
                      .sort((a, b) => b[1] - a[1])[0][0]

                    return <td key={date}>{mostCommon}</td>
                  }

                  // Default numeric averaging
                  const avg = valid.length
                    ? (valid.reduce((s, r) => s + Number(r[row.key]), 0) / valid.length).toFixed(1)
                    : 'N/A'

                  return <td key={date}>{avg}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details>
        <summary>Weather Station Data</summary>
        {allDates.map(date => {
          const records = data.StationRecord.filter(
            r =>
              r.FDRA_ID === id &&
              r.Observation_Time.slice(0, 10) === date
          )

          return (
            <section key={date} style={{ marginBottom: '25px' }}>
              <h3>{date}</h3>

              <table className = "frontend-table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>ERC</th>
                    <th>BI</th>
                    <th>100hr</th>
                    <th>Temp</th>
                    <th>Min RH</th>
                    <th>Wind</th>
                    <th>Wind Dir</th>
                    <th>Rain</th>
                  </tr>
                </thead>

                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center' }}>
                        No records for this date.
                      </td>
                    </tr>
                  ) : (
                    records.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>
                          {r.Station_Name ?? `Station ${r.Station_ID}`}
                        </td>

                        <td>{r.ERC ?? 'N/A'}</td>
                        <td>{r.BI ?? 'N/A'}</td>
                        <td>{r.HundredHourFM ?? 'N/A'}</td>
                        <td>{r.MaxTemp ?? 'N/A'}</td>
                        <td>{r.MinRH ?? 'N/A'}</td>
                        <td>{r.WindSpeed ?? 'N/A'}</td>
                        <td>{r.WindDir ?? 'N/A'}</td>
                        <td>{r.Rain ?? 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )
        })}
      </details>
    </main>
  )
}