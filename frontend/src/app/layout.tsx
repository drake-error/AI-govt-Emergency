import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Search } from "lucide-react";
import AccessibilityBar from "@/components/AccessibilityBar";
import SOSFloatingButton from "@/components/SOSFloatingButton";
import NavBar from "@/components/NavBar";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "National Disaster Management & Civic Care Portal | NDMA India",
  description: "Official AI-powered E-Governance Gateway. Emergency SOS, Government Schemes, Real-Time Disaster Alerts, Multilingual AI Assistant in 22 Indian Languages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300`}>

        {/* 1. TRICOLOR TOP STRIP & ACCESSIBILITY BAR */}
        <AccessibilityBar />

        {/* 2. OFFICIAL GOVERNMENT PORTAL BRANDING HEADER */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm py-4 px-4 md:px-8 z-40 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo and Seal */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-800 dark:text-amber-500 fill-current">
                  <path d="M50,5 C35,15 35,45 35,65 C35,75 42,85 50,95 C58,85 65,75 65,65 C65,45 65,15 50,5 Z" className="opacity-20" />
                  <circle cx="50" cy="40" r="10" />
                  <path d="M42,50 L58,50 L50,90 Z" />
                  <rect x="47" y="20" width="6" height="20" rx="3" />
                  <circle cx="50" cy="70" r="4" />
                </svg>
              </div>
              <div className="border-l border-slate-300 dark:border-slate-700 pl-4">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 dark:text-white leading-none">
                  राष्ट्रीय आपदा प्रबंधन प्राधिकरण
                </h1>
                <p className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  National Disaster Management Authority
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">Sovereign Civic Care & Emergency Compliance Ecosystem</p>
              </div>
            </div>

            {/* Search + Theme Toggle */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <div className="relative w-full max-w-xs hidden sm:block">
                <input
                  type="text"
                  placeholder="Search Schemes, SOS, Helplines..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 pl-8 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
              {/* Theme Toggle */}
              <ThemeToggle />
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block mr-1" />
                LIVE EMERGENCY GATEWAY
              </div>
            </div>
          </div>
        </header>

        {/* 3. MAIN NAVIGATION BAR */}
        <NavBar />

        {/* 4. EMERGENCY TICKER */}
        <div className="bg-red-600 text-white text-xs font-bold py-2 px-4 overflow-hidden shadow-sm flex items-center border-b border-red-700 shrink-0">
          <span className="bg-red-800 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase mr-3 shrink-0">⚠️ CRITICAL</span>
          <div className="flex-1 overflow-hidden">
            <span className="ticker-text">
              🌀 CYCLONE ALERT: Red Warning for East Coast. All SDRF teams on standby. • 🌊 FLOOD WATCH: Assam-Meghalaya rivers rising. NDRF deployed. • 🏠 SOS: Use Emergency button to share live location with rescue teams. • 💰 RELIEF: Flood ex-gratia ₹10,000 per family — apply at Tehsildar office with Aadhaar.
            </span>
          </div>
        </div>

        {/* 5. MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative w-full max-w-7xl mx-auto md:p-6 lg:p-8">
          {children}
        </main>

        {/* 6. FOOTER */}
        <footer className="bg-slate-900 dark:bg-black border-t-8 border-amber-600 text-slate-400 text-sm mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center p-1 font-black text-amber-500 border border-slate-700">NDMA</div>
                <h3 className="font-extrabold text-lg tracking-wider text-slate-100">GovCare AI DPI</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Official Unified Citizen Emergency Response Portal. AI-powered multilingual assistance in 22 Indian languages. Developed for rapid relief, compliance & disaster management.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">Portal Gateway</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-amber-500 transition-colors">Citizen Emergency Hub</Link></li>
                <li><Link href="/sos" className="hover:text-amber-500 transition-colors text-red-400">Emergency SOS</Link></li>
                <li><Link href="/chatbot" className="hover:text-amber-500 transition-colors">AI Chatbot (22 Languages)</Link></li>
                <li><Link href="/schemes" className="hover:text-amber-500 transition-colors">Government Schemes</Link></li>
                <li><Link href="/disaster-alerts" className="hover:text-amber-500 transition-colors">Disaster Alerts & History</Link></li>
                <li><Link href="/documents" className="hover:text-amber-500 transition-colors">Document Assistance</Link></li>
                <li><Link href="/admin" className="hover:text-amber-500 transition-colors">Command Operations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">Emergency Helplines</h4>
              <ul className="space-y-2 text-xs font-semibold">
                {[
                  ['All Emergencies:', '112'], ['NDMA Helpline:', '1078'], ['Police:', '100'],
                  ['Fire Brigade:', '101'], ['Ambulance:', '102'], ['Disaster Response:', '108'], ['State Control:', '1070'],
                ].map(([label, num]) => (
                  <li key={num} className="flex justify-between">
                    <span>{label}</span>
                    <a href={`tel:${num}`} className="text-amber-400 font-mono hover:text-amber-300">{num}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-l-2 border-amber-500 pl-2">AI Languages</h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">22 INDIAN LANGUAGES</p>
                <p className="text-xs text-emerald-400 font-bold flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1.5 animate-pulse" />
                  Gemini AI • Voice In/Out
                </p>
                <p className="text-[10px] text-slate-500">Hindi • Tamil • Telugu • Kannada • Malayalam • Bengali • Marathi • Gujarati + 14 more</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-800/60 text-center px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p>© {new Date().getFullYear()} National Disaster Management Authority. All rights reserved.</p>
              <p className="flex items-center space-x-1.5">
                <span>AI by</span>
                <span className="text-amber-400 font-extrabold">Google Gemini</span>
                <span>•</span>
                <span>Hosted by</span>
                <span className="text-slate-300 font-extrabold uppercase bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px]">NIC India</span>
              </p>
            </div>
          </div>
        </footer>

        {/* GLOBAL FLOATING SOS BUTTON */}
        <SOSFloatingButton />

      </body>
    </html>
  );
}
