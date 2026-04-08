import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing userId" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Server-side Supabase client using SERVICE ROLE key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Fetch user from Profiles table
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("id, display_name, email, role")
            .eq("id", userId)
            .single();

        if (error) {
            return new Response(
                JSON.stringify({ success: false, message: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ success: false, message: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}