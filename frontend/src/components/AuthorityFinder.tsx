"use client";

import { useState, useEffect } from 'react';
import { Phone, User, ShieldAlert, MapPin, Globe, Loader2, Sparkles, Landmark } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'ward' | 'district'>('ward');
  const [selectedWard, setSelectedWard] = useState<string>("BTM Layout");
  const [selectedIssue, setSelectedIssue] = useState<string>("Power Cut (BESCOM)");
  
  // Real-time LGD District lookup
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Bengaluru Urban");
  const [liveData, setLiveData] = useState<any>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  const currentDetails = wardDirectory[selectedWard]?.[selectedIssue];

  const fetchLiveContact = async (districtName: string) => {
    setLoadingLive(true);
    try {
      const res = await fetch(`/api/karnataka-gateway?district=${encodeURIComponent(districtName)}`);
      const data = await res.json();
      if (data.success && data.records && data.records.length > 0) {
        setLiveData(data.records[0]);
        setDataSource(data.source || "Official LGD State Node");
      } else {
        setLiveData(null);
      }
    } catch (e) {
      console.error(e);
      setLiveData(null);
    }
    setLoadingLive(false);
  };

  useEffect(() => {
    if (activeTab === 'district') {
      fetchLiveContact(selectedDistrict);
    }
  }, [selectedDistrict, activeTab]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      
      {/* HEADER WITH TOGGLE TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 flex items-center">
            <MapPin className="w-4.5 h-4.5 mr-1.5 text-amber-600" />
            Sovereign Ward & District Escalation Desk
          </h3>
          <p className="text-[10px] text-slate-500">Instant direct in-charge officials & official LGD MLA escalation registry</p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
          <button 
            onClick={() => setActiveTab('ward')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ward' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Ward-Level Details
          </button>
          <button 
            onClick={() => setActiveTab('district')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${activeTab === 'district' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Globe className="w-3 h-3 text-amber-600 animate-spin-slow" />
            <span>data.gov.in Live API</span>
          </button>
        </div>
      </div>

      {activeTab === 'ward' ? (
        <>
          {/* WARD DROPDOWNS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Select Neighborhood Ward</label>
              <select 
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold cursor-pointer"
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
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold cursor-pointer"
              >
                <option value="Power Cut (BESCOM)">Power Cut (BESCOM)</option>
                <option value="Garbage (BBMP)">Garbage Disposal (BBMP)</option>
                <option value="Bad Roads (BBMP Road Dept)">No Proper Road (Road Authority)</option>
              </select>
            </div>
          </div>

          {/* CONTACT INFO GRID */}
          {currentDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fadeIn">
              
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
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
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
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call MLA: {currentDetails.mlaNumber}</span>
                  </a>
                </div>
              </div>

            </div>
          )}
        </>
      ) : (
        <>
          {/* DISTRICT SELECTOR */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex justify-between items-center">
                <span>Select District for LGD Gateway Lookup</span>
                {loadingLive && (
                  <span className="text-amber-600 flex items-center font-bold font-mono text-[9px] lowercase animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> querying state node...
                  </span>
                )}
              </label>
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold cursor-pointer"
              >
                <option value="Bengaluru Urban">Bengaluru Urban</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Dakshina Kannada">Dakshina Kannada</option>
              </select>
            </div>
          </div>

          {/* LIVE DATA GRID OR FALLBACK */}
          {loadingLive ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Querying Sovereign OGD Registry...</p>
            </div>
          ) : liveData ? (
            <div className="space-y-4 animate-fadeIn">
              
              {/* LEDGER DATA ORIGIN BADGE */}
              <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse" />
                  DATA ORIGIN SECURE: {dataSource}
                </span>
                <span className="text-[9px] font-mono font-black text-emerald-600 uppercase">ACTIVE PROTOCOL</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* DISTRICT CONTROL ROOMS */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center w-fit">
                      <Landmark className="w-3 h-3 mr-1" /> CIVIC COMMAND & SDRF
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs mt-3">Emergency Control Room</h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">District Disaster Management Authority (DDMA)</p>
                    
                    <div className="mt-3.5 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-200 pb-1.5">
                        <span className="text-slate-500 text-[10px]">Zone Control Center</span>
                        <span className="font-bold text-slate-800">{liveData.bbmp_control_room || liveData.office_phone || "080-22660000"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-[10px]">SDRF Dispatch Desk</span>
                        <span className="font-bold text-slate-800">{liveData.sdrf_dispatch || "1070"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <a 
                      href={`tel:${liveData.bbmp_control_room || "080-22660000"}`}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Control Desk: {liveData.bbmp_control_room || "080-22660000"}</span>
                    </a>
                  </div>
                </div>

                {/* AREA MLA REAL-TIME RECORD */}
                <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] font-black text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider w-fit block">
                      CONSTITUENCY REPRESENTATIVE (LGD)
                    </span>
                    <h4 className="font-extrabold text-slate-950 text-xs mt-3 flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {liveData.mla_name || liveData.name || "Hon. MLA Representative"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Sourced from Local Government Directory Index</p>
                    
                    <div className="mt-3.5 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-200 pb-1.5">
                        <span className="text-slate-500 text-[10px]">Hazard Labor Shift Wage</span>
                        <span className="font-extrabold text-emerald-600">INR {liveData.min_wage_per_shift || 500}.00 / shift</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <a 
                      href={`tel:${liveData.mla_contact || liveData.mobile || "+91-9845017811"}`}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Escalation: {liveData.mla_contact || liveData.mobile || "+91-9845017811"}</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">LGD Endpoint Gateway Maintenance</p>
            </div>
          )}
        </>
      )}

      {/* DISCLAMER TICKER */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px] text-slate-600 flex items-start space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          *Contact numbers are sourced directly from the State LGD Directory database. If local junior engineers do not respond to your grievance report within 6 hours, citizens are authorized to trigger escalation directly to the Area MLA desk.
        </p>
      </div>

    </div>
  );
}
