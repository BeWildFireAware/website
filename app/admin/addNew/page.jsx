'use client';

//page to get user input for new stations to add to db, wrapped in refresh provider, which allows for refresh of all needed info
import { RefreshProvider } from '@/app/components/contexts/refreshContext.jsx';
import  StationSearchForm  from '@/app/components/newStationAdd/stationSearchForm.jsx'
import FDRASearchForm from '@/app/components/newFdraAdd/fdraSearchForm.jsx'
import DispatchAreaSearchForm from '@/app/components/newDispatchAreaAdd/dispatchAreaSearchForm.jsx'
import DispatchAreaTable from '@/app/components/newDispatchAreaAdd/dispatchAreaTable.jsx'
import  StationTable  from '@/app/components/newStationAdd/stationTable.jsx'; //table to show all stations and their info, also allows for changing fdra assignment of stations
import useRequireAuth from '@/app/auth/useRequiredAuth.jsx'
import {useRouter } from 'next/navigation'
import Link from 'next/link';

export default function AddDataPage() {
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
        <RefreshProvider>
            <div className="add-data-page">
                <button onClick={() => router.push('/admin')}>
                        Admin Dashboard
                </button>

                <div className="add-station-section">
                    
                    <h2>Add New Station</h2>
                    <h3>Enter the new station ID, fuel model, and fdra it belongs to</h3>
                    <StationSearchForm />
                </div>
                <div className="all-stations-section">
                    <h2>All Stations</h2>
                    <StationTable />
                </div>
                <div className="add-fdra-section">
                    <h2>Add New FDRA</h2>
                    <h3>Enter the new FDRA name and dispatch area it belongs to</h3>
                    <FDRASearchForm />
                </div>
            
                <div className="add-dispatch-area-section">
                    <h2>Add New Dispatch Area</h2>
                    <h3>Enter the new dispatch area name</h3>
                    <DispatchAreaSearchForm/>
                </div>
                <div className="all-dispatch-areas-section">
                    <h2>All Dispatch Areas</h2>
                    <DispatchAreaTable/>
                </div>

                <div className='adminGoBack' >
                    <Link href="../admin">
                        ← Back to Admin Dashboard
                    </Link>
                </div>
            </div>

        </RefreshProvider>
        
    );
}
        


