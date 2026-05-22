"use client";

import { useEffect, useState } from "react";
import type { Complaint } from "@/lib/supabase";
import { Trophy, Skull, Plus, MapPin, Loader2 } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  road: "🛣️", pothole: "🕳️", drainage: "💧", garbage: "🗑️",
  streetlight: "💡", encroachment: "🚧", water: "🚿",
  toilet: "🚻", bridge: "🌉", tree: "🌳",
};
const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600", serious: "bg-orange-500", minor: "bg-yellow-500",
};

export default function RankPage() {
  const [tab, setTab] = useState<"shame" | "fame">("shame");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const isResolved = tab === "fame";
    fetch(`/api/citizen/complaints?filter=all&resolved=${isResolved}`)
      .then((r) => r.json())
      .then((d) => {
        let sorted = (d.complaints || []) as Complaint[];
        if (tab === "shame") {
          // Hall of Shame: worst Elo first (highest = more urgent)
          sorted = sorted.sort((a, b) => b.elo_rating - a.elo_rating);
        } else {
          // Hall of Fame: most recently resolved
          sorted = sorted.sort((a, b) =>
            new Date(b.resolved_at || b.created_at).getTime() -
            new Date(a.resolved_at || a.created_at).getTime()
          );
        }
        setComplaints(sorted.slice(0, 20));
      })
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="h-full overflow-y-auto bg-slate-100 dark:bg-slate-950">
      {/* Tab toggle */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 flex gap-2">
        <button
          onClick={() => setTab("shame")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all ${tab === "shame" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
        >
          <Skull className="w-4 h-4" /> HALL OF SHAME
        </button>
        <button
          onClick={() => setTab("fame")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all ${tab === "fame" ? "bg-green-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
        >
          <Trophy className="w-4 h-4" /> HALL OF FAME
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <span className="text-5xl mb-4">{tab === "shame" ? "💀" : "🏆"}</span>
          <h3 className="font-black text-slate-700 dark:text-slate-200 mb-2">
            No {tab === "shame" ? "nominations" : "resolved issues"} yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {tab === "shame"
              ? "Know a terrible civic issue? Report and vote to rank it."
              : "Resolved issues will appear here."}
          </p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {complaints.map((c, i) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex gap-3 p-3 border border-slate-100 dark:border-slate-800">
              {/* Rank badge */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                tab === "shame"
                  ? i === 0 ? "bg-red-600 text-white" : i === 1 ? "bg-orange-500 text-white" : i === 2 ? "bg-yellow-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  : "bg-green-100 dark:bg-green-900/30 text-green-600"
              }`}>
                {tab === "shame" ? (i < 3 ? ["💀","☠️","😱"][i] : `#${i+1}`) : "✅"}
              </div>

              {/* Photo thumbnail */}
              {c.image_url && c.image_url.startsWith("http") && (
                <img src={c.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`${SEVERITY_COLORS[c.severity]} text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase`}>
                    {c.severity}
                  </span>
                  <span className="text-slate-400 text-[10px]">{CATEGORY_ICONS[c.category]} {c.category}</span>
                </div>
                <p className="font-black text-slate-800 dark:text-slate-100 text-sm truncate">
                  {c.street || c.city}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{c.ward ? `${c.ward}, ` : ""}{c.city}
                </p>
                {c.description && <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 line-clamp-2">{c.description}</p>}
              </div>

              {/* Elo score */}
              <div className="shrink-0 text-right">
                <p className={`font-black text-lg ${tab === "shame" ? "text-red-500" : "text-green-500"}`}>
                  {c.elo_rating}
                </p>
                <p className="text-slate-400 text-[9px]">ELO</p>
                <p className="text-slate-400 text-[9px]">{c.votes_count} votes</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add nomination CTA */}
      {tab === "shame" && (
        <div className="p-3 pb-6">
          <a href="/citizen-empowerment/report" className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-red-300 dark:border-red-800 text-red-500 rounded-2xl py-4 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <Plus className="w-4 h-4" /> ADD NEW NOMINATION
          </a>
        </div>
      )}
    </div>
  );
}
