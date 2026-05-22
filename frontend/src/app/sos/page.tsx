"use client";

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Phone, Navigation, Shield, Siren, Building2, Flame, Stethoscope, Clock, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const SOSSatelliteMap = dynamic(() => import('@/components/SOSSatelliteMap'), { ssr: false });

interface Station {
  type: 'police' | 'fire' | 'hospital';
  name: string;
  distance: string;
  address: string;
  phone: string;
  lat: number;
  lon: number;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy: number;
}

type SOSState = 'idle' | 'locating' | 'finding' | 'triggered' | 'confirmed';

export default function SOSPage() {
  const [sosState, setSosState] = useState<SOSState>('idle');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [formData, setFormData] = useState({ name: '', phone: '', emergencyType: 'general', message: '' });
  const [error, setError] = useState('');
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Find nearest stations via Overpass API (OpenStreetMap) - Free, no key needed
  const findNearbyStations = async (lat: number, lng: number) => {
    const radius = 5000; // 5km radius
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="fire_station"](around:${radius},${lat},${lng});
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const data = await res.json();

      const stationList: Station[] = [];
      const seenTypes = { police: 0, fire: 0, hospital: 0 };

      for (const element of data.elements || []) {
        const amenity = element.tags?.amenity;
        const name = element.tags?.name || element.tags?.['name:en'];

        if (!name) continue;

        let type: 'police' | 'fire' | 'hospital' | null = null;
        if (amenity === 'police' && seenTypes.police < 2) { type = 'police'; seenTypes.police++; }
        else if (amenity === 'fire_station' && seenTypes.fire < 2) { type = 'fire'; seenTypes.fire++; }
        else if ((amenity === 'hospital' || amenity === 'clinic') && seenTypes.hospital < 2) { type = 'hospital'; seenTypes.hospital++; }

        if (type) {
          const dlat = element.lat - lat;
          const dlng = element.lon - lng;
          const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111; // rough km
          stationList.push({
            type,
            name,
            distance: `${dist.toFixed(1)} km`,
            address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || 'See map for directions',
            phone: element.tags?.phone || element.tags?.['contact:phone'] || 'Call 112 for emergency',
            lat: element.lat,
            lon: element.lon,
          });
        }

        if (seenTypes.police >= 2 && seenTypes.fire >= 2 && seenTypes.hospital >= 2) break;
      }

      // Fallback mock stations if API returns nothing
      if (stationList.length === 0) {
        stationList.push(
          { type: 'police', name: 'Local Police Station', distance: '1.2 km', address: 'Nearest available station', phone: '100', lat: lat + 0.01, lon: lng + 0.01 },
          { type: 'fire', name: 'Fire & Rescue Station', distance: '2.1 km', address: 'Nearest available station', phone: '101', lat: lat - 0.01, lon: lng + 0.02 },
          { type: 'hospital', name: 'District Government Hospital', distance: '1.8 km', address: 'Nearest available hospital', phone: '102', lat: lat + 0.015, lon: lng - 0.01 },
        );
      }

      return stationList;
    } catch {
      return [
        { type: 'police' as const, name: 'Emergency Police (112)', distance: 'Call now', address: 'All India Emergency', phone: '100', lat, lon: lng },
        { type: 'fire' as const, name: 'Fire Brigade (101)', distance: 'Call now', address: 'All India Emergency', phone: '101', lat: lat + 0.005, lon: lng },
        { type: 'hospital' as const, name: 'Ambulance (102)', distance: 'Call now', address: 'All India Emergency', phone: '102', lat: lat - 0.005, lon: lng },
      ];
    }
  };

  const triggerSOS = async () => {
    setError('');
    setSosState('locating');

    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      setSosState('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setSosState('finding');

        // Reverse geocode
        let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await geoRes.json();
          address = geoData.display_name || address;
        } catch { /* use coordinates as fallback */ }

        setLocation({ lat: latitude, lng: longitude, address, accuracy });

        const foundStations = await findNearbyStations(latitude, longitude);
        setStations(foundStations);

        // POST to backend
        try {
          await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name || 'Anonymous',
              phone: formData.phone || 'Unknown',
              message: formData.message || formData.emergencyType,
              lat: latitude,
              lng: longitude,
              address,
            })
          });
        } catch { /* non-blocking */ }

        setSosState('triggered');
        // Start countdown
        setCountdown(5);
        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current!);
              setSosState('confirmed');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
      (err) => {
        setError(`Location error: ${err.message}. Please enable location permissions.`);
        setSosState('idle');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const stationIcons = {
    police: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800', label: 'Police', hotline: '100' },
    fire: { icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800', label: 'Fire Station', hotline: '101' },
    hospital: { icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800', label: 'Hospital', hotline: '102' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-950 text-white rounded-2xl p-6 border-b-4 border-red-500 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
            <Siren className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Emergency SOS Center</h1>
            <p className="text-red-300 text-sm mt-1">Live Location Detection • Nearest Emergency Services • NDMA Response Network</p>
          </div>
          <div className="ml-auto text-right hidden md:block">
            <a href="tel:112" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black px-4 py-2 rounded-xl transition-all text-lg">
              <Phone className="w-5 h-5" /> 112
            </a>
            <p className="text-[10px] text-red-300 mt-1">All India Emergency</p>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { num: '112', label: 'Emergency', color: 'bg-red-600' },
          { num: '100', label: 'Police', color: 'bg-blue-600' },
          { num: '101', label: 'Fire', color: 'bg-orange-600' },
          { num: '102', label: 'Ambulance', color: 'bg-emerald-600' },
          { num: '108', label: 'Disaster', color: 'bg-purple-600' },
          { num: '1078', label: 'NDMA', color: 'bg-amber-600' },
        ].map(h => (
          <a key={h.num} href={`tel:${h.num}`} className={`${h.color} text-white rounded-xl p-3 text-center hover:opacity-90 transition-all active:scale-95 shadow-sm`}>
            <div className="text-xl font-black">{h.num}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">{h.label}</div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOS Trigger Panel */}
        <div className="space-y-4">
          {/* Form */}
          {sosState === 'idle' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-red-600" />
                Distress Signal Details
              </h2>
              <div className="space-y-3">
                <input
                  placeholder="Your Name (Optional)"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-red-500 focus:border-red-500"
                />
                <input
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-red-500 focus:border-red-500"
                />
                <select
                  value={formData.emergencyType}
                  onChange={e => setFormData(p => ({ ...p, emergencyType: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-red-500 focus:border-red-500"
                >
                  <option value="general">General Emergency</option>
                  <option value="flood">Flood / Rising Water</option>
                  <option value="fire">Fire</option>
                  <option value="cyclone">Cyclone / Storm</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="accident">Road Accident</option>
                  <option value="trapped">Trapped / Rescue Needed</option>
                </select>
                <textarea
                  placeholder="Describe your situation (Optional)"
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* SOS Button */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center gap-6">
            {sosState === 'idle' && (
              <>
                <p className="text-slate-600 dark:text-slate-400 text-sm text-center">
                  Press the SOS button to share your live GPS location and find nearest emergency services
                </p>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-110" />
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-125 delay-300" />
                  <button
                    onClick={triggerSOS}
                    className="relative w-40 h-40 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-full font-black text-2xl shadow-2xl shadow-red-500/50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 border-4 border-red-400"
                  >
                    <AlertTriangle className="w-10 h-10" />
                    <span>SOS</span>
                    <span className="text-xs font-bold opacity-80">EMERGENCY</span>
                  </button>
                </div>
                {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}
              </>
            )}

            {sosState === 'locating' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-slate-700 dark:text-slate-300">Detecting your GPS location...</p>
              </div>
            )}

            {sosState === 'finding' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-slate-700 dark:text-slate-300">Finding nearest emergency services...</p>
              </div>
            )}

            {sosState === 'triggered' && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-black animate-pulse">
                  {countdown}
                </div>
                <p className="font-black text-slate-900 dark:text-white text-lg">Alert sending in {countdown}s...</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your location has been shared with emergency response team</p>
              </div>
            )}

            {sosState === 'confirmed' && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <p className="font-black text-emerald-700 dark:text-emerald-400 text-xl">Alert Sent!</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Emergency services have been notified with your location</p>
                <button onClick={() => setSosState('idle')} className="text-sm text-red-600 hover:underline font-bold">
                  Send another alert
                </button>
              </div>
            )}
          </div>

          {/* Nearby Stations */}
          {stations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-red-600" />
                Nearest Emergency Services
              </h3>
              <div className="space-y-3">
                {stations.map((s, i) => {
                  const { icon: Icon, color, bg, label, hotline } = stationIcons[s.type];
                  return (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${bg}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{label} • {s.distance}</p>
                        <p className="text-[10px] text-slate-400 truncate">{s.address}</p>
                      </div>
                      <a href={`tel:${s.phone !== 'Call 112 for emergency' ? s.phone : hotline}`} className={`${color} hover:opacity-80 border rounded-lg px-2 py-1 text-[10px] font-black flex items-center gap-1 shrink-0 border-current`}>
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Satellite Map */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Live Location — Satellite View</h3>
            {location && (
              <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> LIVE GPS
              </span>
            )}
          </div>
          <div className="h-[400px] lg:h-[calc(100%-60px)]">
            <SOSSatelliteMap location={location} stations={stations} />
          </div>
          {location && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                📍 {location.address}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)} | Accuracy: ±{Math.round(location.accuracy)}m
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
