'use client';
//this hook checks if a user is logged in and can return the session, updates to session, 
// loading to handle check time, and if the user is an admin from auth table
// and user display name


import { supabase } from '@/lib/supabase';
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';


export default function RequireAuth() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const router = useRouter();




    // Fetch session on mount
   useEffect(() => {
    const fetchSession = async () => {
        const { data, error } = await supabase.auth.getSession();//get session from auth table

        if (error) {
            console.error(error);
            return;
        }

        const currentSession = data?.session;

        if (!currentSession) {//route back to login page if not logged in
            console.log('session failed');
            router.replace('/auth/logIn');
            setLoading(false);
            return;
        }

        setSession(currentSession);

        const isAdminValue = currentSession?.user?.user_metadata?.role === "ADMIN"; //check if role is ADMIN
        console.log(isAdmin);
        console.log(currentSession?.user?.user_metadata);
        setIsAdmin(isAdminValue);
        setDisplayName(currentSession?.user?.user_metadata?.display_name);//user display name

        setLoading(false);
        console.log('session success : admin = ',isAdmin);
    };

    fetchSession();

    //data listener to check if authentication has a change logged out vs logged in
    const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setSession(session);

            const isAdminValue =
                session?.user?.user_metadata?.role === "ADMIN";

            setIsAdmin(isAdminValue);
            setDisplayName(session?.user?.user_metadata?.display_name);
        }
    );

    return () => {
        listener.subscription.unsubscribe();//once done stop listening
    };
}, []);

  
    return {session, loading, isAdmin,displayName};//return session, loading, true false for is admin, display name
}
    