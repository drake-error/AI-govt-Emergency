import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Shield, Home, Landmark, Users, PhoneCall, Globe, Search, ArrowRight } from "lucide-react";
import AccessibilityBar from "@/components/AccessibilityBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "National Disaster Management & Civic Care Portal",
  description: "Official E-Governance Gateway | Government of India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        
        {/* 1. TRICOLOR TOP STRIP & ACCESSIBILITY BAR */}
        <AccessibilityBar />

        {/* 2. OFFICIAL GOVERNMENT PORTAL BRANDING HEADER */}
        <header className="bg-white border-b border-slate-200 shadow-sm py-4 px-4 md:px-8 z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo and Seal */}
            <div className="flex items-center space-x-4">
              {/* Simulated Indian Emblem */}
              <div className="w-16 h-16 flex items-center justify-center bg-amber-50 border border-amber-200 rounded-lg p-1.5 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-800 fill-current">
                  <path d="M50,5 C35,15 35,45 35,65 C35,75 42,85 50,95 C58,85 65,75 65,65 C65,45 65,15 50,5 Z" className="opacity-20" />
                  <circle cx="50" cy="40" r="10" />
                  <path d="M42,50 L58,50 L50,90 Z" />
                  <rect x="47" y="20" width="6" height="20" rx="3" />
                  <circle cx="50" cy="70" r="4" />
                </svg>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 leading-none">
                  राष्ट्रीय आपदा प्रबंधन प्राधिकरण
                </h1>
                <p className="text-xs md:text-sm font-bold text-slate-600 mt-1 uppercase tracking-wider">
                  National Disaster Management Authority
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Sovereign Civic Care & Emergency Compliance Ecosystem</p>
              </div>
            </div>

            {/* Department Seals & Search */}
            <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
              <div className="relative w-full max-w-xs hidden sm:block">
                <input 
                  type="text" 
                  placeholder="Search Schemes, SOS, Helplines..." 
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 pl-8"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
              <div className="flex items-center space-x-2 text-slate-800 font-bold bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block mr-1"></span>
                LIVE COMMAND: ACTIVE EMERGENCY GATEWAY
              </div>
            </div>
          </div>
        </header>

        {/* 3. NATIONAL PORTAL MAIN NAVIGATION BAR */}
        <nav className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex flex-1 overflow-x-auto scrollbar-none font-medium text-sm">
              <Link href="/" className="flex items-center space-x-2 px-5 py-4 border-b-2 border-amber-500 bg-slate-950/40 text-amber-500 font-semibold transition-colors">
                <Home className="w-4 h-4" />
                <span>Citizen Distress Hub</span>
              </Link>
              <Link href="/admin" className="flex items-center space-x-2 px-5 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent transition-colors whitespace-nowrap">
                <Landmark className="w-4 h-4 text-blue-400" />
                <span>District Command Center</span>
              </Link>
              <Link href="/admin/workforce" className="flex items-center space-x-2 px-5 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent transition-colors whitespace-nowrap">
                <Users className="w-4 h-4 text-green-400" />
                <span>Workforce & Payroll</span>
              </Link>
              <Link href="/schemes" className="flex items-center space-x-2 px-5 py-4 hover:bg-slate-800 hover:text-amber-400 border-b-2 border-transparent transition-colors whitespace-nowrap text-slate-400">
                <Shield className="w-4 h-4" />
                <span>Ex-Gratia Schemes</span>
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center text-xs font-bold text-amber-400 space-x-2">
              <PhoneCall className="w-4 h-4" />
              <span>TOLL FREE CRISIS HELPLINE: 112 / 1078</span>
            </div>
          </div>
        </nav>

        {/* 4. SCROLLING EMERGENCY NOTICE TICKER */}
        <div className="bg-red-600 text-white text-xs font-bold py-2 px-4 md:px-8 overflow-hidden shadow-sm flex items-center border-b border-red-700">
          <span className="bg-red-800 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase mr-3 shrink-0">CRITICAL UPDATE</span>
          <div className="flex-1 overflow-hidden">
            <span className="ticker-text">
              ⚠️ CYCLONE WARNING: Red Warning issued for east coastal districts. All SDRF deployment teams reporting status. Citizens are advised to utilize the AI Distress Assistant on this portal to share location. Live compensation payroll module initiated for all emergency relief workers.
            </span>
          </div>
        </div>

        {/* 5. MAIN CONTENT FRAME */}
        <main className="flex-1 flex flex-col relative w-full max-w-7xl mx-auto md:p-6 lg:p-8">
          {children}
        </main>

        {/* 6. NIC SECURE GOVT FOOTER */}
        <footer className="bg-slate-900 border-t-8 border-amber-600 text-slate-400 text-sm mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center p-1 font-black text-amber-500 border border-slate-700">NDMA</div>
                <h3 className="font-extrabold text-lg tracking-wider text-slate-100">GovCare Core DPI</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Official Unified Citizen Distress Response Support & Administrative Biometric Ledger Platform. Developed by state departments for rapid compensation & compliance.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">Portal Gateway</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-amber-500 transition-colors">Citizen Emergency Services</Link></li>
                <li><Link href="/admin" className="hover:text-amber-500 transition-colors">Command Operations Login</Link></li>
                <li><Link href="/admin/workforce" className="hover:text-amber-500 transition-colors">Emergency Workforce Payroll</Link></li>
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Disaster Management Act guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">State Helplines</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li className="flex justify-between"><span>NDMA Emergency Line:</span> <span className="text-amber-400 font-mono">1078</span></li>
                <li className="flex justify-between"><span>National Call Center:</span> <span className="text-amber-400 font-mono">112 / 1070</span></li>
                <li className="flex justify-between"><span>SDRF Operations Desk:</span> <span className="text-amber-400 font-mono">+91 11-26701728</span></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-l-2 border-amber-500 pl-2">Sovereign Compliance</h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">DPI STAMP</p>
                <p className="text-xs text-emerald-400 font-bold flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1.5 animate-pulse"></span>
                  Secured by TripleBlind Crypt
                </p>
                <p className="text-[10px] text-slate-500">Immutable Daily Payroll Settlement Ledgers.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-800/60 text-center px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p>© {new Date().getFullYear()} National Disaster Management Authority. All rights reserved.</p>
              <p className="flex items-center space-x-1.5">
                <span>Designed & Hosted by</span>
                <span className="text-slate-300 font-extrabold uppercase bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px]">National Informatics Centre</span>
              </p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
