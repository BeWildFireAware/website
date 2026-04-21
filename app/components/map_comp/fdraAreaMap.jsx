//issue:very slow to load

'use client';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { use, useEffect, useState } from 'react';
import L from 'leaflet'; //import leaftlet lobrary
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths in Next.js(otherwise they won't display)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
//basic style for map container, can be adjusted as needed, moved to globals
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px'
};

const defaultCenter = [38.9979, -105.5506]; //centered on Colorado, can adjust to better fit the data or user location(gps)
const defaultZoom = 7; //zoom when entering page

//color maps for danger levels, can adjust colors and levels as needed
const dangerLevelColors = {
  'Low': '#2ecc71',
  'Moderate': '#f3c612',
  'High': '#e35311',
  'Very High': '#c0392b',
  'Extreme': '#8e44ad',
  'Unknown': '#95a5a6' //default color for unknown levels
};



function UserCenterUpdate({center}){ //function to update map center to user location, passed lat long is new center
    const map = useMap();
    useEffect(() => {
        if(center){
            map.setView(center, defaultZoom); //update map view to new center with default zoom
        }
    }, [center, map]); 
    return null; //this component doesn't render anything itself, just updates map center
}

export default function FdraMap() {
  const [fdras, setFdras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //gps data states
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('User location obtained:', position.coords);
                setUserLocation([position.coords.latitude, position.coords.longitude]);
                setLocationLoading(false);
            },
            (error) => {
                console.log('Error getting user location:', error);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } //timeout and allow best accuracy possible
        );
    }, []); //only run on mount        





  useEffect(() => {
    fetch('/api/fdra/polygons') //get data from api route created for polygons
      .then(res => { //if error with fetch, catch and display error message instead of map
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('API Response:', data);
        // Check if data is an array, if not, check if it has an error property
        if (Array.isArray(data)) {
          setFdras(data);
        } 
        else if (data.error) {
          console.error('API returned error:', data.error);
          setError(data.error);
          setFdras([]);
        } 
        else { //above cases fail
          console.warn('Unexpected data format:', data);
          setFdras([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load polygons:', err);
        setError(err.message);
        setFdras([]);
        setLoading(false);
      });
  }, []);

  // Only create GeoJSON if we have valid data
  //this creates the polygon and assigns popup vals for each polygon(adjust to add link to data page)
  const geoJsonData = fdras.length > 0 ? { //if fdras existcreate objelse null
    type: 'FeatureCollection', //create feature collection formap
    features: fdras.map(fdra => ({
      type: 'Feature', //create feature for each fdra with polygon and popup info
      properties: {
        id: fdra.id,
        name: fdra.name,
        dispatchName: fdra.dispatchName,
        dangerLevel: fdra.dangerLevel
      },
      geometry: fdra.polygon //set the polygon with the above info
    }))
  } : null; //if none nothing populated

  //for each feature added to map
  const onEachFeature = (feature, layer) => { //leaflet layer obj that represents this feature
    const { name, dispatchName, id, dangerLevel } = feature.properties; //extract name dipsatch name for popup
    
    const fillColor = dangerLevelColors[dangerLevel] || dangerLevelColors['Unknown']; //get color based on danger level, default to unknown if not found
    layer.setStyle({ //set consistent style(edit to adjust colors for each,(just adjecnt change or chnage on danger level))
      fillColor: fillColor,
      fillOpacity: 0.3,
      color: '#3388FF', //border separating each area
      weight: 2,
      opacity: 0.8
    });

    //attach popup to polygon
    layer.bindPopup(`
      <div style="padding: 8px; font-family: sans-serif;">
        <strong>FDRA: ${name}</strong><br/>
        Dispatch Area: ${dispatchName} <br/>
        Danger Level: ${dangerLevel} <br/>
        <a href="/fdra/${id}" style="color: #07478c; text-decoration: none;">View Data</a>
      </div>
    `);
  };

  if (loading || locationLoading) {
    return <div style={mapContainerStyle}>Loading map...</div>;
  }

  if (error) {
    return <div style={mapContainerStyle}>Error: {error}</div>;
  }

  const mapCenter = userLocation || defaultCenter; //use user location if available, otherwise default
  if (!geoJsonData || fdras.length === 0) { //if no data, display map with no polygons and message, set defaults
    //replace center with gps data
    return (

      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 8 : defaultZoom} //zoom in more if we have user location
        style={mapContainerStyle}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    );
  }
  //else if data exists, display map with polygons and popups
  return (
    <MapContainer
      center={mapCenter}
      zoom={userLocation ? 8 : defaultZoom}
      style={mapContainerStyle}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}