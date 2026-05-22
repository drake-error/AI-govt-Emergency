"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Globe, Mic, MicOff, Volume2, VolumeX, AlertTriangle, Phone } from 'lucide-react';
import Link from 'next/link';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
  lang?: string;
}

const INDIAN_LANGUAGES = [
  { code: 'en-IN', name: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as-IN', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur-IN', name: 'Urdu', native: 'اردو', flag: '🇮🇳' },
  { code: 'sa-IN', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'sd-IN', name: 'Sindhi', native: 'سنڌي', flag: '🇮🇳' },
  { code: 'kok-IN', name: 'Konkani', native: 'कोंकणी', flag: '🇮🇳' },
  { code: 'mni-IN', name: 'Manipuri', native: 'মৈতৈলোন্', flag: '🇮🇳' },
  { code: 'ne-IN', name: 'Nepali', native: 'नेपाली', flag: '🇮🇳' },
  { code: 'bho-IN', name: 'Bhojpuri', native: 'भोजपुरी', flag: '🇮🇳' },
  { code: 'mai-IN', name: 'Maithili', native: 'मैथिली', flag: '🇮🇳' },
  { code: 'ks-IN', name: 'Kashmiri', native: 'كٲشُر', flag: '🇮🇳' },
  { code: 'doi-IN', name: 'Dogri', native: 'डोगरी', flag: '🇮🇳' },
];

const QUICK_PROMPTS: Record<string, { text: string; label: string }[]> = {
  'en-IN': [
    { text: 'Where is my nearest emergency shelter?', label: '🏠 Find Shelter' },
    { text: 'What flood relief schemes am I eligible for?', label: '💰 Relief Schemes' },
    { text: 'My house was damaged in the cyclone, what help is available?', label: '🌀 Cyclone Help' },
    { text: 'How do I apply for Aadhaar card?', label: '🪪 Aadhaar Help' },
  ],
  'hi-IN': [
    { text: 'मेरे पास का आपातकालीन आश्रय कहाँ है?', label: '🏠 आश्रय खोजें' },
    { text: 'बाढ़ राहत योजना के लिए कैसे आवेदन करें?', label: '💰 राहत योजना' },
    { text: 'मेरा घर तूफान में क्षतिग्रस्त हो गया', label: '🌀 आपदा सहायता' },
    { text: 'आधार कार्ड कैसे बनवाएं?', label: '🪪 आधार सहायता' },
  ],
  'ta-IN': [
    { text: 'அருகிலுள்ள அவசர தங்குமிடம் எங்கே?', label: '🏠 தங்குமிடம்' },
    { text: 'வெள்ள நிவாரண திட்டங்கள் என்ன?', label: '💰 நிவாரண திட்டங்கள்' },
    { text: 'சூறாவளியில் வீடு சேதமடைந்தது', label: '🌀 புயல் உதவி' },
    { text: 'ஆதார் அட்டை எப்படி பெறுவது?', label: '🪪 ஆதார் உதவி' },
  ],
  'te-IN': [
    { text: 'దగ్గర్లో అత్యవసర ఆశ్రయం ఎక్కడ ఉంది?', label: '🏠 ఆశ్రయం కనుగొను' },
    { text: 'వరద నివారణ పథకాలు ఏమిటి?', label: '💰 నివారణ పథకాలు' },
    { text: 'తుఫానులో నా ఇల్లు దెబ్బతింది', label: '🌀 తుఫాన్ సహాయం' },
    { text: 'ఆధార్ కార్డు ఎలా పొందాలి?', label: '🪪 ఆధార్ సహాయం' },
  ],
  'kn-IN': [
    { text: 'ಹತ್ತಿರದ ತುರ್ತು ಆಶ್ರಯ ಎಲ್ಲಿದೆ?', label: '🏠 ಆಶ್ರಯ ಹುಡುಕಿ' },
    { text: 'ಪ್ರವಾಹ ಪರಿಹಾರ ಯೋಜನೆಗಳು ಯಾವುವು?', label: '💰 ಪರಿಹಾರ ಯೋಜನೆಗಳು' },
    { text: 'ಚಂಡಮಾರುತದಲ್ಲಿ ಮನೆ ಹಾನಿಗೊಂಡಿದೆ', label: '🌀 ಚಂಡಮಾರುತ ಸಹಾಯ' },
    { text: 'ಆಧಾರ್ ಕಾರ್ಡ್ ಹೇಗೆ ಪಡೆಯುವುದು?', label: '🪪 ಆಧಾರ್ ಸಹಾಯ' },
  ],
};

