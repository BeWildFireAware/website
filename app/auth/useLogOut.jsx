'use client'
//this hook handles logging out user

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function useLogOut() {
    const router = useRouter();

    const logout = async() => {
         const {error} = await supabase.auth.signOut();

        if(error){
            console.error("logout error: ", error);
            return;

        }
        console.log('logged out success!');
        router.push('/auth/logIn');
    };
    return {logout};
   




}