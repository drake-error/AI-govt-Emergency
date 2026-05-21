"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Globe, AlertOctagon } from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export default function MultilingualChat() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I am your AI E-Governance Citizen Assistant. How can I help you today? (You can ask about relief schemes, power cutoffs, bad roads, or Aadhaar validation)." }
  ]);
  const [inputText, setInputText] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const quickPrompts = [
    { text: "Where is my nearest shelter?", label: "Nearest Shelter" },
    { text: "Who is my ward MLA for power cutoff?", label: "MLA Contact" },
    { text: "Find Cyclone relief compensation schemes", label: "Relief Schemes" },
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, lang: lang })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${data.detail || 'Failed to fetch'}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Could not connect to FastAPI backend. Please check if backend is online." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="bg-amber-500 p-1.5 rounded-lg text-slate-950">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">AI E-Governance Bot</h3>
            <p className="text-[9px] text-slate-400">Powered by OpenAI GPT-4o</p>
          </div>
        </div>
        
        {/* Language Flag Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-lg">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-slate-900 border-none text-[10px] font-bold text-slate-200 focus:ring-0 p-1 rounded cursor-pointer"
          >
            <option value="en-IN">EN</option>
            <option value="hi-IN">हिं (HI)</option>
            <option value="ta-IN">த (TA)</option>
            <option value="te-IN">తె (TE)</option>
            <option value="kn-IN">ಕ (KN)</option>
          </select>
        </div>
      </div>

      {/* CHAT BUBBLES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${m.sender === 'user' ? 'bg-slate-100 text-slate-700' : 'bg-amber-500/10 text-amber-700 border border-amber-500/10'}`}>
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 shadow-sm">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK CHIPS */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 shrink-0">
        {quickPrompts.map((q, idx) => (
          <button 
            key={idx}
            onClick={() => handleSendMessage(q.text)}
            className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold px-2.5 py-1 rounded-full text-[10px] shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* INPUT STRIP */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex space-x-2"
        >
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI assistant (Schemes, MLA contacts...)"
            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 p-2.5"
          />
          <button 
            type="submit" 
            className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
