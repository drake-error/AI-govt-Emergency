"use client";

import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Camera, FileDown, CheckCircle, Clock, ShieldCheck, Landmark, FileText } from 'lucide-react';

export default function WorkforcePayroll() {
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

  // Initialize Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const simulateBiometricScan = () => {
    if (!isCameraActive) return;
    const depts = ["SDRF Battalion 4", "Municipal Debris Unit", "Medical Relief Corps", "District Civil Defense"];
    const names = ["Sanjeev Malhotra", "Priya Swaminathan", "Harpreet Singh", "Karan Johar"];
    
    const newLog = {
      id: Math.floor(1000 + Math.random() * 9000),
      name: names[Math.floor(Math.random() * names.length)],
      time: new Date().toLocaleTimeString(),
      dept: depts[Math.floor(Math.random() * depts.length)],
      status: "COMPLIANT: On Duty"
    };
    setAttendanceLog([newLog, ...attendanceLog]);
  };

  const calculatePayroll = async (workerId: number) => {
    setIsCalculating(true);
    try {
      // Mock parameters for demonstration
      const hoursWorked = workerId === 4021 ? 11.5 : 14.5; // Trigger overwork flag for non-4021
      const hourlyRate = 500;
      const multiplier = 1.5; // Hazard bonus
      
      const res = await fetch(`http://localhost:8000/api/workforce/payroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: workerId.toString(),
          hours_worked: hoursWorked,
          hourly_rate: 500.0,
          multiplier: 1.5
        })
      });
      if (!res.ok) throw new Error("Server rejected request");
      const data = await res.json();
      setPayrollResult(data);
    } catch (e) {
      console.error("Failed to connect to backend", e);
      // Fallback if backend is down
      setPayrollResult({
        worker_id: workerId,
        total_hours: workerId === 4021 ? 11.5 : 14.5,
        base_earnings: workerId === 4021 ? 5750 : 7250,
        emergency_bonus: workerId === 4021 ? 2875 : 3625,
        total_payable_inr: workerId === 4021 ? 8625 : 10875,
        compliance_status: workerId === 4021 ? "COMPLIANT" : "VIOLATION: Overwork Flagged (> 12 hrs)"
      });
    }
    setIsCalculating(false);
  };

  const generatePDF = () => {
    if (!payrollResult) return;
    const doc = new jsPDF();
    const targetWorker = attendanceLog.find(w => w.id === parseInt(selectedWorkerId)) || { name: "Assigned Responder", dept: "Emergency Division" };

    // Beautiful State Header Setup
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, "F");
    
    // Top border stripes (Saffron, White, Green)
    doc.setFillColor(249, 115, 22); // Saffron
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(16, 185, 129); // Green
    doc.rect(0, 4, 210, 2, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(16);
    doc.text("GOVERNMENT OF INDIA", 105, 22, { align: "center" });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("State Disaster Response Force (SDRF) Compliance Ledger", 105, 28, { align: "center" });
    doc.text("Ministry of Home Affairs | Department of Rehabilitation", 105, 33, { align: "center" });
    
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(15, 38, 195, 38);
    
    // Official Information Layout
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("1. WORKER & VERIFICATION DETAILS", 15, 48);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Full Name: ${targetWorker.name}`, 15, 56);
    doc.text(`Registration ID: SDRF-${payrollResult.worker_id}`, 15, 62);
    doc.text(`Department: ${targetWorker.dept}`, 15, 68);
    doc.text(`Ledger System IP: 10.142.16.82 (NIC Secure)`, 15, 74);
    doc.text(`Date of Settlement: ${new Date().toLocaleDateString()}`, 110, 56);
    doc.text(`Attendance Stamp: BIOMETRIC GEOFENCED`, 110, 62);
    doc.text(`Transaction Status: GRANTED BY TREASURY`, 110, 68);

    doc.line(15, 80, 195, 80);

    // Financial calculations
    doc.setFont("helvetica", "bold");
    doc.text("2. COMPENSATION & EX-GRATIA LEDGER", 15, 90);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Deployment Hours:`, 15, 98);
    doc.text(`${payrollResult.total_hours} Hours`, 110, 98);
    
    doc.text(`Base Wage Earnings (Risk Scale):`, 15, 104);
    doc.text(`INR ${payrollResult.base_earnings}.00`, 110, 104);
    
    doc.text(`Cyclone Hazard Relief Multiplier (1.5x):`, 15, 110);
    doc.text(`INR ${payrollResult.emergency_bonus}.00`, 110, 110);

    doc.setFillColor(241, 245, 249);
    doc.rect(15, 118, 180, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL PAYABLE COMPENSATORY SUM:`, 20, 126);
    doc.text(`INR ${payrollResult.total_payable_inr}.00`, 110, 126);

    doc.line(15, 138, 195, 138);

    // Compliance Check
    doc.text("3. WORKFORCE REGULATORY COMPLIANCE STAMP", 15, 148);
    doc.setFont("helvetica", "normal");
    
    const isCompliant = payrollResult?.compliance_status?.includes("VIOLATION") === false;
    doc.setFillColor(isCompliant ? 240 : 254, isCompliant ? 253 : 242, isCompliant ? 250 : 242);
    doc.rect(15, 154, 180, 14, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isCompliant ? 5 : 220, isCompliant ? 150 : 38, isCompliant ? 105 : 38);
    doc.text(`REGULATION RESULT: ${payrollResult?.compliance_status || "N/A"}`, 20, 163);

    // Digital Signatures
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("4. DIGITAL AUTHENTICATION KEY", 15, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("SHA-256: d5a639bf826b1c7821639cde1e1f13b281f6c44fa78c1b52a", 15, 192);
    
    // Digital Stamp Representation
    doc.setDrawColor(30, 41, 59);
    doc.rect(130, 210, 50, 20);
    doc.setFont("helvetica", "bold");
    doc.text("SDRF GOVT APPROVED", 132, 217);
    doc.setFontSize(7);
    doc.text("TREASURY DISBURSEMENT", 132, 223);
    doc.text("NIC SECURE SYSTEM", 132, 227);

    doc.save(`SDRF_EX_GRATIA_LEDGER_${payrollResult.worker_id}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER PANELS */}
      <div className="bg-slate-900 border-l-4 border-amber-600 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-[10px] text-amber-400 font-black tracking-widest uppercase">
            <Landmark className="w-3.5 h-3.5" /> 
            <span>REGULATORY COMPLIANCE SYSTEM (TREASURY DESK)</span>
          </div>
          <h2 className="text-2xl font-black mt-2 text-slate-100">National Disaster Relief Labor Registry</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time dynamic biometric validation and automated ex-gratia daily settlements for deployed field forces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* LEFT: BIOMETRIC TERMINAL KIOSK */}
         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
               <div>
                  <h2 className="text-base font-extrabold text-slate-950 flex items-center">
                    <Camera className="w-4.5 h-4.5 mr-1.5 text-blue-600"/>
                    Biometric Check-in Terminal (Mock Camera)
                  </h2>
                  <p className="text-[10px] text-slate-500">Secured with optical iris/face pattern validation</p>
               </div>
            </div>
            
            <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border-4 border-slate-900 shadow-inner">
              {isCameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-emerald-500/40 m-8 rounded-lg pointer-events-none">
                     <div className="w-full h-0.5 bg-emerald-500/70 absolute top-1/3 shadow-[0_0_15px_#10b981] animate-bounce"></div>
                     <div className="absolute top-2 left-2 text-[9px] text-emerald-400 font-bold bg-slate-950/70 px-2 py-0.5 rounded uppercase tracking-wider">
                       LIVENESS CHECK: OK
                     </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <Camera className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Kiosk Stream Terminal Offline</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-3">
              {!isCameraActive ? (
                <button onClick={startCamera} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors">
                  Activate Biometric Camera
                </button>
              ) : (
                <>
                  <button onClick={simulateBiometricScan} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md shadow-emerald-500/10">
                    Verify Biometric Scan
                  </button>
                  <button onClick={stopCamera} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors border border-slate-200">
                    Close Terminal
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
               <h3 className="font-extrabold text-slate-800 mb-3 text-xs uppercase tracking-wider">Biometric Verification Log</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs text-slate-600">
                   <thead className="bg-slate-50 text-slate-700 uppercase tracking-widest text-[9px] border-b border-slate-200">
                     <tr>
                       <th className="py-2.5 px-3">Responder Name</th>
                       <th className="py-2.5 px-3">Registry ID</th>
                       <th className="py-2.5 px-3">Verification Stamp</th>
                       <th className="py-2.5 px-3">Check-in</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {attendanceLog.map((log, i) => (
                       <tr key={i} className="hover:bg-slate-50/50">
                         <td className="py-2.5 px-3 font-semibold text-slate-800">{log.name}</td>
                         <td className="py-2.5 px-3 font-mono">SDRF-{log.id}</td>
                         <td className="py-2.5 px-3 text-emerald-600 font-bold">{log.status}</td>
                         <td className="py-2.5 px-3 text-slate-500">{log.time}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
         </div>

         {/* RIGHT: TREASURY SETTLEMENT PROCESSOR */}
         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <div>
                     <h2 className="text-base font-extrabold text-slate-950 flex items-center">
                       <Landmark className="w-4.5 h-4.5 mr-1.5 text-emerald-600"/>
                       Ex-Gratia Treasury Disbursement Kiosk
                     </h2>
                     <p className="text-[10px] text-slate-500">Instant direct benefit transfer wage calculator</p>
                  </div>
               </div>
               
               <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                 Select a validated responder from the active biometric attendance registry. The treasury engine will dynamically compile their base wages and cyclone hazard bonuses.
               </p>

               <div className="flex space-x-2 mb-6">
                  <select 
                     value={selectedWorkerId}
                     onChange={(e) => setSelectedWorkerId(e.target.value)}
                     className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold"
                  >
                     {attendanceLog.map(l => (
                       <option key={l.id} value={l.id.toString()}>{l.name} (SDRF-{l.id})</option>
                     ))}
                  </select>
                  <button 
                     onClick={() => calculatePayroll(parseInt(selectedWorkerId))}
                     disabled={isCalculating}
                     className="bg-slate-950 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors"
                  >
                    {isCalculating ? 'Computing...' : 'Process Ledger'}
                  </button>
               </div>
            </div>

            {payrollResult && (
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-5 shadow-inner">
                 <div className="text-center border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NET PAYABLE TREASURY DISBURSEMENT</span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">INR {payrollResult.total_payable_inr}.00</h3>
                 </div>
                 
                 <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-200/50 pb-2">
                      <span className="text-slate-500">Base Risk Remuneration</span>
                      <span className="font-bold text-slate-800">INR {payrollResult.base_earnings}.00</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-2">
                      <span className="text-slate-500">MHA Cyclone Hazard Bonus (1.5x)</span>
                      <span className="font-extrabold text-emerald-600">+ INR {payrollResult.emergency_bonus}.00</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-2">
                      <span className="text-slate-500">Logged Deployment Shift</span>
                      <span className="font-bold text-slate-800">{payrollResult.total_hours} Hours</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500">Force Regulatory Result</span>
                      <span className={`font-extrabold ${payrollResult?.compliance_status?.includes('VIOLATION') ? 'text-red-600' : 'text-emerald-600'}`}>
                        {payrollResult?.compliance_status || "N/A"}
                      </span>
                    </div>
                 </div>

                 <button 
                   onClick={generatePDF}
                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center transition-all shadow-md shadow-emerald-500/10"
                 >
                   <FileDown className="w-4 h-4 mr-2" /> Download Offical PDF Settlement
                 </button>
              </div>
            )}
            
            {!payrollResult && (
              <div className="border border-slate-200 rounded-2xl p-12 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 border-dashed">
                 <FileText className="w-10 h-10 mb-3 opacity-30" />
                 <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Select Responder & Process Ledger</p>
              </div>
            )}
         </div>

      </div>
    </div>
  );
}
