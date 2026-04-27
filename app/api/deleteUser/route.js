import { createClient } from "@supabase/supabase-js";

export async function POST(request) {//create supabase client for updating user data
    const { userId} = await request.json();

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY // Only available on the server, not exposed to the client
    );

    try {
        if (!userId) {
            return new Response(
                JSON.stringify({ success: false, message: 'User ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            return new Response(
                JSON.stringify({ success: false, message: deleteError.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "User deleted successfully", 
                userId 
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
        
    } catch (error) {
        console.error('Unexpected error:', error);
        
        return new Response(
            JSON.stringify({ success: false, message: 'Unexpected error occurred' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}