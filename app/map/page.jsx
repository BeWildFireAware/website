import MapEmbedV1 from '../components/map_comp/mapEmbedv1';
export default function MapPage() { 
    return (
        <><h1>Dispatch Areas</h1>
        <p1>Explore the current wildfire danger in your area by selecting a specific region from the Dispatch Areas dropdown menu above.</p1>
        <MapEmbedV1 />
        </>
        
    );
}