// BCP-47 language codes for Chrome SpeechRecognition
const RECOGNITION_LANG_MAP: Record<string, string> = {
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'kn-IN': 'kn-IN',
  'ml-IN': 'ml-IN',
  'bn-IN': 'bn-IN',
  'mr-IN': 'mr-IN',
  'gu-IN': 'gu-IN',
  'pa-IN': 'pa-IN',
  'ur-IN': 'ur-IN',
  'or-IN': 'or-IN',
  'as-IN': 'as-IN',
  'sa-IN': 'sa-IN',
  'ne-IN': 'ne-IN',
  'bho-IN': 'bho-IN',
  'mai-IN': 'mai-IN',
  'ks-IN': 'ks-IN',
  'doi-IN': 'doi-IN',
  'default': 'en-IN',
};


export default function MultilingualChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your AI Emergency Assistant for NDMA. I can help you in all 22 Indian languages. Ask me about relief schemes, nearby shelters, disaster alerts, or document help. For immediate life-threatening emergencies, call 112!",
      time: new Date().toLocaleTimeString(),
      lang: 'en-IN'
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = useCallback((text: string, langCode: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    // Map our lang codes to BCP-47 for speech synthesis
    const speechLangMap: Record<string, string> = {
      'en-IN': 'en-IN', 'hi-IN': 'hi-IN', 'ta-IN': 'ta-IN', 'te-IN': 'te-IN',
      'kn-IN': 'kn-IN', 'ml-IN': 'ml-IN', 'bn-IN': 'bn-IN', 'mr-IN': 'mr-IN',
      'gu-IN': 'gu-IN', 'pa-IN': 'pa-IN', 'ur-IN': 'ur-IN', 'or-IN': 'or-IN',
      'as-IN': 'as-IN', 'sa-IN': 'sa-IN', 'ne-IN': 'ne-IN',
    };
    utter.lang = speechLangMap[langCode] || 'hi-IN';

    utter.rate = 0.9;
    utter.pitch = 1.0;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0])) ||
                       voices.find(v => v.lang.includes('IN')) ||
                       voices[0];
    if (matchVoice) utter.voice = matchVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  }, [voiceEnabled]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Please use Chrome.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = RECOGNITION_LANG_MAP[lang] || RECOGNITION_LANG_MAP['default'];
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const detectEmergency = (text: string) => {
    const emergencyWords = ['help', 'sos', 'emergency', 'danger', 'fire', 'trapped', 'dying', 'accident',
      'बचाओ', 'मदद', 'खतरा', 'உதவி', 'ஆபத்து', 'సహాయం', 'ಸಹಾಯ', 'sahayam', 'madad'];
    return emergencyWords.some(w => text.toLowerCase().includes(w));
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (detectEmergency(textToSend)) {
      setHasEmergency(true);
    }

    const userMsg: Message = { sender: 'user', text: textToSend, time: new Date().toLocaleTimeString(), lang };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, lang })
      });
      const data = await res.json();
      if (res.ok) {
        const aiMsg: Message = { sender: 'ai', text: data.response, time: new Date().toLocaleTimeString(), lang };
        setMessages(prev => [...prev, aiMsg]);
        if (voiceEnabled) speakText(data.response, lang);
      }
    } catch {
      const errMsg: Message = { sender: 'ai', text: 'Connection error. For emergencies call 112.', time: new Date().toLocaleTimeString(), lang: 'en-IN' };
      setMessages(prev => [...prev, errMsg]);
    }
    setIsLoading(false);
  };

  const currentLang = INDIAN_LANGUAGES.find(l => l.code === lang) || INDIAN_LANGUAGES[0];
  const quickPrompts = QUICK_PROMPTS[lang] || QUICK_PROMPTS['en-IN'];
  const containerHeight = compact ? 'h-[520px]' : 'h-[calc(100vh-200px)] min-h-[600px]';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col ${containerHeight} relative`}>

      {/* Emergency Banner */}
      {hasEmergency && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-pulse rounded-t-2xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency detected! Call 112 immediately or use SOS button</span>
            </div>
            <div className="flex gap-2">
              <a href="tel:112" className="bg-white text-red-600 px-3 py-1 rounded-full font-black text-[10px] whitespace-nowrap" role="button">CALL 112</a>
              <Link href="/sos" className="bg-white text-red-600 px-3 py-1 rounded-full font-black text-[10px] whitespace-nowrap">SOS NOW</Link>
            </div>
          </div>
        )}

      {/* HEADER */}
      <div className={`p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-900 to-blue-950 text-white ${hasEmergency ? '' : 'rounded-t-2xl'}`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            {isSpeaking && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />}
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">AI Emergency Assistant</h3>
            <p className="text-[10px] text-slate-400">NDMA • 22 Indian Languages • Voice Enabled</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Toggle */}
          <button
            onClick={() => { setVoiceEnabled(!voiceEnabled); window.speechSynthesis?.cancel(); }}
            className={`p-2 rounded-lg transition-all ${voiceEnabled ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}
            title={voiceEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangPanel(!showLangPanel)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentLang.native}</span>
            </button>

            {showLangPanel && (
              <div className="absolute right-0 top-10 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-64 max-h-72 overflow-y-auto">
                <div className="p-2 border-b border-slate-700">
                  <p className="text-[10px] text-slate-400 font-bold uppercase px-1">Select Language / भाषा चुनें</p>
                </div>
                <div className="p-2 grid grid-cols-2 gap-1">
                  {INDIAN_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setShowLangPanel(false); }}
                      className={`text-left px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${lang === l.code ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[9px] text-slate-500 block">{l.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950" onClick={() => setShowLangPanel(false)}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${m.sender === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-amber-500/20 border border-amber-500/20'}`}>
                {m.sender === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-amber-600" />}
              </div>
              <div className="group">
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[9px] text-slate-400">{m.time}</span>
                  {m.sender === 'ai' && (
                    <button onClick={() => speakText(m.text, m.lang || lang)} className="text-[9px] text-slate-400 hover:text-amber-500 flex items-center gap-0.5 transition-colors">
                      <Volume2 className="w-2.5 h-2.5" /> Play
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PROMPTS */}
      {!compact && (
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-200 dark:border-slate-600 hover:border-amber-300 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-full text-[10px] shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Emergency Hotline */}
      <div className="px-4 py-1.5 bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-red-600 dark:text-red-400 font-bold">
          <Phone className="w-3 h-3" />
          <span>Emergency: 112 | NDMA: 1078 | Fire: 101 | Ambulance: 102</span>
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className="flex gap-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-2.5 rounded-xl transition-all shrink-0 relative ${isListening ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
            title={isListening ? 'Stop Listening' : `Speak in ${currentLang.native}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening && <span className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask in ${currentLang.native}... (${currentLang.name})`}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 px-3 py-2 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-900 p-2.5 rounded-xl transition-all shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {isListening && (
          <p className="text-[10px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening in {currentLang.native}... Speak now
          </p>
        )}
      </div>
    </div>
  );
}
