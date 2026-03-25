//page to get user input for new stations to add to db, wrapped in refresh provider, which allows for refresh of all needed info
import { RefreshProvider } from '../components/contexts/refreshContext.jsx';
import  StationSearchForm  from '../components/newStationAdd/stationSearchForm.jsx'
import FDRASearchForm from '../components/newFdraAdd/fdraSearchForm.jsx'
import DispatchAreaSearchForm from '../components/newDispatchAreaAdd/dispatchAreaSearchForm.jsx'
import  StationTable  from '../components/newStationAdd/stationTable.jsx'; //table to show all stations and their info, also allows for changing fdra assignment of stations

export default function AddDataPage() {

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
                    
                </div>
            </div>
        </RefreshProvider>
        
    );
}
           
