"use client";

import { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface Scheme {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: string;
  link: string;
  link_text: string;
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const res = await fetch('http://localhost:8000/api/schemes');
        const data = await res.json();
        if (data.success && data.schemes) {
          setSchemes(data.schemes);
        }
      } catch (e) {
        console.error("Failed to fetch schemes", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchemes();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Ex-Gratia & Relief Schemes</h2>
              <p className="text-sm font-medium text-amber-400">Centralized Government Benefits Portal</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            This repository provides real-time access to active disaster relief compensation programs, agricultural subsidies, and medical defrays. Connected live to the state payout gateway.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="col-span-1 text-center py-12 text-slate-500 flex flex-col items-center">
            <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin mb-4"></span>
            <p className="text-sm font-bold animate-pulse">Syncing with National Database...</p>
          </div>
        ) : (
          schemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-200 group-hover:bg-amber-500 transition-colors"></div>
              <div className="pl-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg mb-2">
                        {scheme.category}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                        {scheme.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {scheme.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg inline-flex mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">Eligibility: {scheme.eligibility}</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center md:items-start md:mt-2">
                    <a 
                      href={scheme.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow"
                    >
                      <span>{scheme.link_text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
