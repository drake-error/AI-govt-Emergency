"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass, ArrowRight, Loader2, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';

interface NavResult {
  page: string;
  confidence: number;
  reason: string;
  suggestedAction: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

const QUICK_SEARCHES = [
  { text: 'Flood affected family relief', icon: '🌊', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' },
  { text: 'Cyclone warning in my area', icon: '🌀', color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800' },
  { text: 'Earthquake near me', icon: '⛰️', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' },
  { text: 'Apply for Aadhaar card', icon: '🪪', color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600' },
  { text: 'I need emergency help now', icon: '🆘', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' },
  { text: 'PM Kisan scheme eligibility', icon: '🌾', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' },
  { text: 'Heavy rain alert Chennai', icon: '⛈️', color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600' },
  { text: 'BPL card application help', icon: '📋', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' },
];

const PAGE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  '/sos': { label: 'Emergency SOS', icon: '🆘', color: 'text-red-700 bg-red-100 dark:bg-red-950/30' },
  '/schemes': { label: 'Government Schemes', icon: '💰', color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/30' },
  '/disaster-alerts': { label: 'Disaster Alerts', icon: '🌀', color: 'text-orange-700 bg-orange-100 dark:bg-orange-950/30' },
  '/documents': { label: 'Document Help', icon: '📋', color: 'text-blue-700 bg-blue-100 dark:bg-blue-950/30' },
  '/chatbot': { label: 'AI Assistant', icon: '🤖', color: 'text-violet-700 bg-violet-100 dark:bg-violet-950/30' },
  '/': { label: 'Home Dashboard', icon: '🏠', color: 'text-slate-700 bg-slate-100 dark:bg-slate-800' },
};

export default function SmartNavigatorPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<NavResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigate = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/smart-navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResult(data);

      // Auto-redirect for HIGH urgency
      if (data.urgency === 'HIGH') {
        setTimeout(() => router.push(data.page), 2000);
      }
    } catch {
      setResult({ page: '/chatbot', confidence: 0.5, reason: 'Could not analyze query', suggestedAction: 'Try the AI chatbot', urgency: 'LOW' });
    }
    setIsLoading(false);
  };

  const urgencyColors = {
    HIGH: 'bg-red-600 text-white',
    MEDIUM: 'bg-amber-500 text-white',
    LOW: 'bg-emerald-600 text-white',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-2xl p-6 border-b-4 border-blue-500 shadow-xl text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black">Smart Query Navigator</h1>
        <p className="text-slate-400 text-sm mt-2">Type anything in plain language — AI understands your need and routes you to the right service</p>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <label className="block text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Describe what you need
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate(query)}
              placeholder="e.g. 'flood damaged my house', 'cyclone warning tomorrow', 'need emergency shelter'..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => navigate(query)}
            disabled={isLoading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
            {isLoading ? 'Analyzing...' : 'Navigate'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${result.urgency === 'HIGH' ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
          <div className={`h-1.5 ${result.urgency === 'HIGH' ? 'bg-red-600' : result.urgency === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
          <div className="bg-white dark:bg-slate-900 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{PAGE_LABELS[result.page]?.icon || '🔍'}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase ${urgencyColors[result.urgency]}`}>
                    {result.urgency} URGENCY
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${PAGE_LABELS[result.page]?.color || 'bg-slate-100 text-slate-600'}`}>
                    → {PAGE_LABELS[result.page]?.label || result.page}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">{Math.round(result.confidence * 100)}% confidence</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{result.reason}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                  ✅ {result.suggestedAction}
                </p>
                <div className="flex gap-3">
                  <Link href={result.page}
                    className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${result.urgency === 'HIGH' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-900'}`}
                  >
                    Go to {PAGE_LABELS[result.page]?.label || 'Page'} <ArrowRight className="w-4 h-4" />
                  </Link>
                  {result.urgency === 'HIGH' && (
                    <div className="flex items-center gap-2 text-xs text-red-600 font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      Auto-redirecting in 2s...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Examples */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-4">Quick Examples — Click to Try</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_SEARCHES.map((q, i) => (
            <button
              key={i}
              onClick={() => { setQuery(q.text); navigate(q.text); }}
              className={`flex items-start gap-2 p-3 rounded-xl border text-left text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 ${q.color}`}
            >
              <span className="text-base">{q.icon}</span>
              <span className="leading-tight">{q.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
