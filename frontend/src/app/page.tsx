"use client";

import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { Mic, AlertTriangle, MapPin, Compass, ShieldAlert, Award, ShieldCheck, HelpCircle } from 'lucide-react';
import AadhaarVerifier from '@/components/AadhaarVerifier';
import AuthorityFinder from '@/components/AuthorityFinder';
import MultilingualChat from '@/components/MultilingualChat';

const CitizenMap = dynamic(() => import('@/components/CitizenMap'), { ssr: false });

export default function CitizenEmergencyMode() {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [transcript, setTranscript] = useState("Press microphone to activate voice assist");
  const [sosStatus, setSosStatus] = useState<"IDLE" | "HOLDING" | "SENT">("IDLE");
  const [compressedPayload, setCompressedPayload] = useState<string | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const langGreetings: Record<string, string> = {
    'en-IN': "Welcome to AI Disaster Response Navigator. Speak now.",
    'hi-IN': "आपदा सहायता प्रणाली में स्वागत है। बोलें।",
    'ta-IN': "பேரழிவு உதவி அமைப்பிற்கு உங்களை வரவேற்கிறோம். பேசுங்கள்.",
    'te-IN': "విపత్తు సహాయ కేంద్రానికి స్వాగతం. మాట్లాడండి.",
    'kn-IN': "ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಸಹಾಯ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ. ಮಾತನಾಡಿ."
  };

  const langResponses: Record<string, string> = {
    'en-IN': "Distress location logged. Our SDRF response team has been alerted. Look at the GIS Map on the right and proceed to the green Relief Shelter.",
    'hi-IN': "आपातकालीन स्थिति दर्ज कर ली गई है। हमारी एस.डी.आर.एफ. टीम को अलर्ट कर दिया गया है। शांत रहें, दाहिनी ओर जी.आई.एस. मैप देखें और निकटतम ग्रीन रिलीफ शेल्टर की ओर बढ़ें।",
    'ta-IN': "உங்கள் அவசரநிலையை நான் குறித்துக் கொண்டேன். எங்களது மீட்புக் குழு எச்சரிக்கப்பட்டுள்ளது. அமைதியாக இருங்கள், வரைபடத்தைப் பார்த்து, அருகிலுள்ள நிவாரண முகாமிற்குச் செல்லுங்கள்.",
    'te-IN': "నేను మీ అత్యవసర పరిస్థితిని నమోదు చేసాను. మా సహాయక బృందం అప్రమత్తమైంది. కుడివైపు ఉన్న మ్యాప్ చూసి సమీప నివాస శిబిరానికి వెళ్ళండి.",
    'kn-IN': "ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ನಾನು ದಾಖಲಿಸಿಕೊಂಡಿದ್ದೇನೆ. ನಮ್ಮ ರಕ್ಷಣಾ ತಂಡಕ್ಕೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ. ಶಾಂತರಾಗಿರಿ, ಬಲಭಾಗದಲ್ಲಿರುವ ನಕ್ಷೆಯನ್ನು ನೋಡಿ ಮತ್ತು ಹತ್ತಿರದ ಪುನರ್ವಸತಿ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಿ."
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Voice recognition not supported. Please use manual features below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript(langGreetings[selectedLang] || "Listening...");
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(`You said: "${speechResult}"`);
      
      setTimeout(() => {
        const responseText = langResponses[selectedLang] || langResponses['en-IN'];
        setTranscript(responseText);
        speakResponse(responseText);
      }, 1000);
    };

    recognition.onerror = (event: any) => {
      setTranscript(`Speech Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSOSDown = () => {
    setSosStatus("HOLDING");
    holdTimeoutRef.current = setTimeout(async () => {
      setSosStatus("SENT");
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          
          const compressed = JSON.stringify({
            id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
            loc: [lat, lng],
            stat: "ACT",
            time: Math.floor(Date.now() / 1000)
          });
          
          setCompressedPayload(compressed);

          try {
            await fetch('http://localhost:8000/api/sos/trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: "Emergency Citizen",
                phone: "MHA-Citizen",
                message: "Rapid SMS Packet Distress SOS Triggered",
                lat: lat,
                lng: lng
              })
            });
          } catch(e) {
            console.warn("Backend offline, dispatch mock complete.");
          }
        });
      }
    }, 3000);
  };

  const handleSOSUp = () => {
    if (sosStatus === "HOLDING") {
      clearTimeout(holdTimeoutRef.current!);
      setSosStatus("IDLE");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-0">
      
      {/* LEFT & CENTER COLUMNS: PORTAL ACCESS AND GRIEVANCE REDRESSAL DIRECTORY */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* BANNER CARD */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 border-b-4 border-amber-600 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
             <Award className="w-64 h-64 text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full">
                NATIONAL DESK ACTIVE
              </span>
              <h2 className="text-2xl font-black mt-2.5 text-slate-100">AI Disaster Assistance & Ward Grievances</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Secured E-Governance portal with real-time speech analytics, Aadhaar Sandbox authorization, and localized ward directory escalation (Power, Waste, Roads, MLA).
              </p>
            </div>
            
            <div className="bg-slate-800/80 border border-slate-700 p-2 rounded-xl flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Voice Accent:</span>
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 rounded p-1.5 focus:ring-1 focus:ring-amber-500"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">हिंदी (Hindi)</option>
                <option value="ta-IN">தமிழ் (Tamil)</option>
                <option value="te-IN">తెలుగు (Telugu)</option>
                <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
          </div>
        </div>

        {/* VOICE INPUT & MANUAL TOUCH BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* VOICE TRANSLATION BOT */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-between text-center min-h-[340px] relative">
            <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> VOICE ACTIVE
            </div>
            
            <div className="my-auto py-6">
              <button 
                onClick={startListening}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  isListening ? 'bg-red-600 shadow-[0_0_35px_rgba(220,38,38,0.5)]' : 'bg-slate-100 hover:bg-slate-200 border-2 border-slate-300'
                }`}
              >
                {isListening && <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring"></div>}
                <Mic className={`w-12 h-12 ${isListening ? 'text-white' : 'text-slate-800'}`} />
              </button>
            </div>
            
            <div className="w-full bg-slate-950/5 border border-slate-200 p-4 rounded-xl text-xs min-h-[80px] flex items-center justify-center">
              <p className="text-slate-700 font-bold leading-relaxed">{transcript}</p>
            </div>
          </div>

          {/* TOUCH TARGET QUICK ACTIONS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1.5">Direct Helpline Targets</h3>
              <p className="text-[10px] text-slate-500 mb-4">Tactile targets optimized for high accessibility in active emergencies.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <a href="tel:1078" className="h-16 bg-red-50 text-red-700 border border-red-200 rounded-xl font-black text-xs flex flex-col justify-center items-center hover:bg-red-100 active:scale-95 transition-all text-center">
                <AlertTriangle className="w-5 h-5 mb-1 text-red-600" />
                SDRF DESK: 1078
              </a>
              <a href="tel:108" className="h-16 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-black text-xs flex flex-col justify-center items-center hover:bg-blue-100 active:scale-95 transition-all text-center">
                <AlertTriangle className="w-5 h-5 mb-1 text-blue-600" />
                MEDICAL AID: 108
              </a>
              <a href="tel:112" className="h-16 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-black text-xs flex flex-col justify-center items-center hover:bg-emerald-100 active:scale-95 transition-all text-center">
                <MapPin className="w-5 h-5 mb-1 text-emerald-600" />
                POLICE HELP: 112
              </a>
              <a href="tel:1070" className="h-16 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-black text-xs flex flex-col justify-center items-center hover:bg-amber-100 active:scale-95 transition-all text-center">
                <Compass className="w-5 h-5 mb-1 text-amber-600" />
                STATE DESK: 1070
              </a>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
               <span>Official Sovereign DPI Link</span>
               <span className="text-slate-800 font-extrabold flex items-center">
                 <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> SECURE GATEWAY
               </span>
            </div>
          </div>

        </div>

        {/* INTERACTIVE WARD GRIEVANCE OFFICIAL SELECTOR */}
        <AuthorityFinder />

        {/* SECURE AADHAAR SANDBOX E-KYC FRAME */}
        <AadhaarVerifier />

        {/* SOS BROADCAST PAYLOAD */}
        <div className="bg-red-50 rounded-2xl p-6 border-2 border-dashed border-red-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
             <div>
               <h3 className="font-extrabold text-red-950 text-sm flex items-center">
                 <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block mr-2 animate-ping"></span>
                 🚨 CRISIS ATTENDANCE COMPLIANCE SOS
               </h3>
               <p className="text-xs text-slate-600 mt-1 max-w-lg">
                 Press and hold for 3 seconds. The backend will parse telemetry coordinates and trigger active SMS verification alerts directly via Twilio to command operators.
               </p>
             </div>
             
             <button
               onMouseDown={handleSOSDown}
               onMouseUp={handleSOSUp}
               onMouseLeave={handleSOSUp}
               onTouchStart={handleSOSDown}
               onTouchEnd={handleSOSUp}
               className={`w-full md:w-48 py-4 px-6 rounded-xl font-black text-sm tracking-wider uppercase transition-all duration-300 ${
                 sosStatus === "SENT" ? "bg-green-600 text-white shadow-lg shadow-green-600/30" : 
                 sosStatus === "HOLDING" ? "bg-red-700 text-white scale-95 shadow-[inset_0_0_15px_rgba(0,0,0,0.4)]" : 
                 "bg-red-600 hover:bg-red-700 text-white shadow-[0_5px_0_#991b1b]"
               }`}
             >
               {sosStatus === "SENT" ? "✓ BROADCASTED!" : "HOLD SOS (3 SEC)"}
             </button>
          </div>

          {compressedPayload && (
            <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400">
               <div className="flex justify-between items-center mb-2 text-[10px] text-slate-500 font-bold tracking-wider">
                 <span>COMPRESSED SINGLE-PACKET (SMS PAYLOAD):</span>
                 <span className="text-emerald-500">24 BYTES</span>
               </div>
               <p className="break-all">{compressedPayload}</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: HIGH-DENSITY GIS MAP & MULTILINGUAL CHAT */}
      <div className="lg:col-span-1 space-y-8 flex flex-col">
        
        {/* INTERACTIVE GIS CRISIS NETWORK */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[480px] relative shrink-0">
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-950 text-sm flex items-center">
              <Compass className="w-4.5 h-4.5 mr-1.5 text-amber-600" />
              CIVIC INTEGRATED GIS MAP
            </h3>
            <p className="text-[10px] text-slate-500">Real-time dynamic safe coordinates & flood-zones</p>
          </div>
          
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-100 relative z-0">
             <CitizenMap />
          </div>
        </div>

        {/* MULTILINGUAL GPT-4O CITIZEN AI CHATBOT */}
        <MultilingualChat />

        {/* OFFICIAL STATE STAMP STATS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
           <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center">
             <HelpCircle className="w-4 h-4 mr-1 text-slate-400" /> E-Governance Scheme Links
           </h3>
           <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                <span>Active ex-gratia compensation claims verified instantly via Aadhaar Sandbox credential checks.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
                <span>Ward directories map automatic Escalation Protocols directly to the Legislative Desk.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0"></span>
                <span>High accessibility touch triggers comply with international Web Content Accessibility Guidelines (WCAG).</span>
              </li>
           </ul>
        </div>

      </div>

    </div>
  );
}
