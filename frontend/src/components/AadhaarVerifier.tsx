"use client";

import { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, UserCheck, AlertCircle } from 'lucide-react';

export default function AadhaarVerifier() {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [refId, setRefId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"INPUT" | "OTP" | "SUCCESS">("INPUT");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [citizenDetails, setCitizenDetails] = useState<any>(null);

  const handleSendOTP = async () => {
    if (aadhaarNumber.length !== 12) {
      setErrorMsg("Aadhaar Number must be exactly 12 digits long.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/aadhaar/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: aadhaarNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setRefId(data.ref_id);
        setStep("OTP");
      } else {
        setErrorMsg(data.detail || "Failed to trigger OTP verification.");
      }
    } catch (e) {
      setErrorMsg("Unable to connect to sandbox api service.");
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/aadhaar/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_id: refId, otp: otp })
      });
      const data = await res.json();
      if (res.ok) {
        setCitizenDetails(data.citizen_details);
        setStep("SUCCESS");
      } else {
        setErrorMsg(data.detail || "Invalid OTP verification code.");
      }
    } catch (e) {
      setErrorMsg("Authentication failed. Ensure backend API is active.");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[380px]">
      
      {/* HEADER */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-extrabold text-slate-950 flex items-center">
            <Lock className="w-4.5 h-4.5 mr-1.5 text-emerald-600" />
            Aadhaar Sandbox Verification
          </h3>
          <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">
            SANDBOX ACTIVE
          </span>
        </div>
        <p className="text-[10px] text-slate-500">Secure validation via Aadhaar Sandbox API (Live Key Verified)</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-center space-x-2 my-2 animate-shake">
          <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* BODY MODULE */}
      <div className="flex-1 py-4 flex flex-col justify-center">
        
        {/* STEP 1: INPUT AADHAAR */}
        {step === "INPUT" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Enter 12-Digit Aadhaar ID Number</label>
              <input 
                type="text" 
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="XXXX XXXX XXXX" 
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-center tracking-widest text-lg rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3"
              />
            </div>
            
            <button 
              onClick={handleSendOTP}
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <span>{isLoading ? 'Sending Request...' : 'Fetch Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === "OTP" && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Reference Ticket ID</p>
               <p className="text-xs font-bold text-slate-800 font-mono">{refId}</p>
            </div>
            
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 text-center">Enter 6-Digit SMS Verification Pin</label>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456" 
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-center tracking-[1em] pl-6 text-lg rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3"
              />
              <p className="text-[9px] text-slate-400 text-center mt-1.5">Simulation: Enter standard code <span className="font-bold text-emerald-600 font-mono">123456</span> to complete sandbox authentication.</p>
            </div>
            
            <button 
              onClick={handleVerifyOTP}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/10"
            >
              <span>{isLoading ? 'Verifying...' : 'Submit OTP Validation'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS SECURE TICKET STAMP */}
        {step === "SUCCESS" && citizenDetails && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4 space-y-4 shadow-sm animate-fadeIn relative overflow-hidden">
             
             {/* Emblem Watermark */}
             <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none transform rotate-12 scale-125">
               <ShieldCheck className="w-32 h-32 text-emerald-800" />
             </div>

             <div className="flex items-center space-x-3 pb-3 border-b border-emerald-200">
                <div className="bg-emerald-500 p-2 rounded-full text-white shadow-sm">
                   <UserCheck className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Aadhaar E-KYC Approved</h4>
                   <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest font-mono">Status: Secure Token Active</p>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-2.5 text-[10px] relative z-10">
                <div className="col-span-2 space-y-1">
                   <p className="text-slate-500">Legal Name / नाम:</p>
                   <p className="font-extrabold text-slate-800 text-xs">{citizenDetails.name}</p>
                   
                   <p className="text-slate-500 pt-1">Gender / DOB:</p>
                   <p className="font-bold text-slate-700">{citizenDetails.gender} | {citizenDetails.dob}</p>
                </div>
                <div className="col-span-1 border border-emerald-200 rounded bg-white p-1 text-center flex flex-col items-center justify-center shadow-sm">
                   <div className="w-9 h-11 bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-[8px] border border-slate-200">PHOTO</div>
                   <p className="text-[7px] font-bold text-emerald-600 mt-1 uppercase">VERIFIED</p>
                </div>
                
                <div className="col-span-3 pt-1">
                   <p className="text-slate-500">Address / पता:</p>
                   <p className="font-bold text-slate-700 text-[9px] leading-relaxed">{citizenDetails.address}</p>
                </div>
             </div>
             
             <button 
               onClick={() => {
                 setStep("INPUT");
                 setAadhaarNumber("");
                 setOtp("");
               }}
               className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-2 rounded-lg uppercase transition-all shadow-sm"
             >
                Verify New Document
             </button>

          </div>
        )}

      </div>
      
    </div>
  );
}
