"use client";

import { useEffect, useState, useCallback } from "react";
import type { Complaint } from "@/lib/supabase";
import { ThumbsUp, SkipForward, Loader2 } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  road: "🛣️", pothole: "🕳️", drainage: "💧", garbage: "🗑️",
  streetlight: "💡", encroachment: "🚧", water: "🚿",
  toilet: "🚻", bridge: "🌉", tree: "🌳",
};
const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600", serious: "bg-orange-500", minor: "bg-yellow-500",
};

export default function SwipePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [voted, setVoted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/citizen/complaints?filter=all&resolved=false")
      .then((r) => r.json())
      .then((d) => {
        const shuffled = (d.complaints || []).sort(() => Math.random() - 0.5);
        setComplaints(shuffled);
      })
      .finally(() => setLoading(false));
  }, []);

  const pair = complaints.length >= 2
    ? [complaints[pairIndex * 2], complaints[pairIndex * 2 + 1]].filter(Boolean)
    : [];

  const maxPairs = Math.floor(complaints.length / 2);

  const vote = useCallback(async (worseIdx: number) => {
    if (pair.length < 2 || voting) return;
    setVoting(true);
    const worse = pair[worseIdx];
    const better = pair[1 - worseIdx];

    await fetch("/api/citizen/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worse_id: worse.id, better_id: better.id }),
    });

    setVoted((v) => v + 1);
    if (pairIndex + 1 >= maxPairs) {
      setDone(true);
    } else {
      setPairIndex((i) => i + 1);
    }
    setVoting(false);
  }, [pair, pairIndex, maxPairs, voting]);

  const skip = () => {
    if (pairIndex + 1 >= maxPairs) setDone(true);
    else setPairIndex((i) => i + 1);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
    </div>
  );

  if (complaints.length < 2) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-center px-6">
      <span className="text-5xl mb-4">🗳️</span>
      <h2 className="text-xl font-black text-slate-700 dark:text-slate-200 mb-2">Not enough reports yet</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm">Submit at least 2 complaints to start voting.</p>
    </div>
  );

  if (done) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-center px-6">
      <span className="text-5xl mb-4">🎉</span>
      <h2 className="text-xl font-black text-slate-700 dark:text-slate-200 mb-2">You voted on {voted} pairs!</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Your votes help prioritize civic issues. Thank you!</p>
      <button onClick={() => { setPairIndex(0); setDone(false); setVoted(0); setComplaints(c => [...c].sort(() => Math.random() - 0.5)); }}
        className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
        Vote Again
      </button>
    </div>
  );

  const renderCard = (complaint: Complaint, idx: number) => (
    <div
      key={complaint.id}
      onClick={() => vote(idx)}
      className={`relative flex-1 overflow-hidden cursor-pointer group transition-all duration-200 hover:brightness-110 active:scale-[0.98] ${idx === 0 ? "border-b-2 border-white/30" : ""}`}
      style={{ background: "#1e293b" }}
    >
      {/* Background image or gradient */}
      {complaint.image_url && complaint.image_url.startsWith("http") ? (
        <img src={complaint.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Hover vote indicator */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="w-20 h-20 rounded-full bg-red-500/90 flex items-center justify-center shadow-2xl">
          <span className="text-white font-black text-xs text-center leading-tight">THIS<br/>IS<br/>WORSE</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className={`${SEVERITY_COLORS[complaint.severity]} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase`}>
            {complaint.severity}
          </span>
          {complaint.ward && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">WARD {complaint.ward}</span>}
        </div>
        <p className="text-white font-black text-lg leading-tight">
          {CATEGORY_ICONS[complaint.category]} {complaint.street || complaint.city}
        </p>
        <p className="text-white/70 text-xs">{complaint.city}, {complaint.state}</p>
      </div>

      {/* Category icon top-right */}
      <div className="absolute top-3 right-3 text-3xl z-10">{CATEGORY_ICONS[complaint.category]}</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 relative">
      {/* Question */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-full px-4 py-2 shadow-xl">
          <p className="text-slate-700 dark:text-slate-200 font-black text-sm text-center">
            WHICH ISSUE NEEDS ATTENTION MORE?
          </p>
        </div>
      </div>

      {/* VS Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
          <span className="font-black text-slate-700 dark:text-slate-200 text-sm">VS</span>
        </div>
      </div>

      {/* Two complaints stacked */}
      {pair.length >= 2 && (
        <>
          {renderCard(pair[0], 0)}
          {renderCard(pair[1], 1)}
        </>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-white/10 backdrop-blur">
        <span className="text-white/60 text-xs font-bold">{voted} votes cast</span>
        <button onClick={skip} className="flex items-center gap-1 text-white/60 hover:text-white text-xs font-bold transition-colors">
          <SkipForward className="w-4 h-4" /> Skip
        </button>
        <span className="text-white/60 text-xs font-bold">{pairIndex + 1}/{maxPairs} pairs</span>
      </div>
    </div>
  );
}
