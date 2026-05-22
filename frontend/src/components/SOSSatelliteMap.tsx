"use client";

import { useEffect, useRef } from 'react';

interface Station {
  type: 'police' | 'fire' | 'hospital';
  name: string;
  lat: number;
  lon: number;
}

interface LocationData {
  lat: number;
  lng: number;
}

interface Props {
  location: LocationData | null;
  stations: Station[];
}

export default function SOSSatelliteMap({ location, stations }: Props) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then(L => {
      if (!mapContainerRef.current) return;

      // Cleanup previous map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const defaultLat = location?.lat ?? 20.5937;
      const defaultLng = location?.lng ?? 78.9629;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: location ? 14 : 5,
        zoomControl: true,
      });

      // ESRI Satellite Tiles (Free, no API key needed)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
          maxZoom: 19,
        }
      ).addTo(map);

      // Overlay labels on satellite
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { attribution: '', maxZoom: 19, opacity: 0.8 }
      ).addTo(map);

      // User location marker (pulsing red)
      if (location) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:24px;height:24px;border-radius:50%;
            background:rgba(220,38,38,0.9);
            border:3px solid white;
            box-shadow:0 0 0 6px rgba(220,38,38,0.3), 0 0 0 12px rgba(220,38,38,0.1);
            animation: pulse 1.5s ease-in-out infinite;
          "></div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([location.lat, location.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>🔴 YOUR LOCATION</b><br>Emergency SOS Active', { maxWidth: 200 });
      }

      // Station markers
      const stationColors = { police: '#2563eb', fire: '#ea580c', hospital: '#16a34a' };
      const stationEmojis = { police: '🚔', fire: '🚒', hospital: '🏥' };

      stations.forEach(s => {
        const color = stationColors[s.type];
        const emoji = stationEmojis[s.type];

        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            color:white;
            padding:4px 6px;
            border-radius:8px;
            font-size:14px;
            font-weight:900;
            border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
            white-space:nowrap;
            display:flex;
            align-items:center;
            gap:4px;
          ">${emoji}</div>`,
          className: '',
          iconSize: [32, 28],
          iconAnchor: [16, 14],
        });

        L.marker([s.lat, s.lon], { icon })
          .addTo(map)
          .bindPopup(`<b>${emoji} ${s.name}</b>`, { maxWidth: 200 });

        // Draw line from user to station
        if (location) {
          L.polyline([[location.lat, location.lng], [s.lat, s.lon]], {
            color,
            weight: 2,
            opacity: 0.6,
            dashArray: '6, 8',
          }).addTo(map);
        }
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location, stations]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="text-5xl mb-3">🛰️</div>
            <p className="font-black text-lg">Satellite Map Ready</p>
            <p className="text-sm text-slate-300 mt-1">Press SOS to detect your live location</p>
          </div>
        </div>
      )}
    </div>
  );
}
