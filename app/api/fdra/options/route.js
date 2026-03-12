//get fdra options from db
import { createClient } from '@supabase/supabase-js' //

export async function GET() {
    const supabase = createClient();
    const { data, error } = await supabase.from('FDRA').select('FDRA_ID, FDRAname');
    if (error) {
        console.error('Error fetching FDRA options:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch FDRA options' }), { status: 500 });
    }
    return new Response(JSON.stringify(data || []), { status: 200 });
}