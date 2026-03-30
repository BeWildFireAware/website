'use client';


import { supabase } from '@/lib/supabase';
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation';


export default function RequireAuth() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();




    // Fetch session on mount
    useEffect(() => {
        const fetchSession = async () => {
            const { data,error } = await supabase.auth.getSession();
            if(error){
                console.error(error);
            }

            const currentSession = data?.session;
            if(!currentSession){
                router.replace('/auth/logIn');
                console.log('session failed');
                setLoading(false);
                return;
            }
            else{
                setSession(currentSession);
                console.log('session success');
                setLoading(false);
                
            }
           

        };
        fetchSession();
    }, [router]);

    // if(session?.access_token){
    //     console.log("user found!");
    //     return;
    // }
    // else{
    //     console.log('must be logged in to access this page');
    //     router.push('/auth/logIn');
    // }
    // if(session){
    //     console.log('YAYYA');
    // }
    // else{
    //    console.log('must be logged in to access this page');

    // }
    return {session, loading};
}
    