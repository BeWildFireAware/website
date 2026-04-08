import { createClient } from "@supabase/supabase-js";

export async function POST(request) {//create supabase client for updating user data
    const { userId, displayName, email, role, isSelf } = await request.json();

    if (!userId || !displayName || !email) {
        return new Response(
            JSON.stringify({ success: false, message: 'User ID, display name, and email are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }


    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY // Only available on the server, not exposed to the client
    );

    try {
        const { data: currentUser, error: currentUserError } = await supabaseAdmin.auth.admin.getUserById(userId);        
        if(currentUserError){
            return new Response(
                JSON.stringify({ success: false, message: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
        const metaData=currentUser?.user.user_metadata||{};

        // Update Auth user
        const updatedMetadata = {
        ...metaData,
        display_name: displayName
        };
        if (!isSelf && role){
            updatedMetadata.role = role;
        }


        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,{
                email,
                user_metadata: updatedMetadata
            }
        );

        if (authError) {
            return new Response(
                JSON.stringify({ success: false, message: authError.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Update Profiles table
        const updates = {
            display_name: displayName,
            email
        };

        if (!isSelf && role) updates.role = role;

        const { data: profileData, error: profileError } = await supabaseAdmin
            .from("profiles")
            .update(updates)
            .eq("id", userId)
            .select();

        if (profileError) {
            return new Response(
                JSON.stringify({ success: false, message: profileError.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "User updated successfully", data: profileData }),
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