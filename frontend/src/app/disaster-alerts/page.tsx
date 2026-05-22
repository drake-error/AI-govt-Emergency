"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, CloudLightning, Waves, Mountain, Wind, Clock, MapPin, RefreshCw, History, TrendingUp } from 'lucide-react';

type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type DisasterType = 'all' | 'CYCLONE' | 'FLOOD' | 'EARTHQUAKE' | 'RAINSTORM';

interface LiveAlert {
  id: string;
  type: string;
  title: string;
  severity: AlertSeverity;
  states: string[];
  message: string;
  time: string;
  source: string;
}

interface HistoricalEvent {
  id: string;
  name: string;
  year: number;
  state: string;
  severity: AlertSeverity;
  casualties: number;
  displaced: number;
  description: string;
}

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'CRITICAL', color: 'bg-red-600', text: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50 dark:bg-red-950/20 dark:border-red-900', dot: 'bg-red-500' },
  HIGH:     { label: 'HIGH', color: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900', dot: 'bg-orange-500' },
  MEDIUM:   { label: 'MEDIUM', color: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900', dot: 'bg-amber-500' },
  LOW:      { label: 'LOW', color: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900', dot: 'bg-emerald-500' },
};

const TYPE_CONFIG = {
  CYCLONE:    { Icon: Wind, label: 'Cyclone', color: 'text-purple-600', iconBg: 'bg-purple-100 dark:bg-purple-950/30' },
  FLOOD:      { Icon: Waves, label: 'Flood', color: 'text-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-950/30' },
  EARTHQUAKE: { Icon: Mountain, label: 'Earthquake', color: 'text-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-950/30' },
  RAINSTORM:  { Icon: CloudLightning, label: 'Rainstorm', color: 'text-slate-600', iconBg: 'bg-slate-100 dark:bg-slate-800' },
};

export default function DisasterAlertsPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'historical'>('live');
  const [disasterFilter, setDisasterFilter] = useState<DisasterType>('all');
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [historical, setHistorical] = useState<Record<string, HistoricalEvent[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [stats, setStats] = useState({ cyclones: 0, floods: 0, earthquakes: 0, rainstorms: 0 });

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/disaster-alerts');
      const data = await res.json();
      setLiveAlerts(data.liveAlerts || []);
      setHistorical(data.historical || {});
      setStats(data.totalEvents || {});
      setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString());
    } catch {
      // Handle gracefully
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const filteredLive = disasterFilter === 'all' ? liveAlerts : liveAlerts.filter(a => a.type === disasterFilter);

  const getHistoricalData = (): HistoricalEvent[] => {
    if (disasterFilter === 'all') {
      return [
        ...(historical.cyclones || []),
        ...(historical.floods || []),
        ...(historical.earthquakes || []),
        ...(historical.rainstorms || []),
      ].sort((a, b) => b.year - a.year);
    }
    const map: Record<string, string> = { CYCLONE: 'cyclones', FLOOD: 'floods', EARTHQUAKE: 'earthquakes', RAINSTORM: 'rainstorms' };
    return historical[map[disasterFilter]] || [];
  };

  const getTimeAgo = (isoTime: string) => {
    const diff = Date.now() - new Date(isoTime).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 border-b-4 border-amber-500 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              🛰️ NDMA Real-Time Intelligence
            </span>
            <h1 className="text-2xl font-black mt-3">Disaster Alert Command</h1>
            <p className="text-slate-400 text-sm mt-1">Live alerts + India historical disaster database (2001–2024)</p>
          </div>
          <button onClick={fetchAlerts} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Updating...' : `Updated ${lastUpdated}`}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            { key: 'cyclones', label: 'Cyclones', icon: '🌀', count: stats.cyclones, color: 'purple' },
            { key: 'floods', label: 'Floods', icon: '🌊', count: stats.floods, color: 'blue' },
            { key: 'earthquakes', label: 'Earthquakes', icon: '⛰️', count: stats.earthquakes, color: 'amber' },
            { key: 'rainstorms', label: 'Rainstorms', icon: '⛈️', count: stats.rainstorms, color: 'slate' },
          ].map(s => (
            <div key={s.key} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl">{s.icon}</div>
              <div className="text-xl font-black mt-1">{s.count}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tab Toggle */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            🔴 Live Alerts ({liveAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'historical' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            <History className="w-4 h-4" /> Historical India Data
          </button>
        </div>

        {/* Disaster Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'CYCLONE', 'FLOOD', 'EARTHQUAKE', 'RAINSTORM'] as const).map(type => (
            <button
              key={type}
              onClick={() => setDisasterFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                disasterFilter === type
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {type === 'all' ? '🌏 All Types' : 
               type === 'CYCLONE' ? '🌀 Cyclone' :
               type === 'FLOOD' ? '🌊 Flood' :
               type === 'EARTHQUAKE' ? '⛰️ Earthquake' : '⛈️ Rainstorm'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'live' ? (
        <div className="space-y-4">
          {filteredLive.length === 0 && !isLoading && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-bold text-emerald-700 dark:text-emerald-400">No active alerts for selected type</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">All clear. Stay prepared.</p>
            </div>
          )}
          {filteredLive.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity];
            const typeConf = TYPE_CONFIG[alert.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.RAINSTORM;
            return (
              <div key={alert.id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${sev.border} dark:border-slate-700 shadow-sm overflow-hidden`}>
                <div className={`${sev.color} h-1`} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${typeConf.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                      <typeConf.Icon className={`w-6 h-6 ${typeConf.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`${sev.color} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                          {sev.label}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full">
                          {typeConf.label}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" /> {getTimeAgo(alert.time)}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">{alert.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {alert.states.map(s => (
                          <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        <span className="text-[10px] text-slate-400 ml-auto">Source: {alert.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Historical Tab */
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">India Historical Disaster Database (2001–2024)</p>
              <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">Real data from NDMA, IMD, and state disaster management reports. Used for AI smart query navigation.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getHistoricalData().map(event => {
              const sev = SEVERITY_CONFIG[event.severity];
              return (
                <div key={event.id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${sev.border} dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
                  <div className={`${sev.color} h-1.5`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`${sev.color} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase`}>{event.severity}</span>
                      <span className="text-lg font-black text-slate-300 dark:text-slate-600">{event.year}</span>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">{event.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" /> {event.state}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{event.description}</p>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-lg font-black text-red-600">{event.casualties > 0 ? event.casualties.toLocaleString() : '—'}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Casualties</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-amber-600">{event.displaced > 0 ? (event.displaced >= 1000000 ? `${(event.displaced / 1000000).toFixed(1)}M` : `${(event.displaced / 1000).toFixed(0)}K`) : '—'}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Displaced</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
