'use client';

export default function MapEmbedV1() {
    return (
        <div className="map-container">
            <iframe
                title="Dispatch Area Map"
                src="https://www.google.com/maps/d/u/0/embed?mid=1-J_VEIRPmFNzhZ6BDQoWzloPLUTQ2us&ehbc=2E312F&noprof=1" 
                width="640"
                height="480"
            ></iframe>
        </div>
    );
}