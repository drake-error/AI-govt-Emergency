"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CitizenMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err)
      );
    }
  }, []);

  if (!position) return <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-500 rounded-xl">Locating...</div>;

  return (
    <MapContainer center={position} zoom={13} className="h-full w-full rounded-xl z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User Location */}
      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>
      
      {/* Mock Hazard Zone */}
      <Circle center={[position[0] + 0.01, position[1] + 0.01]} radius={500} pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.4 }}>
        <Popup>Active Hazard Zone</Popup>
      </Circle>
      
      {/* Mock Relief Camp */}
      <Marker position={[position[0] - 0.015, position[1] - 0.01]} icon={L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
         <Popup>Govt Relief Camp (Food & Shelter)</Popup>
      </Marker>
    </MapContainer>
  );
}
