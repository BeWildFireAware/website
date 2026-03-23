//page to get user input for new stations to add to db

import  StationSearchForm  from '../components/newStationAdd/stationSearchForm.jsx'

export default function AddDataPage() {
    return (
        <div className="add-data-page">
            <div className="add-station-section">
                <h2>Add New Station</h2>
                <p>Enter the new station ID, fuel model, and fdra it belongs to</p>
                <StationSearchForm />
            </div>
            <div>
                <h2>Add New FDRA</h2>
                <p>Enter the new FDRA name and dispatch area it belongs to</p>
            </div>
            <div>
                <h2>Add New Dispatch Area</h2>
                <p>Enter the new dispatch area name</p>
            </div>
        </div>
    );
}
           
