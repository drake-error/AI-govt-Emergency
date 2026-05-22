"use client";

import { useState } from 'react';
import { FileText, Globe, Send, Loader2, ChevronRight, CheckCircle, BookOpen, AlertCircle, Building } from 'lucide-react';
import MultilingualChat from '@/components/MultilingualChat';

const LANGUAGES = [
  { code: 'en-IN', name: 'English' }, { code: 'hi-IN', name: 'हिंदी' }, { code: 'ta-IN', name: 'தமிழ்' },
  { code: 'te-IN', name: 'తెలుగు' }, { code: 'kn-IN', name: 'ಕನ್ನಡ' }, { code: 'ml-IN', name: 'മലയാളം' },
  { code: 'bn-IN', name: 'বাংলা' }, { code: 'mr-IN', name: 'मराठी' }, { code: 'gu-IN', name: 'ગુજરાતી' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ' },
];

const DOCUMENTS = [
  {
    id: 'aadhaar', name: 'Aadhaar Card', icon: '🪪', description: 'India\'s biometric ID for all citizens',
    steps: ['Visit nearest Aadhaar Enrollment Center', 'Carry proof of identity and address', 'Biometric scan (fingerprints + iris)', 'Receive acknowledgment slip', 'Card delivered in 3-4 months'],
    requiredDocs: ['Birth certificate OR any identity proof', 'Proof of address (utility bill, bank statement)', 'Passport size photograph'],
    office: 'Nearest Aadhaar Enrollment Center / Post Office',
    website: 'https://uidai.gov.in',
    timeline: '90 days',
  },
  {
    id: 'bpl', name: 'BPL / Ration Card', icon: '📋', description: 'Below Poverty Line card for subsidized food and welfare',
    steps: ['Get application form from Tehsildar/Block office', 'Fill all family member details', 'Attach income certificate (< ₹1.5 lakh/year)', 'Submit with Aadhaar copies of all members', 'Field verification by officer', 'Receive card in 30 days'],
    requiredDocs: ['Aadhaar card of all family members', 'Income certificate', 'Residence proof', 'Caste certificate (if applicable)'],
    office: 'Tehsildar Office / Block Development Office',
    website: 'https://nfsa.gov.in',
    timeline: '30-45 days',
  },
  {
    id: 'disaster-relief', name: 'Disaster Relief Form', icon: '🏚️', description: 'Apply for government compensation after cyclone, flood, earthquake',
    steps: ['Obtain Form-A from Revenue/Block office', 'Document your losses with photographs', 'Get damage certificate from Village/Ward Officer', 'Submit to District Collector office', 'Joint survey by Revenue + Agriculture officials', 'Ex-gratia credited to bank account'],
    requiredDocs: ['Aadhaar card', 'Bank account details (passbook first page)', 'Loss photographs', 'Village officer damage report', 'Land records (if agricultural loss)'],
    office: 'District Collector Office / Tehsildar Office',
    website: 'https://ndma.gov.in',
    timeline: '15-30 days after survey',
  },
  {
    id: 'income-cert', name: 'Income Certificate', icon: '📄', description: 'Required for most welfare scheme applications',
    steps: ['Apply online or visit nearest Mandal/Taluk office', 'Fill application with family income details', 'Attach Aadhaar + bank statements', 'Revenue inspector verifies income', 'Certificate issued within 7-15 days'],
    requiredDocs: ['Aadhaar card', 'Bank passbook (6 months)', 'Employer salary slip (if salaried)', 'Affidavit (if self-employed)', 'Ration card (optional)'],
    office: 'Mandal / Taluk Revenue Office',
    website: 'https://meeseva.gov.in',
    timeline: '7-15 days',
  },
  {
    id: 'caste-cert', name: 'Caste / Community Certificate', icon: '📃', description: 'Required for SC/ST/OBC reservations and schemes',
    steps: ['Apply at Mandal/Tehsildar office or online state portal', 'Attach family caste documents and Aadhaar', 'Revenue inspector conducts inquiry', 'Certificate issued with unique number'],
    requiredDocs: ['Aadhaar card', 'Father\'s caste certificate or school leaving certificate', 'Proof of address', 'Affidavit on ₹100 stamp paper'],
    office: 'Mandal / Tehsildar Office',
    website: 'https://socialjustice.gov.in',
    timeline: '15-30 days',
  },
  {
    id: 'land-record', name: 'Land Records (Patta/Khata)', icon: '🗺️', description: 'Ownership proof required for agricultural schemes',
    steps: ['Visit Sub-Registrar or Revenue office', 'Submit survey number and your Aadhaar', 'Pay nominal fee (₹50-200)', 'Receive certified copy of land record'],
    requiredDocs: ['Aadhaar card', 'Survey number of land', 'Previous ownership documents', 'Legal heir documents (if inherited)'],
    office: 'Sub-Registrar Office / Tahsildar Office',
    website: 'https://dilrmp.gov.in',
    timeline: '1-7 days (varies by state)',
  },
];

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<typeof DOCUMENTS[0] | null>(null);
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'guides' | 'ai'>('guides');

  const askAI = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          docType: selectedDoc?.name || 'general',
          lang: language,
        }),
      });
      const data = await res.json();
      setAnswer(data.response || 'Unable to process request.');
    } catch {
      setAnswer('Connection error. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 border-b-4 border-blue-500 shadow-xl">
        <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
          AI Document Assistance • 10 Indian Languages
        </span>
        <h1 className="text-2xl font-black mt-3">Document Help Center</h1>
        <p className="text-slate-400 text-sm mt-1">Step-by-step guides for Aadhaar, BPL card, disaster relief forms & more — in your language</p>
      </div>

      {/* Tab Toggle */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex w-fit">
        <button onClick={() => setActiveSection('guides')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'guides' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>
          📚 Document Guides
        </button>
        <button onClick={() => setActiveSection('ai')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'ai' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>
          🤖 AI Document Assistant
        </button>
      </div>

      {activeSection === 'guides' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="space-y-3">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Select Document</h2>
            {DOCUMENTS.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedDoc?.id === doc.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                } shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{doc.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ml-auto shrink-0 transition-colors ${selectedDoc?.id === doc.id ? 'text-blue-500' : 'text-slate-300'}`} />
                </div>
              </button>
            ))}
          </div>

          {/* Document Detail */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedDoc.icon}</span>
                    <div>
                      <h2 className="font-black text-xl">{selectedDoc.name}</h2>
                      <p className="text-blue-200 text-sm mt-0.5">{selectedDoc.description}</p>
                    </div>
                    <span className="ml-auto bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⏱ {selectedDoc.timeline}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Steps */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-blue-600" /> Step-by-Step Process
                    </h3>
                    <div className="space-y-2">
                      {selectedDoc.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Docs */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Documents Required
                    </h3>
                    <div className="space-y-1.5">
                      {selectedDoc.requiredDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Where to Apply */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-slate-600" />
                        <p className="text-[11px] font-black text-slate-500 uppercase">Where to Apply</p>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedDoc.office}</p>
                    </div>
                    <a href={selectedDoc.website} target="_blank" rel="noopener noreferrer"
                      className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col gap-1 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors group">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <p className="text-[11px] font-black text-blue-600 uppercase">Apply Online</p>
                      </div>
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:underline truncate">{selectedDoc.website}</p>
                    </a>
                  </div>

                  {/* Ask AI about this doc */}
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                      🤖 Ask AI About {selectedDoc.name}
                    </h4>
                    <div className="flex gap-2 mb-2">
                      <select value={language} onChange={e => setLanguage(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs px-2 py-2 font-bold dark:text-white">
                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                      <input
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && askAI()}
                        placeholder={`Ask anything about ${selectedDoc.name}...`}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs px-3 py-2 dark:text-white"
                      />
                      <button onClick={askAI} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-all disabled:opacity-50">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    {answer && (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mt-2">
                        {answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-96 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-bold text-lg">Select a document</p>
                  <p className="text-sm mt-1">Choose from the list to see step-by-step guide</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AI Chat Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-4 text-sm">Ask AI About Any Document — In Your Language</h3>
              <div className="space-y-3">
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:text-white">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <select value={selectedDoc?.id || ''} onChange={e => setSelectedDoc(DOCUMENTS.find(d => d.id === e.target.value) || null)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:text-white">
                  <option value="">Select Document Type (Optional)</option>
                  {DOCUMENTS.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
                </select>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Type your question in any Indian language..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:text-white resize-none"
                />
                <button onClick={askAI} disabled={isLoading || !question.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Send className="w-4 h-4" /> Ask AI</>}
                </button>
              </div>
              {answer && (
                <div className="mt-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              )}
            </div>
          </div>
          <MultilingualChat compact />
        </div>
      )}
    </div>
  );
}
