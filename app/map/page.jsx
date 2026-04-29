'use client';
//import FdraMap from '@/app/components/map_comp/fdraAreaMap';
import dynamic from 'next/dynamic'; //for server/client side rendering issues with leaflet

//load map component dynamically to avoid SSR issues with Leaflet
const FdraMap = dynamic(() => import('@/app/components/map_comp/fdraAreaMap'), { ssr: false, loading: () => <p>Loading map...</p> });


export default function MapPage() { //basic css here filling most of the page window 
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>FDRA Map</h1>
      <FdraMap />
      <p>Click on a polygon to see FDRA name and dispatch area.</p>
    </div>
  );
}

//Map Placeholder
/*
import MapEmbedV1 from '../components/map_comp/mapEmbedv1';
export default function MapPage() { 
    return (
        <><h1>Dispatch Areas</h1>
        <p>Explore the current wildfire danger in your area by selecting a specific region from the Dispatch Areas dropdown menu above.</p>
        <MapEmbedV1 />
        </>
        
    );
}
    */