"use client";

import { useEffect, useRef } from "react";
import type { Complaint } from "@/lib/supabase";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  serious: "#f97316",
  minor: "#eab308",
};

const CATEGORY_ICONS: Record<string, string> = {
  road: "🛣️", pothole: "🕳️", drainage: "💧", garbage: "🗑️",
  streetlight: "💡", encroachment: "🚧", water: "🚿",
  toilet: "🚻", bridge: "🌉", tree: "🌳",
};

interface Props {
  complaints: Complaint[];
  onMapClick?: (lat: number, lng: number) => void;
  draggablePin?: { lat: number; lng: number } | null;
  onPinMove?: (lat: number, lng: number) => void;
}

export default function MapView({ complaints, onMapClick, draggablePin, onPinMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const draggablePinRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Dynamic import Leaflet
    import("leaflet").then((L) => {
      if (mapRef.current) return; // already initialized

      // Fix icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [13.0827, 80.2707], // Chennai center
        zoom: 7,
        zoomControl: false,
      });

      // ESRI Satellite tiles (same as SOS page)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "ESRI World Imagery",
          maxZoom: 19,
        }
      ).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;

      // Map click handler
      if (onMapClick) {
        map.on("click", (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update complaint markers
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    import("leaflet").then((L) => {
      // Clear existing markers except draggable pin
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && !layer.options?.draggable) {
          mapRef.current.removeLayer(layer);
        }
      });

      complaints.forEach((c) => {
        const color = c.is_resolved ? "#22c55e" : (SEVERITY_COLORS[c.severity] || "#eab308");
        const icon = CATEGORY_ICONS[c.category] || "📍";

        const markerIcon = L.divIcon({
          html: `<div style="
            background:${color};
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            width:28px;height:28px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          "><span style="transform:rotate(45deg);font-size:12px">${icon}</span></div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        const marker = L.marker([c.latitude, c.longitude], { icon: markerIcon }).addTo(mapRef.current);
        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:200px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="background:${color};color:white;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;text-transform:uppercase">${c.is_resolved ? "RESOLVED ✅" : c.severity}</span>
              <span style="font-size:16px">${icon}</span>
            </div>
            <p style="font-weight:700;margin:0 0 2px;font-size:13px">${c.street || c.city}</p>
            <p style="color:#64748b;font-size:11px;margin:0 0 4px">${c.ward ? c.ward + ", " : ""}${c.city}, ${c.state}</p>
            ${c.description ? `<p style="font-size:11px;margin:4px 0;color:#374151">${c.description}</p>` : ""}
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:#94a3b8">
              <span>⚡ Elo: ${c.elo_rating}</span>
              <span>🗳️ ${c.votes_count} votes</span>
            </div>
          </div>
        `);
      });
    });
  }, [complaints]);

  // Draggable pin for report wizard
  useEffect(() => {
    if (!mapRef.current || !draggablePin || typeof window === "undefined") return;
    import("leaflet").then((L) => {
      if (draggablePinRef.current) {
        draggablePinRef.current.setLatLng([draggablePin.lat, draggablePin.lng]);
      } else {
        const pin = L.marker([draggablePin.lat, draggablePin.lng], {
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(mapRef.current);
        pin.bindPopup("📍 Drag to exact location").openPopup();
        pin.on("dragend", (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          onPinMove?.(lat, lng);
        });
        draggablePinRef.current = pin;
        mapRef.current.setView([draggablePin.lat, draggablePin.lng], 16);
      }
    });
  }, [draggablePin]);

  return <div ref={containerRef} className="w-full h-full" />;
}
