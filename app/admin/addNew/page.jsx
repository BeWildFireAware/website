'use client';

//page to get user input for new stations to add to db, wrapped in refresh provider, which allows for refresh of all needed info
import { RefreshProvider } from '../../components/contexts/refreshContext.jsx';
import  StationSearchForm  from '../../components/newStationAdd/stationSearchForm.jsx'
import FDRASearchForm from '../../components/newFdraAdd/fdraSearchForm.jsx'
import DispatchAreaSearchForm from '@/app/components/newDispatchAreaAdd/dispatchAreaSearchForm.jsx'
import DispatchAreaTable from '@/app/components/newDispatchAreaAdd/dispatchAreaTable.jsx'
import  StationTable  from '../../components/newStationAdd/stationTable.jsx'; //table to show all stations and their info, also allows for changing fdra assignment of stations
import useRequireAuth from '../../auth/useRequiredAuth.jsx'
import Link from 'next/link';

export default function AddDataPage() {
    
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
                <div className="add-station-section">
                    <h2>Add New Station</h2>
                    <p>Enter the new station ID, fuel model, and fdra it belongs to</p>
                    <StationSearchForm />
                </div>
                <div>
                    <h2>All Stations</h2>
                    <StationTable />
                </div>
                <div>
                    <h2>Add New FDRA</h2>
                    <p>Enter the new FDRA name and dispatch area it belongs to</p>
                    <FDRASearchForm />
                </div>
            
                <div>
                    <h2>Add New Dispatch Area</h2>
                    <p>Enter the new dispatch area name</p>
                    <DispatchAreaSearchForm/>
                </div>
                <div>
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
           
