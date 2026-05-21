"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function AdminMap() {
  const [position, setPosition] = useState<[number, number]>([12.9716, 77.5946]); // Defaulting to a central location

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err)
      );
    }
  }, []);

  // Mock Geofence Coordinates
  const geofence: [number, number][] = [
    [position[0] + 0.02, position[1] - 0.02],
    [position[0] + 0.02, position[1] + 0.02],
    [position[0] - 0.02, position[1] + 0.02],
    [position[0] - 0.02, position[1] - 0.02],
  ];

  return (
    <MapContainer center={position} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Geofenced Area */}
      <Polygon positions={geofence} pathOptions={{ color: 'blue', fillColor: '#3b82f6', fillOpacity: 0.2 }}>
         <Popup>Active Deployment Zone (Geofenced)</Popup>
      </Polygon>
      
      {/* Mock Worker inside Geofence */}
      <Marker position={[position[0] + 0.01, position[1] + 0.01]} icon={L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
        <Popup>Worker #4021 - On Duty</Popup>
      </Marker>

      {/* Mock Worker outside Geofence */}
      <Marker position={[position[0] - 0.03, position[1] - 0.03]} icon={L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png', shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
        <Popup>Worker #4155 - Off Duty</Popup>
      </Marker>
      
    </MapContainer>
  );
}
