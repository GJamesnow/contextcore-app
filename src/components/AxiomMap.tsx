"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function AxiomMap() {
    return (
        <MapContainer 
            center={[51.0447, -114.0719]} 
            zoom={12} 
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer 
                attribution="&copy; OpenStreetMap" 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            />
            <Marker position={[51.0447, -114.0719]}>
                <Popup>Axiom Node Active</Popup>
            </Marker>
        </MapContainer>
    );
}