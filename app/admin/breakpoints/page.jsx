'use client';
import BreakpointTable from '@/app/components/breakpointEdit/breakpointTable.jsx';
import useRequireAuth from '@/app/auth/useRequiredAuth.jsx'
import {useRouter } from 'next/navigation'
import Link from 'next/link';
export default function editBreakpointPage() {
    const router = useRouter();
    //checking if user is logged in
    const {session, loading} = useRequireAuth();
    //const {logout} = useLogOut();
    //const router = useRouter();
    
    //waiting for check
    if(loading||!session){
        return <p>...checking login credentials...</p>
    }

    return (
        <div className="edit-breakpoint-page">
            <button onClick={() => router.push('/admin')}>
                Admin Dashboard
            </button>
            <h1>Edit Breakpoints</h1>
            
            <BreakpointTable/>

            <div className='adminGoBack' >
            <Link href="../admin">
                ← Back to Admin Dashboard
            </Link>
        </div>
        </div>
        
    );
}   