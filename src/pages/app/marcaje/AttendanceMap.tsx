import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for bundlers
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
};

export default function AttendanceMap({ lat, lng, label, className = "h-48 w-full rounded-xl" }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      className={className}
      scrollWheelZoom={false}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <Marker position={[lat, lng]} icon={defaultIcon}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  );
}
