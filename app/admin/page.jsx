'use client';
import Link from 'next/link';

import useRequireAuth from '../auth/useRequiredAuth.jsx'
import useLogOut from '../auth/useLogOut.jsx'

export default function adminDashboard() {
    const {session, loading} = useRequireAuth();
    const {logout} = useLogOut();
    
    
    if(loading){
        return <p>...checking login credentials...</p>

    }


    return(
        <>
            <h1> ADMIN DASHBOARD </h1>
            <p> welcome {session?.user.email}! </p>

            <p>buttons for admins</p>
            <Link href="../auth/signUp">sign Up new user</Link>
            <p></p>
            <button onClick={logout}>LOG OUT!</button>
        </>
    )

}

