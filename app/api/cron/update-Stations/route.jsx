// app/api/cron/update-stations/route.js
import { importService } from '@/lib/database/ImportDataService.jsx'
import { NextResponse } from 'next/server'

export async function GET(request) {
  console.log('Cron job triggered - Starting data update')
  
  try {
    //run fetcg
    const result = await importService.runDailyImport()
    
    console.log(`Cron job complete: ${result.summary.totalRows} rows processed`)
    
    //if succes 
    return NextResponse.json({
      success: true,
      message: 'Station data updated successfully',
      stats: result,
      timestamp: new Date().toISOString()
    })
    
  } 
  catch (error) { //fail gracefully
    console.error('Cron job failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 }) //int server error
  }
}

// Export GET as POST to allow triggering via POST requests (e.g., from vercel service)
export { GET as POST }