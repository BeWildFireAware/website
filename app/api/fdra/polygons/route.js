// must be named route
import { createClient } from '@supabase/supabase-js';

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
        
        const { data, error } = await supabase //get data for diplay(polygon, popup for polygon)
            .from('FDRA')
            .select(`
                FDRA_ID,
                FDRAname,
                Danger_Level,
                Map_Poly,
                DispatchArea:Dispatch_ID (DispatchName)
            `)
            .not('Map_Poly', 'is', null) //make sure not null polygon(none created yet)
            .order('FDRAname');

        if (error) {
            console.error('Supabase error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        console.log(`Found ${data?.length || 0} FDRAs with polygons`);

        // Transform to clean format for use in map component
        const features = data.map(fdra => ({
            id: fdra.FDRA_ID,
            name: fdra.FDRAname,
            dispatchName: fdra.DispatchArea?.DispatchName || 'Unknown',
            dangerLevel: fdra.Danger_Level || 'Unknown',
            polygon: fdra.Map_Poly
        }));

        return Response.json(features);
    } catch (error) {
        console.error('Error fetching FDRA polygons:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}