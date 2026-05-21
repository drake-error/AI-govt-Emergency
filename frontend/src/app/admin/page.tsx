"use client";

import dynamic from 'next/dynamic';
import { Users, AlertTriangle, CheckCircle, Activity, Briefcase, Landmark, ShieldCheck, DownloadCloud } from 'lucide-react';
import Link from 'next/link';

const AdminMap = dynamic(() => import('@/components/AdminMap'), { ssr: false });

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      
      {/* 1. SECURE ADMINISTRATIVE TOP CARD */}
      <div className="bg-slate-900 border-l-4 border-amber-600 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-[10px] text-amber-400 font-black tracking-widest uppercase">
            <Landmark className="w-3.5 h-3.5" /> 
            <span>NATIONAL INFORMATICS SECURED CHANNEL</span>
          </div>
          <h2 className="text-2xl font-black mt-2 text-slate-100">District Emergency Command Desk</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            SDRF Operations, Geofenced Civilian Triage, & Compliance Payroll ledgers. Logged securely with active digital certificates.
          </p>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto flex-wrap gap-y-3">
          <Link 
            href="/admin/workforce" 
            className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center transition-all shadow-md shadow-amber-500/10"
          >
            <Briefcase className="w-4 h-4 mr-2" /> Payroll
          </Link>
          <Link 
            href="/schemes" 
            className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center transition-all shadow-md shadow-emerald-500/10"
          >
            <Landmark className="w-4 h-4 mr-2" /> Relief Schemes
          </Link>
          <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center transition-all">
             <DownloadCloud className="w-4 h-4 mr-2" /> export
          </button>
        </div>
      </div>

      {/* 2. OFFICIAL KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">ACTIVE FIELD FORCE</span>
             <h3 className="text-3xl font-black text-slate-900 mt-1">1,248</h3>
             <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ 100% GEOFENCE CHECKED</p>
           </div>
           <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600 border border-blue-100">
             <Users className="w-6 h-6" />
           </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">CIVILIAN DISTRESS REQ</span>
             <h3 className="text-3xl font-black text-slate-900 mt-1">42</h3>
             <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ 12 CRITICAL TRIAGE</p>
           </div>
           <div className="bg-red-50 p-3.5 rounded-xl text-red-600 border border-red-100">
             <AlertTriangle className="w-6 h-6" />
           </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">ESTABLISHED RELIEF CAMPS</span>
             <h3 className="text-3xl font-black text-slate-900 mt-1">22</h3>
             <p className="text-[10px] text-amber-600 font-bold mt-1">✓ POWER & WATER VERIFIED</p>
           </div>
           <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600 border border-amber-100">
             <Activity className="w-6 h-6" />
           </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">LEDGER SECURITY STATUS</span>
             <h3 className="text-sm font-black text-emerald-600 mt-2 flex items-center">
               <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" />
               TRIPLEBLIND LOCK
             </h3>
             <p className="text-[10px] text-slate-400 font-bold mt-1">✓ IMMUTABLE BACKUPS</p>
           </div>
           <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600 border border-emerald-100">
             <CheckCircle className="w-6 h-6" />
           </div>
         </div>

      </div>

      {/* 3. DENSE GIS MAP AND LIVE DISTRESS FEED LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Live GIS Map Frame */}
         <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-[540px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
               <div>
                 <h3 className="text-base font-extrabold text-slate-950 flex items-center">
                   <Activity className="w-4.5 h-4.5 mr-1.5 text-blue-600" />
                   SDRF Force GIS Geofence Monitor
                 </h3>
                 <p className="text-[10px] text-slate-500">Live operational spatial boundary monitoring</p>
               </div>
            </div>
            
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-100 relative z-0">
               <AdminMap />
            </div>
         </div>

         {/* Right: Incoming distress signals log */}
         <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[540px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
               <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                    <AlertTriangle className="w-4.5 h-4.5 mr-1.5 text-red-600" />
                    Incoming Triage Requests
                  </h3>
                  <p className="text-[10px] text-slate-500">Live distress signals captured via speech/SOS</p>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
               {[
                 { id: "SOS-839", tag: "CRITICAL", name: "Citizen_9401", coords: "12.9782, 77.5912", msg: "Cyclone flooding near residence, child with high fever." },
                 { id: "SOS-721", tag: "SDRF ASSIGNED", name: "Citizen_1288", coords: "12.9691, 77.6015", msg: "Road blockage due to heavy tree falling, power lines down." },
                 { id: "SOS-412", tag: "PENDING", name: "Citizen_3829", coords: "12.9599, 77.5855", msg: "SOS signal received via 3-second hold. Location tracked." },
                 { id: "SOS-299", tag: "RESOLVED", name: "Citizen_8829", coords: "12.9812, 77.5999", msg: "Requested food rations successfully dispatched and confirmed." }
               ].map((signal, i) => (
                 <div key={i} className={`bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 shadow-sm ${
                   signal.tag === 'CRITICAL' ? 'border-l-red-600' :
                   signal.tag === 'SDRF ASSIGNED' ? 'border-l-blue-600' :
                   signal.tag === 'RESOLVED' ? 'border-l-emerald-600' : 'border-l-amber-500'
                 }`}>
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-extrabold text-slate-800 text-xs">{signal.name} ({signal.id})</span>
                     <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                       signal.tag === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                       signal.tag === 'SDRF ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                       signal.tag === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                     }`}>{signal.tag}</span>
                   </div>
                   <p className="text-xs text-slate-600 mb-2 leading-relaxed">{signal.msg}</p>
                   <p className="text-[10px] text-slate-400 font-mono flex items-center">
                     <span className="inline-block w-1.5 h-1.5 bg-slate-300 rounded-full mr-1.5"></span>
                     {signal.coords}
                   </p>
                 </div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
}
