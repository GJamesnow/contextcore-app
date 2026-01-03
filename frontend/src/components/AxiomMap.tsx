"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
export interface TelemetryPoint { id: number; lat: number; lng: number; message: string; source: string; }
interface AxiomMapProps { data: TelemetryPoint[]; }
const createPulseIcon = () => {
  return L.divIcon({
    className: "custom-div-icon",
    html: '<div style="background-color: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,123,255,0.6);"></div>',
    iconSize: [12, 12], iconAnchor: [6, 6], popupAnchor: [0, -10]
  });
};
const AxiomMap = ({ data }: AxiomMapProps) => {
  return (
    <MapContainer center={[51.0447, -114.0719]} zoom={10} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data.map((point, idx) => (
        <Marker key={point.id || idx} position={[point.lat, point.lng]} icon={createPulseIcon()}>
          <Popup><div><strong style={{ color: '#007bff' }}>{point.source}</strong><br />{point.message}</div></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
export default AxiomMap;