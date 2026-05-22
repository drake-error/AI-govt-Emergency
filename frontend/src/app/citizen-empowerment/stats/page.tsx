"use client";

import { useEffect, useState } from "react";
import type { Complaint } from "@/lib/supabase";
import { BarChart3, MapPin, Loader2, TrendingUp, AlertTriangle } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  road: "🛣️", pothole: "🕳️", drainage: "💧", garbage: "🗑️",
  streetlight: "💡", encroachment: "🚧", water: "🚿",
  toilet: "🚻", bridge: "🌉", tree: "🌳",
};

export default function StatsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/citizen/complaints?filter=all")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
    </div>
  );

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.is_resolved).length;
  const critical = complaints.filter((c) => c.severity === "critical" && !c.is_resolved).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  complaints.forEach((c) => { categoryCount[c.category] = (categoryCount[c.category] || 0) + 1; });
  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCategories[0]?.[1] || 1;

  // City breakdown
  const cityCount: Record<string, number> = {};
  complaints.forEach((c) => { if (c.city) cityCount[c.city] = (cityCount[c.city] || 0) + 1; });
  const sortedCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCity = sortedCities[0]?.[1] || 1;

  // State breakdown
  const stateCount: Record<string, number> = {};
  complaints.forEach((c) => { if (c.state) stateCount[c.state] = (stateCount[c.state] || 0) + 1; });

  return (
    <div className="h-full overflow-y-auto bg-slate-100 dark:bg-slate-950">
      <div className="p-4 space-y-4">
        <h2 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-500" /> Live Stats Dashboard
        </h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Reports", value: total, icon: "📋", color: "bg-slate-900 text-white" },
            { label: "Resolved", value: resolved, icon: "✅", color: "bg-green-500 text-white" },
            { label: "Critical Active", value: critical, icon: "🔴", color: "bg-red-500 text-white" },
            { label: "Resolution Rate", value: `${resolutionRate}%`, icon: "📈", color: "bg-blue-500 text-white" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`${color} rounded-2xl p-4 shadow-md`}>
              <div className="text-2xl mb-1">{icon}</div>
              <p className="font-black text-2xl">{value}</p>
              <p className="text-xs opacity-80 font-semibold">{label}</p>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
          <h3 className="font-black text-slate-700 dark:text-slate-200 text-sm mb-3">Issues by Category</h3>
          <div className="space-y-2">
            {sortedCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-base w-6">{CATEGORY_ICONS[cat] || "📍"}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-300">{cat}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                      style={{ width: `${(count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
          <h3 className="font-black text-slate-700 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" /> Most Active Cities
          </h3>
          <div className="space-y-2">
            {sortedCities.map(([city, count], i) => (
              <div key={city} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-yellow-500" : "bg-slate-400"}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{city}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${(count / maxCity) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
          <h3 className="font-black text-slate-700 dark:text-slate-200 text-sm mb-3">State-wise Overview</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stateCount).sort((a, b) => b[1] - a[1]).map(([state, count]) => (
              <div key={state} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{state}</span>
                <span className="text-xs font-black text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
          <h3 className="font-black text-slate-700 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Active Severity Breakdown
          </h3>
          {[
            { label: "Critical", color: "bg-red-500", key: "critical" },
            { label: "Serious", color: "bg-orange-500", key: "serious" },
            { label: "Minor", color: "bg-yellow-500", key: "minor" },
          ].map(({ label, color, key }) => {
            const count = complaints.filter((c) => c.severity === key && !c.is_resolved).length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-16">{label}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="pb-4 text-center text-xs text-slate-400">
          Data refreshes on page load • Community-powered civic reporting
        </div>
      </div>
    </div>
  );
}
