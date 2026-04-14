// /app/api/fdraOptions/route.js
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        console.log('FDRA API: Endpoint was called');
        
        // Check environment variables
        console.log('FDRA API: Checking env vars...');
        console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('FDRA API: Missing environment variables');
            return new Response(
                JSON.stringify([]),
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        console.log('FDRA API: Attempting to fetch from FDRA table...');
        
        const { data, error } = await supabase
            .from('FDRA')
            .select('FDRA_ID, FDRAname, Fuel_Model')  // Select all to see what columns exist
            .order('FDRAname')
            

        if (error) {
            console.error('FDRA API: Database error:', error);
            return new Response(
                JSON.stringify([]),
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        console.log('FDRA API: Data retrieved:', data);
        console.log('FDRA API: Number of records:', data?.length || 0);

        // Return the data
        return new Response(
            JSON.stringify(data || []),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
    } catch (error) {
        console.error('FDRA API: Unexpected error:', error);
        return new Response(
            JSON.stringify([]),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}