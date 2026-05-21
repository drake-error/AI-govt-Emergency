"use client";

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Mic, AlertTriangle, Compass, Camera, FileDown, ShieldAlert, Landmark, FileText, Search, CloudRain } from 'lucide-react';
import { API_URL } from '@/lib/api';

const CitizenMap = dynamic(() => import('@/components/CitizenMap'), { ssr: false });
import MultilingualChat from '@/components/MultilingualChat';

export default function UnifiedGovTechPortal() {
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [transcript, setTranscript] = useState("वॉयस कमांड के लिए माइक्रोफोन दबाएं | Press mic for voice command");
  
  // Lookup & Weather State
  const [searchDistrict, setSearchDistrict] = useState("Bengaluru Urban");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  // Workforce & Payroll State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [attendanceLog, setAttendanceLog] = useState<{ id: number, name: string, time: string, dept: string, status: string }[]>([
    { id: 4021, name: "Commander Rajesh Kumar", time: "18:45:12", dept: "SDRF Battalion 4", status: "COMPLIANT: On Duty" },
    { id: 3102, name: "Inspector Amit Sharma", time: "18:32:00", dept: "Municipal Debris Unit", status: "COMPLIANT: On Duty" }
  ]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("4021");
  const [payrollResult, setPayrollResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const langResponses: Record<string, string> = {
    'hi-IN': "आपातकालीन स्थिति दर्ज। जी.आई.एस. मैप देखें।",
    'kn-IN': "ತುರ್ತು ಪರಿಸ್ಥಿತಿ ದಾಖಲಾಗಿದೆ. ನಕ್ಷೆ ನೋಡಿ.",
    'en-IN': "Emergency logged. Check the GIS map."
  };

  const fetchAreaDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/navigator/lookup?district=${searchDistrict}`);
      const data = await res.json();
      setLookupResult(data);
      
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
      if (apiKey) {
        const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchDistrict},IN&appid=${apiKey}&units=metric`);
        const wData = await wRes.json();
        setWeatherData(wData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAreaDetails();
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening...");
    };
    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(`You said: "${speechResult}"`);
      setTimeout(() => {
        setTranscript(langResponses[selectedLang] || langResponses['en-IN']);
      }, 1000);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const simulateBiometricScan = () => {
    if (!isCameraActive) return;
    const newLog = {
      id: Math.floor(1000 + Math.random() * 9000),
      name: "Sanjeev Malhotra",
      time: new Date().toLocaleTimeString(),
      dept: "Medical Relief Corps",
      status: "COMPLIANT: On Duty"
    };
    setAttendanceLog([newLog, ...attendanceLog]);
  };

  const calculatePayroll = async (workerId: number) => {
    setIsCalculating(true);
    try {
      const hoursWorked = workerId === 4021 ? 11.5 : 14.5;
      const res = await fetch(`${API_URL}/api/workforce/payroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: workerId.toString(),
          hours_worked: hoursWorked,
          hourly_rate: 500.0,
          multiplier: 1.5
        })
      });
      if (!res.ok) {
         setPayrollResult({ total_payable_inr: 0, compliance_status: "ERROR: Server rejected request" });
      } else {
         const data = await res.json();
         setPayrollResult(data);
      }
    } catch (e) {
      console.error(e);
      setPayrollResult({ total_payable_inr: 0, compliance_status: "ERROR: Network failure" });
    }
    setIsCalculating(false);
  };

  const generatePDF = () => {
    if (!payrollResult) return;
    const doc = new jsPDF();
    const targetWorker = attendanceLog.find(w => w.id === parseInt(selectedWorkerId)) || { name: "Assigned Responder", dept: "Emergency Division" };

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(249, 115, 22); doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(16, 185, 129); doc.rect(0, 4, 210, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text("GOVERNMENT OF INDIA", 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Full Name: ${targetWorker.name}`, 15, 56);
    doc.text(`Registration ID: SDRF-${payrollResult.worker_id}`, 15, 62);
    doc.text(`Department: ${targetWorker.dept}`, 15, 68);
    
    doc.text(`Total Deployment Hours: ${payrollResult.total_hours} Hours`, 15, 98);
    doc.text(`Base Wage Earnings: INR ${payrollResult.base_earnings}.00`, 15, 104);
    doc.text(`Hazard Relief Bonus (1.5x): INR ${payrollResult.emergency_bonus}.00`, 15, 110);
    doc.text(`TOTAL PAYABLE: INR ${payrollResult.total_payable_inr}.00`, 15, 126);
    
    doc.text(`REGULATION RESULT: ${payrollResult.compliance_status}`, 15, 163);

    doc.save(`SDRF_EX_GRATIA_LEDGER_${payrollResult.worker_id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 border-b-4 border-amber-600 shadow-md flex justify-between items-center">
        <div>
          <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full">
            UNIFIED NATIONAL DISASTER COMMAND
          </span>
          <h2 className="text-2xl font-black mt-2.5 text-slate-100">Civic Care & SDRF Payroll Master</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CITIZEN EMERGENCY CORRIDOR */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <h3 className="font-extrabold text-slate-950 mb-4 flex items-center border-b pb-2"><ShieldAlert className="w-5 h-5 mr-2 text-red-600"/> Citizen Emergency Corridor</h3>
            
            <div className="flex gap-4 mb-4">
               <input 
                 value={searchDistrict}
                 onChange={e => setSearchDistrict(e.target.value)}
                 className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold"
                 placeholder="Enter District (e.g. Mysuru)"
               />
               <button onClick={fetchAreaDetails} className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold flex items-center">
                  <Search className="w-4 h-4 mr-1" /> Lookup
               </button>
            </div>

            <div className="flex gap-4 items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
               <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Emergency Mic</p>
                  <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)} className="bg-white border border-slate-200 text-xs font-bold rounded p-1 mt-1">
                     <option value="hi-IN">हिंदी (hi-IN)</option>
                     <option value="kn-IN">ಕನ್ನಡ (kn-IN)</option>
                     <option value="en-IN">English (en-IN)</option>
                  </select>
               </div>
               <button 
                onClick={startListening}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-slate-200 border border-slate-300'}`}
               >
                 <Mic className={`w-8 h-8 ${isListening ? 'text-white' : 'text-slate-700'}`} />
               </button>
               <div className="flex-1 text-right text-xs font-bold text-slate-700">
                  {transcript}
               </div>
            </div>

            {weatherData && weatherData.weather && weatherData.main && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center text-blue-800 text-sm font-bold mb-4">
                <CloudRain className="w-5 h-5 mr-2" />
                Live Weather: {weatherData.weather[0].description}, Temp: {weatherData.main.temp}°C
              </div>
            )}

            <div className="rounded-xl overflow-hidden h-[300px] border border-slate-200">
              <CitizenMap />
            </div>
            
            {lookupResult && lookupResult.records && (
               <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs text-emerald-800 font-bold uppercase mb-2">Live Escaltion Details ({lookupResult.source})</p>
                  <p className="text-sm font-black text-slate-900">{lookupResult.records[0].mla_name || "Official"}</p>
                  <p className="text-xs text-slate-700">Contact: {lookupResult.records[0].mla_contact || "N/A"}</p>
                  <p className="text-xs text-slate-700">SDRF Dispatch: {lookupResult.records[0].sdrf_dispatch || "N/A"}</p>
               </div>
            )}
            
            <div className="mt-6">
              <MultilingualChat />
            </div>
          </div>
        </div>

        {/* COMPLIANCE & PAYROLL GRID */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative h-full">
            <h3 className="font-extrabold text-slate-950 mb-4 flex items-center border-b pb-2"><Landmark className="w-5 h-5 mr-2 text-emerald-600"/> Compliance & SDRF Payroll Grid</h3>
            
            <div className="bg-slate-950 rounded-xl overflow-hidden h-[180px] relative flex items-center justify-center border-4 border-slate-900 shadow-inner mb-4">
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <Camera className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-[10px] uppercase font-extrabold tracking-widest">Kiosk Offline</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mb-4">
               {!isCameraActive ? (
                 <button onClick={startCamera} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold uppercase">Start Camera</button>
               ) : (
                 <>
                   <button onClick={simulateBiometricScan} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold uppercase">Scan Fingerprint</button>
                   <button onClick={stopCamera} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Stop</button>
                 </>
               )}
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-[10px] text-slate-600">
                <thead className="bg-slate-50 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2">Responder</th>
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceLog.slice(0,3).map((log, i) => (
                    <tr key={i} className="font-bold">
                      <td className="py-2 px-2 text-slate-800">{log.name}</td>
                      <td className="py-2 px-2">SDRF-{log.id}</td>
                      <td className="py-2 px-2 text-emerald-600">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
               <div className="flex gap-2 mb-4">
                  <select 
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-xs rounded-lg p-2 font-bold"
                  >
                    {attendanceLog.map(l => (
                      <option key={l.id} value={l.id.toString()}>{l.name}</option>
                    ))}
                  </select>
                  <button onClick={() => calculatePayroll(parseInt(selectedWorkerId))} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">
                     Process
                  </button>
               </div>

               {payrollResult && (
                 <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-xs text-slate-500">Total Payable:</span>
                      <span className="text-sm font-black">INR {payrollResult.total_payable_inr}.00</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-xs text-slate-500">Compliance:</span>
                      <span className={`text-[10px] font-extrabold ${payrollResult?.compliance_status?.includes('VIOLATION') ? 'text-red-600' : 'text-emerald-600'}`}>
                        {payrollResult?.compliance_status || "N/A"}
                      </span>
                    </div>
                    <button onClick={generatePDF} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center uppercase">
                      <FileDown className="w-4 h-4 mr-1" /> Export PDF Ledger
                    </button>
                 </div>
               )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
