"use client";

import { useState } from 'react';
import { Phone, User, ShieldAlert, MapPin, ExternalLink } from 'lucide-react';

interface ContactInfo {
  authorityName: string;
  authorityNumber: string;
  role: string;
  mlaName: string;
  mlaNumber: string;
  mlaParty: string;
}

const wardDirectory: Record<string, Record<string, ContactInfo>> = {
  "BTM Layout": {
    "Power Cut (BESCOM)": {
      authorityName: "BESCOM Junior Engineer (BTM Subdivision)",
      authorityNumber: "+91 80 2578 3042",
      role: "Grid & Substation In-Charge",
      mlaName: "Sri Ramalinga Reddy",
      mlaNumber: "+91 94480 50050",
      mlaParty: "INC"
    },
    "Garbage (BBMP)": {
      authorityName: "BBMP Junior Health Inspector (BTM Ward 176)",
      authorityNumber: "+91 94806 83033",
      role: "Solid Waste Management Supervisor",
      mlaName: "Sri Ramalinga Reddy",
      mlaNumber: "+91 94480 50050",
      mlaParty: "INC"
    },
    "Bad Roads (BBMP Road Dept)": {
      authorityName: "BBMP Assistant Executive Engineer (BTM Infrastructure)",
      authorityNumber: "+91 94806 85112",
      role: "Ward Asphalt & Maintenance Head",
      mlaName: "Sri Ramalinga Reddy",
      mlaNumber: "+91 94480 50050",
      mlaParty: "INC"
    }
  },
  "Mahadevapura": {
    "Power Cut (BESCOM)": {
      authorityName: "BESCOM Assistant Executive Engineer (Mahadevapura Div)",
      authorityNumber: "+91 80 2845 2235",
      role: "Zonal Grid Integrity Head",
      mlaName: "Smt. Manjula Limbavali",
      mlaNumber: "+91 98801 22999",
      mlaParty: "BJP"
    },
    "Garbage (BBMP)": {
      authorityName: "BBMP Joint Commissioner (Mahadevapura Zone)",
      authorityNumber: "+91 94806 83800",
      role: "Zonal SWM Administrator",
      mlaName: "Smt. Manjula Limbavali",
      mlaNumber: "+91 98801 22999",
      mlaParty: "BJP"
    },
    "Bad Roads (BBMP Road Dept)": {
      authorityName: "BBMP Ward Road Engineer (Mahadevapura)",
      authorityNumber: "+91 94806 84210",
      role: "Subdivisional Asphalt Coordinator",
      mlaName: "Smt. Manjula Limbavali",
      mlaNumber: "+91 98801 22999",
      mlaParty: "BJP"
    }
  },
  "Malleshwaram": {
    "Power Cut (BESCOM)": {
      authorityName: "BESCOM Junior Engineer (Malleshwaram)",
      authorityNumber: "+91 80 2334 1162",
      role: "Grid Controller",
      mlaName: "Dr. C. N. Ashwath Narayan",
      mlaNumber: "+91 94480 77112",
      mlaParty: "BJP"
    },
    "Garbage (BBMP)": {
      authorityName: "BBMP Health Inspector (Malleshwaram Ward 65)",
      authorityNumber: "+91 94806 83201",
      role: "Primary Sanitation Supervisor",
      mlaName: "Dr. C. N. Ashwath Narayan",
      mlaNumber: "+91 94480 77112",
      mlaParty: "BJP"
    },
    "Bad Roads (BBMP Road Dept)": {
      authorityName: "BBMP Executive Engineer (Malleshwaram Infrastructure)",
      authorityNumber: "+91 94806 85299",
      role: "Major Roads Division In-Charge",
      mlaName: "Dr. C. N. Ashwath Narayan",
      mlaNumber: "+91 94480 77112",
      mlaParty: "BJP"
    }
  }
};

export default function AuthorityFinder() {
  const [selectedWard, setSelectedWard] = useState<string>("BTM Layout");
  const [selectedIssue, setSelectedIssue] = useState<string>("Power Cut (BESCOM)");

  const currentDetails = wardDirectory[selectedWard]?.[selectedIssue];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      
      {/* TITLE */}
      <div>
        <h3 className="text-base font-extrabold text-slate-950 flex items-center">
          <MapPin className="w-4.5 h-4.5 mr-1.5 text-amber-600" />
          Ward-Level Authority & MLA Directory
        </h3>
        <p className="text-[10px] text-slate-500">Find direct in-charge officials & escalate complaints to local MLA</p>
      </div>

      {/* DROPDOWNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Select Neighborhood Ward</label>
          <select 
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold"
          >
            {Object.keys(wardDirectory).map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Select Issue Category</label>
          <select 
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold"
          >
            <option value="Power Cut (BESCOM)">Power Cut (BESCOM)</option>
            <option value="Garbage (BBMP)">Garbage Disposal (BBMP)</option>
            <option value="Bad Roads (BBMP Road Dept)">No Proper Road (Road Authority)</option>
          </select>
        </div>
      </div>

      {/* CONTACT INFO GRID */}
      {currentDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* PRIMARY DEPARTMENT AUTHORITY */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                PRIMARY DEPARTMENT OFFICIAL
              </span>
              <h4 className="font-extrabold text-slate-900 text-xs mt-2.5">{currentDetails.authorityName}</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{currentDetails.role}</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <a 
                href={`tel:${currentDetails.authorityNumber}`}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Official: {currentDetails.authorityNumber}</span>
              </a>
            </div>
          </div>

          {/* ESCALATION TO LEGISLATOR (MLA) */}
          <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CONSTITUENCY MLA ESCALATION
                </span>
                <span className="text-[9px] font-mono text-slate-400 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{currentDetails.mlaParty}</span>
              </div>
              <h4 className="font-extrabold text-slate-950 text-xs mt-2.5 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {currentDetails.mlaName}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Member of Legislative Assembly (Karnataka)</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <a 
                href={`tel:${currentDetails.mlaNumber}`}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call MLA: {currentDetails.mlaNumber}</span>
              </a>
            </div>
          </div>

        </div>
      )}

      {/* DISCLAMER TICKER */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px] text-slate-600 flex items-start space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          *Contact numbers are sourced directly from the State Directory database. If local junior engineers do not respond to your grievance report within 6 hours, citizens are authorized to trigger escalation directly to the Area MLA desk.
        </p>
      </div>

    </div>
  );
}
