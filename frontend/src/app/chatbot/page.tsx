"use client";

import { useState } from 'react';
import MultilingualChat from '@/components/MultilingualChat';
import { Bot, Mic, Globe, Sparkles, Phone, AlertTriangle } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 text-white rounded-2xl p-6 border-b-4 border-violet-500 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-violet-400 font-black tracking-widest uppercase bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-full">
              AI Powered by Google Gemini • NDMA Official
            </span>
            <h1 className="text-2xl font-black mt-2">Multilingual AI Emergency Assistant</h1>
            <p className="text-violet-300 text-sm mt-1">Ask in any Indian language — AI replies and SPEAKS BACK in the same language</p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { icon: Globe, label: '22 Indian Languages' },
            { icon: Mic, label: 'Voice Input' },
            { icon: Sparkles, label: 'AI Voice Output' },
            { icon: AlertTriangle, label: 'Emergency Aware' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Icon className="w-3.5 h-3.5 text-violet-300" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat - takes up 2 columns */}
        <div className="lg:col-span-2">
          <MultilingualChat compact={false} />
        </div>

        {/* Tips Panel */}
        <div className="space-y-4">
          {/* How to Use */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" /> How to Use
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                <p>Select your language using the globe 🌐 button in the chat header</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                <p>Press the 🎤 microphone and SPEAK in your language — or type your question</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                <p>AI replies in your language and reads the answer aloud using voice</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">4</span>
                <p>Toggle 🔊 speaker icon to turn voice output ON/OFF</p>
              </div>
            </div>
          </div>

          {/* Sample Queries */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3">Sample Questions (All Languages)</h3>
            <div className="space-y-2">
              {[
                { lang: 'Tamil', q: 'அருகிலுள்ள அவசர தங்குமிடம் எங்கே?' },
                { lang: 'Hindi', q: 'बाढ़ राहत के लिए कहाँ जाएं?' },
                { lang: 'Telugu', q: 'నా ఇల్లు తుఫానులో దెబ్బతింది' },
                { lang: 'Kannada', q: 'ನೆರళ ಹಾನಿ ಪರಿಹಾರ ಯೋಜನೆ ಏನು?' },
                { lang: 'Bengali', q: 'কাছের আশ্রয় কেন্দ্র কোথায়?' },
                { lang: 'Malayalam', q: 'ദുരന്ത ആശ്വാസ പദ്ധതി ഏത്?' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5">
                  <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase">{item.lang}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{item.q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Numbers */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-5">
            <h3 className="font-extrabold text-red-800 dark:text-red-400 text-sm mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Emergency Hotlines
            </h3>
            <div className="space-y-2">
              {[
                { num: '112', label: 'All Emergencies' },
                { num: '100', label: 'Police' },
                { num: '101', label: 'Fire Brigade' },
                { num: '102', label: 'Ambulance' },
                { num: '108', label: 'Disaster Response' },
                { num: '1078', label: 'NDMA Helpline' },
                { num: '1070', label: 'State Control Room' },
              ].map(h => (
                <a key={h.num} href={`tel:${h.num}`} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{h.label}</span>
                  <span className="font-black text-red-700 dark:text-red-400 font-mono group-hover:underline">{h.num}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
