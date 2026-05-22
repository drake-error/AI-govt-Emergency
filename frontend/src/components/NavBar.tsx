"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Shield, Home, Landmark, Users, PhoneCall,
  Search, Bot, Bell, FileText, AlertTriangle,
  ChevronLeft, ChevronRight, Building2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function NavBar() {
  const navRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => navRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => navRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  return (
    <nav className="bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 shadow-md sticky top-0 z-40 transition-colors">
      <div className="relative flex items-center">
        {/* Left scroll arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-slate-900 to-transparent hover:from-slate-800 text-white flex items-center transition-colors"
          aria-label="Scroll navigation left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable link strip */}
        <div
          ref={navRef}
          className="flex flex-1 overflow-x-auto font-medium text-sm pl-7 pr-7 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Link href="/" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <Home className="w-4 h-4 text-amber-500" />
            <span>Distress Hub</span>
          </Link>
          <Link href="/sos" className="flex items-center space-x-2 px-4 py-4 hover:bg-red-900/50 hover:text-red-400 border-b-2 border-transparent hover:border-red-400 transition-colors whitespace-nowrap">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-400 font-bold">SOS Emergency</span>
          </Link>
          <Link href="/chatbot" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <Bot className="w-4 h-4 text-violet-400" />
            <span>AI Chatbot</span>
          </Link>
          <Link href="/schemes" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Schemes</span>
          </Link>
          <Link href="/disaster-alerts" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <Bell className="w-4 h-4 text-orange-400" />
            <span>Disaster Alerts</span>
          </Link>
          <Link href="/documents" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Documents</span>
          </Link>
          <Link href="/admin" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <Landmark className="w-4 h-4 text-blue-400" />
            <span>Command Center</span>
          </Link>
          <Link href="/admin/workforce" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap">
            <Users className="w-4 h-4 text-green-400" />
            <span>Workforce Payroll</span>
          </Link>
          <Link href="/citizen-empowerment" className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-800 hover:text-green-400 border-b-2 border-transparent hover:border-green-400 transition-colors whitespace-nowrap">
            <Building2 className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold">Citizen Empowerment</span>
          </Link>

          {/* Crisis line – stays visible on large screens */}
          <div className="hidden lg:flex items-center text-xs font-bold text-amber-400 space-x-2 shrink-0 ml-auto px-4">
            <PhoneCall className="w-4 h-4" />
            <span>CRISIS LINE: 112 / 1078</span>
          </div>
        </div>

        {/* Right scroll arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-slate-900 to-transparent hover:from-slate-800 text-white flex items-center transition-colors"
          aria-label="Scroll navigation right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
