//get all fdras with extreme ratings(and relavent info for display)
import { createClient } from '@supabase/supabase-js';

//get data
export async function GET() {
    try {
        console.log('Map');
        
        // Check environment variables(if exists)
        console.log('FDRA API: Checking env vars...');
        console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { //if not err
            console.error('FDRA API: Missing environment variables');
            return new Response(
                JSON.stringify([]),
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data, error } = await supabase
            .from('FDRA')
            .select(`
                FDRA_ID,
                FDRAname,
                Danger_Level,
                DispatchArea:Dispatch_ID (DispatchName) //to filter byand dispay
            `)
            .eq('Danger_Level', 'Extreme') //only extreme, dont know why 
            .order('DispatchName', { foreignTable: 'DispatchArea', ascending: true }) //order by dispatch name then fdras
            .order('FDRAname', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        // Transform for easy use
        const extremeFdras = data.map(fdra => ({
            id: fdra.FDRA_ID,
            name: fdra.FDRAname,
            dispatchName: fdra.DispatchArea?.DispatchName || 'Unknown',
            dangerLevel: fdra.Danger_Level
        }));

        return Response.json(extremeFdras);
    } catch (error) {
        console.error('Error fetching extreme FDRAs:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}