//this component is responsible for fetching and displaying the nearest FDRA to the user based on their geolocation
'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import "./nearestFdra.css"; //basic css for the nearest fdra component, can be adjusted as needed

const dangerLevelColors = { //fire danger level to color mapping, can be adjusted as needed
    'Low': '#2ecc71',
    'Moderate': '#f3c612',
    'High': '#e35311',
    'Very High': '#c0392b',
    'Extreme': '#8e44ad',
    'Unknown': '#95a5a6'
};

export default function NearestFdra() {
    const [fdra, setFdra] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [insideFdra, setInsideFdra] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        //get current position and then fetch closest fdra data from api route using lat long
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('User location:', latitude, longitude);
                
                try {
                    const res = await fetch(`/api/fdra/getClosestFdra?lat=${latitude}&lng=${longitude}`);
                    
                    if (!res.ok) {
                        throw new Error(`HTTP error: ${res.status}`);
                    }
                    
                    const data = await res.json();
                    console.log('API Response:', data);
                    
                    if (data.error) {
                        setError(data.error);
                    } else if (data.inside) {
                        
                        setInsideFdra(true);
                        setFdra(data.closest); // API returns closest even when inside
                    } else if (data.closest) {
                        setInsideFdra(false);
                        setFdra(data.closest);
                    } else {
                        setFdra(null);
                    }
                } catch (err) {
                    console.error('Fetch error:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.log('Geolocation error:', err.message);
             
                setLocationDenied(true);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    if (loading) {
        return (
            <div className="closest-fdra-container">
               
                <p>Finding nearest FDRA...</p>
            </div>
        );
    }

    if (locationDenied) {
        return (
            <div className="closest-fdra-container">
                
                <p>Enable location services to see fire danger in your area.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="closest-fdra-container">
                
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!fdra) {
        return (
            <div className="closest-fdra-container">
                
                <p>No FDRA data available for your area.</p>
            </div>
        );
    }

    const dangerColor = dangerLevelColors[fdra.dangerLevel] || dangerLevelColors['Unknown'];

    return (
        <div className="closest-fdra-container">
            <h3>
                
                {insideFdra ? 'Your FDRA:' : 'Nearest FDRA: '}
            </h3>
            
            <div className="closest-fdra-details">
                <Link href={`/fdra/${fdra.id}`} className="fdra-link">
                    <div className="fdra-info">
                        <span className="fdra-name">{fdra.name}</span>
                        <span className="fdra-dispatch">{fdra.dispatchName}</span>
                    </div>
                    
                    <div className="danger-indicator">
                        <span 
                            className="danger-color-block"
                            style={{ backgroundColor: dangerColor }}
                        />
                        <span className="danger-level-text">{fdra.dangerLevel}</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}