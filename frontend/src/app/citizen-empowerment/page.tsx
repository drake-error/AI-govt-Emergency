"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, MapPin, Clock, RefreshCw } from "lucide-react";
import type { Complaint } from "@/lib/supabase";

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/citizen/MapView"), { ssr: false, loading: () => <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-400 text-sm">Loading satellite map...</div> });

const FILTERS = ["Today", "This Week", "All time"] as const;
type Filter = typeof FILTERS[number];

const filterToParam: Record<Filter, string> = {
  "Today": "today",
  "This Week": "week",
  "All time": "all",
};

export default function CitizenMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<Filter>("All time");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/citizen/complaints?filter=${filterToParam[filter]}&resolved=false`);
      const data = await res.json();
      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="relative w-full h-full">
      {/* Satellite Map */}
      <MapView complaints={complaints} />

      {/* Top filter bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl shadow-xl px-4 py-2 flex items-center gap-2">
          <span className="text-red-600 font-black text-lg">{loading ? "–" : total}</span>
          <span className="text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">TOTAL REPORTS</span>
          <button onClick={load} className="ml-1 text-slate-400 hover:text-green-500 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-full shadow-lg flex overflow-hidden border border-slate-200 dark:border-slate-700">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === f
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-xl shadow-lg p-2 text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Severity</p>
        {[["🔴","Critical"],["🟠","Serious"],["🟡","Minor"],["🟢","Resolved"]].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
