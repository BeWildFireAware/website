
import { createClient } from "@supabase/supabase-js";
//get and parse lat and long from query

//haversine distance(distace between two lat long points) used for finding closest fdra when user is outside all polygons
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;  //degree to radians(expected format)
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +  //square of sine of half lat dist
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *  //cos of start, account for curve)
        Math.sin(dLng / 2) * Math.sin(dLng / 2); //square of sin of other half
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); //convert to angular distance in radians
    return R * c; //radius by cental angle
}

//check if point within polygon
function pointInPolygon(lat, lng, polygon) {
    if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) {
        return false;
    }
    
    const ring = polygon.coordinates[0];
    let inside = false;
    
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0]; // longitude
        const yi = ring[i][1]; // latitude
        const xj = ring[j][0];
        const yj = ring[j][1];
        
        const intersect = ((yi > lat) !== (yj > lat)) &&
            (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        
        if (intersect) inside = !inside;
    }
    
    return inside;
}

//get center of polygon
function getPolygonCenter(polygon) {
    if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) {
        return null;
    }
    
    const ring = polygon.coordinates[0];
    let sumLat = 0, sumLng = 0;
    
    for (const point of ring) {
        sumLng += point[0]; // longitude
        sumLat += point[1]; // latitude
    }
    
    return { //avg out vals
        lat: sumLat / ring.length,
        lng: sumLng / ring.length
    };
}


export async function GET(request) {
    try {
        
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));

        if (isNaN(lat) || isNaN(lng)) {
            return Response.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
        }
        
        // Validate environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('FDRA API: Missing environment variables');
            return Response.json({ error: 'Server configuration error' }, { status: 500 });
        }
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Fetch all FDRAs with polygons
        const { data, error } = await supabase
            .from('FDRA')
            .select(`
                FDRA_ID,
                FDRAname,
                Danger_Level,
                DispatchArea:Dispatch_ID (DispatchName),
                Map_Poly
            `)
            .not("Map_Poly", "is", null); //no null polys

        if (error) {
            console.error('Supabase error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return Response.json({ inside: false, closest: null });
        }

        // First: Check if user is inside any FDRA polygon
        for (const fdra of data) {
            if (fdra.Map_Poly && pointInPolygon(lat, lng, fdra.Map_Poly)) {
                return Response.json({
                    inside: true,
                    closest: {
                        id: fdra.FDRA_ID,
                        name: fdra.FDRAname,
                        dispatchName: fdra.DispatchArea?.DispatchName || 'Unknown',
                        dangerLevel: fdra.Danger_Level || 'Unknown'
                    }
                });
            }
        }

        // Second, user is outside all polygons, find closest by distance
        let closestFdra = null;
        let minDistance = Infinity;

        for (const fdra of data) {
            const center = getPolygonCenter(fdra.Map_Poly);
            if (center) {
                const distance = haversineDistance(lat, lng, center.lat, center.lng); //get dist to center point from location
                if (distance < minDistance) {
                    minDistance = distance; //get lowest dist fdra
                    closestFdra = {
                        id: fdra.FDRA_ID,
                        name: fdra.FDRAname,
                        dispatchName: fdra.DispatchArea?.DispatchName || 'Unknown',
                        dangerLevel: fdra.Danger_Level || 'Unknown'
                    };
                }
            }
        }

        return Response.json({
            inside: false,
            closest: closestFdra
        });

    } catch (error) {
        console.error('Error in closest FDRA route:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}