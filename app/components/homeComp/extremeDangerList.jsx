//component to list all extreme danger areas  and link to specific page
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import "./dangerList.css"; //basic css for the extreme danger list, can be adjusted as needed, moved to globals
// Component to display list of areas currently at extreme danger level
export default function ExtremeDangerList() {
    const [extremeFdras, setExtremeFdras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedByDispatch, setGroupedByDispatch] = useState({});

    useEffect(() => { //get all
        fetch('/api/fdra/getExtreme')
            .then(res => { //if json ok
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.json();
            })
            .then(data => { //extract data
                console.log('API Response for Extreme FDRAs:', data);
                if(Array.isArray(data)) {
                    setExtremeFdras(data);
                    // Group by dispatch area for better display
                    const grouped = data.reduce((acc, fdra) => {
                        const dispatch = fdra.dispatchName || 'Unknown';
                        if(!acc[dispatch]) { //init array for dispatch if not exists
                            acc[dispatch] = [];
                        }    
                        acc[dispatch].push(fdra);
                        return acc;
                    }, {});
                    setGroupedByDispatch(grouped);
                } else if (data.error) {
                    console.error('API returned error:', data.error);
                    setError(data.error);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load extreme FDRAs:', err);
                setError(err.message);
                setLoading(false);
            });    
    }, []);

    if (loading) return <p className="extreme-loading">Loading extreme danger areas...</p>;
    if (error) return <p className="extreme-error">Error loading data: {error}</p>;
    if (extremeFdras.length === 0) return <p className="extreme-none">✓ No areas currently at extreme danger level.</p>;

    return (
        <div className="extreme-danger-container">
            <div className="extreme-danger-header">
                
                <h3>Extreme Danger Areas</h3>
                <span className="extreme-count">{extremeFdras.length}</span> {/*added for visual */}
            </div>
            {/* Grouped display by dispatch area */}
            <div className="extreme-danger-content">
                {Object.entries(groupedByDispatch)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dispatch, fdraList]) => (
                        <div key={dispatch} className="dispatch-group">
                            <h4 className="dispatch-title">{dispatch}</h4>
                            {/* List of FDRAs for this dispatch area */}
                            <ul className="fdra-list">
                                {fdraList.map((fdra) => (
                                    <li key={fdra.id} className="fdra-item">
                                        {/* Link to individual FDRA page with name and extreme(for looks) */}
                                        <Link href={`/fdra/${fdra.id}`} className="fdra-link">
                                            <span className="fdra-name">{fdra.name}</span>
                                            <span className="fdra-badge">Extreme</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
            </div>
        </div>
    );
}