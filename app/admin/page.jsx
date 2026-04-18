'use client';
//admin dashbaord is access by ADMIN and EDITOR roles
//EDITOR can only add new station information
//ADMIN can add new station info and sign up new users


import Link from 'next/link';

import useRequireAuth from '../auth/useRequiredAuth.jsx'
import useLogOut from '../auth/useLogOut.jsx'
import {useRouter } from 'next/navigation'
import UsersConnected from '../components/user/userConnected.jsx';


export default function AdminDashboard() {
    const {session, loading, isAdmin,displayName} = useRequireAuth(); //check if logged in
    const {logout} = useLogOut(); //logout function
    const router = useRouter();//redirect to differnet page
    
    
    if(loading||!session){
        return <p>...checking login credentials...</p>
    }

    return(
        <>
            {isAdmin ? (
                <h1>ADMIN DASHBOARD</h1>
            ):(
                <h1>EDITOR DASHBOARD</h1>
            )
            }
            <p>Welcome {displayName}!</p>

            <p>Buttons for you</p>

            <div className='adminDash'>
                {isAdmin && (
                    <button onClick={() => router.push('/auth/signUp')}>
                        SIGN UP NEW USERS
                    </button>
                )}
                <button onClick={() => router.push('/admin/testEmail')}>
                    TEST EMAIL
                </button>

                <button onClick={() => router.push('/admin/addNew')}>
                    ADD NEW DATA
                </button>
            </div>
             <div>
                {/* view users (admin sees all, editor sees own only) */}
                <UsersConnected />
            </div>
            <button onClick={logout}>
                    LOG OUT!
            </button>
    </>
    )

}

