"use client";

import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, ArrowRight, IndianRupee, Search, Filter } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Scheme {
  id: string;
  title: string;
  category: string;
  ministry: string;
  description: string;
  eligibility: string;
  amount: string;
  link: string;
  link_text: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Disaster Relief': 'bg-red-100 text-red-700 border-red-200',
  'Health': 'bg-blue-100 text-blue-700 border-blue-200',
  'Agriculture': 'bg-green-100 text-green-700 border-green-200',
  'Housing': 'bg-amber-100 text-amber-700 border-amber-200',
  'Employment': 'bg-purple-100 text-purple-700 border-purple-200',
  'Social Security': 'bg-slate-100 text-slate-700 border-slate-200',
  'Women & Children': 'bg-pink-100 text-pink-700 border-pink-200',
  'Education': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Energy': 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filtered, setFiltered] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const res = await fetch(`${API_URL}/api/schemes`);
        const data = await res.json();
        if (data.success && data.schemes) {
          setSchemes(data.schemes);
          setFiltered(data.schemes);
        }
      } catch (e) {
        console.error('Failed to fetch schemes', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchemes();
  }, []);

  useEffect(() => {
    let result = schemes;
    if (activeCategory !== 'All') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeCategory, schemes]);

  const categories = ['All', ...Array.from(new Set(schemes.map(s => s.category)))];

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">

      {/* HERO HEADER */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Ex-Gratia & Relief Schemes</h2>
              <p className="text-sm font-medium text-amber-400">Government of India — Centralized Benefits Portal</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Real-time access to active disaster relief compensation programs, health cover, agricultural subsidies, housing grants, and social security schemes. Verified data from official government ministries.
          </p>
          <div className="mt-4 flex items-center space-x-4 text-xs font-bold text-emerald-400">
            <span className="flex items-center"><span className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>{schemes.length} Active Schemes</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{categories.length - 1} Categories</span>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schemes, ministries..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeCategory === cat
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SCHEMES LIST */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center">
            <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin mb-4"></span>
            <p className="text-sm font-bold animate-pulse">Syncing with National Benefits Database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Filter className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">No schemes match your search</p>
          </div>
        ) : (
          filtered.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-amber-500 transition-colors rounded-l-2xl"></div>
              <div className="pl-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">

                    {/* Category + Ministry */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex px-2.5 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${CATEGORY_COLORS[scheme.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {scheme.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{scheme.ministry}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{scheme.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed">{scheme.description}</p>

                    {/* Eligibility */}
                    <div className="flex items-start space-x-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-emerald-800">Eligibility: {scheme.eligibility}</span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center space-x-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                      <IndianRupee className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-amber-800">{scheme.amount}</span>
                    </div>

                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex items-center lg:items-start lg:mt-8">
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow whitespace-nowrap"
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
