"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, CheckCircle, Star, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Scheme {
  id: number;
  name: string;
  category: string;
  benefit: string;
  eligibility: string;
  link: string;
  state: string;
}

const CATEGORIES = ['All', 'Disaster Relief', 'Agriculture', 'Housing', 'Health', 'Employment', 'Insurance', 'Social Security', 'Education', 'Entrepreneurship'];
const DISASTER_FILTERS = ['All Disasters', 'Flood', 'Cyclone', 'Earthquake', 'Drought'];

const CAT_COLORS: Record<string, string> = {
  'Disaster Relief': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  'Agriculture': 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  'Housing': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Health': 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
  'Employment': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  'Insurance': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  'Social Security': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  'Education': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
  'Entrepreneurship': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  'Energy': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
  'Financial Inclusion': 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400',
  'Food Security': 'bg-lime-100 text-lime-700 dark:bg-lime-950/30 dark:text-lime-400',
  'Pension': 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  'Women & Child': 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
  'Skill Development': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400',
};

interface AIRec {
  scheme_name: string;
  eligibility_score: number;
  reason: string;
  next_step: string;
}

export default function SchemesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [disasterFilter, setDisasterFilter] = useState('All Disasters');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [aiRecs, setAiRecs] = useState<AIRec[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);
  const [eligibilityForm, setEligibilityForm] = useState({ income: '', familySize: '4', state: 'Tamil Nadu' });
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const STATES = ['All States', 'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Himachal Pradesh', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

  const fetchSchemes = async (useAI = false) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      if (useAI && eligibilityForm.income) {
        const res = await fetch('/api/schemes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            income: parseInt(eligibilityForm.income) || 0,
            familySize: parseInt(eligibilityForm.familySize) || 4,
            state: eligibilityForm.state,
            disaster: disasterFilter !== 'All Disasters' ? disasterFilter : '',
          }),
        });
        const data = await res.json();
        setAiRecs(data.recommendations || []);
        setSchemes(data.all_schemes || []);
      } else {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        if (disasterFilter !== 'All Disasters') params.set('disaster', disasterFilter);
        const res = await fetch(`/api/schemes?${params}`);
        const data = await res.json();
        setSchemes(data.schemes || []);
        setAiRecs([]);
      }
    } catch { /* graceful fail */ }
    setIsLoading(false);
  };

  const initialLoad = async () => {
    const res = await fetch('/api/schemes');
    const data = await res.json();
    setSchemes(data.schemes || []);
    setHasSearched(true);
  };

  // Auto-load on first render (useEffect ensures this only runs client-side, never during SSG)
  useEffect(() => { initialLoad(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 border-b-4 border-emerald-500 shadow-xl">
        <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          25+ Government Schemes • AI Eligibility Check
        </span>
        <h1 className="text-2xl font-black mt-3">Government Scheme Finder</h1>
        <p className="text-slate-400 text-sm mt-1">Disaster relief, agriculture, housing, health, education — find schemes you qualify for</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchSchemes()}
              placeholder="Search: flood relief, housing, PM-KISAN, health insurance..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button onClick={() => fetchSchemes()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Disaster Filter */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider self-center">Disaster Type:</span>
          {DISASTER_FILTERS.map(d => (
            <button
              key={d}
              onClick={() => setDisasterFilter(d)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                disasterFilter === d
                  ? 'bg-red-600 text-white border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {d === 'Flood' ? '🌊' : d === 'Cyclone' ? '🌀' : d === 'Earthquake' ? '⛰️' : d === 'Drought' ? '☀️' : '🌏'} {d}
            </button>
          ))}
        </div>

        {/* AI Eligibility Section */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
          <button
            onClick={() => setShowEligibilityForm(!showEligibilityForm)}
            className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            🤖 AI Eligibility Checker — Enter your details for personalized scheme recommendations
            {showEligibilityForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showEligibilityForm && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="number"
                placeholder="Annual Income (₹)"
                value={eligibilityForm.income}
                onChange={e => setEligibilityForm(p => ({ ...p, income: e.target.value }))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Family Size"
                value={eligibilityForm.familySize}
                onChange={e => setEligibilityForm(p => ({ ...p, familySize: e.target.value }))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
              />
              <select
                value={eligibilityForm.state}
                onChange={e => setEligibilityForm(p => ({ ...p, state: e.target.value }))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
              >
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button
                onClick={() => fetchSchemes(true)}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {isLoading ? 'Analyzing...' : 'Get AI Recommendations'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecs.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-black text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> AI Recommendations — Top Schemes For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecs.map((rec, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-amber-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Top Pick #{i + 1}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                    {rec.eligibility_score}% Match
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">{rec.scheme_name}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">{rec.reason}</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {rec.next_step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schemes Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-3 font-bold">Finding schemes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes.map(scheme => {
            const catColor = CAT_COLORS[scheme.category] || 'bg-slate-100 text-slate-700';
            const isExpanded = expandedCard === scheme.id;
            return (
              <div key={scheme.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catColor}`}>
                      {scheme.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{scheme.state}</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2 leading-tight">{scheme.name}</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1 flex items-start gap-1">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {scheme.benefit}
                  </p>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Eligibility</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{scheme.eligibility}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : scheme.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold transition-colors"
                    >
                      <Filter className="w-3 h-3" />
                      {isExpanded ? 'Less' : 'Eligibility'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasSearched && schemes.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 font-bold">No schemes found for your search. Try different filters.</p>
        </div>
      )}
    </div>
  );
}
