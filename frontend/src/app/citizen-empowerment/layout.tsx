"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Hand, Plus, Flag, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/citizen-empowerment", label: "Map", icon: Map },
  { href: "/citizen-empowerment/swipe", label: "Swipe", icon: Hand },
  { href: "/citizen-empowerment/report", label: "Report", icon: Plus, featured: true },
  { href: "/citizen-empowerment/rank", label: "Rank", icon: Flag },
  { href: "/citizen-empowerment/stats", label: "Stats", icon: BarChart3 },
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative bg-slate-100 dark:bg-slate-950 -mx-6 -my-8">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 z-30">
        <div>
          <h1 className="font-black text-base tracking-tight">🏙️ CITIZEN EMPOWERMENT</h1>
          <p className="text-slate-400 text-[10px] font-medium">Report • Rank • Fix — South India Civic Platform</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">● LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Bottom Tab Nav (Rasthe.in style) */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl shrink-0 z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map(({ href, label, icon: Icon, featured }) => {
            const isActive = pathname === href;
            return featured ? (
              <Link key={href} href={href} className="flex flex-col items-center -mt-6">
                <span className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${isActive ? "bg-green-400" : "bg-green-500"}`}>
                  <Icon className="w-7 h-7 text-white" />
                </span>
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-1">{label}</span>
              </Link>
            ) : (
              <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
