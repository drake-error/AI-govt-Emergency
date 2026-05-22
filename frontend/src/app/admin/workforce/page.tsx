"use client";
import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, AlertTriangle, Download, Plus, Calculator, FileDown } from "lucide-react";
import jsPDF from "jspdf";

const SAMPLE_EMPLOYEES = [
  { id: "E001", name: "Ravi Kumar", department: "Production", designation: "Operator", doj: "2021-03-15", basic: 18000, hra: 7200, da: 1800, specialAllowance: 3000, category: "skilled" },
  { id: "E002", name: "Priya Sharma", department: "HR", designation: "Executive", doj: "2022-07-01", basic: 22000, hra: 8800, da: 2200, specialAllowance: 4000, category: "skilled" },
  { id: "E003", name: "Suresh Babu", department: "Housekeeping", designation: "Attendant", doj: "2020-01-10", basic: 12000, hra: 4800, da: 1200, specialAllowance: 2000, category: "unskilled" },
  { id: "E004", name: "Meena Devi", department: "Accounts", designation: "Assistant", doj: "2023-04-20", basic: 16000, hra: 6400, da: 1600, specialAllowance: 2500, category: "semi-skilled" },
];

const REGISTERS = [
  { id: "muster_roll", name: "Muster Roll", form: "Form B", act: "Contract Labour Act", color: "blue" },
  { id: "wage_register", name: "Wage Register", form: "Form D", act: "Minimum Wages Act", color: "green" },
  { id: "pf_register", name: "PF Register", form: "Form 3A", act: "EPF Act 1952", color: "purple" },
  { id: "esi_register", name: "ESI Register", form: "Form 6", act: "ESI Act 1948", color: "orange" },
  { id: "overtime_register", name: "Overtime Register", form: "Form IV", act: "Factories Act", color: "red" },
  { id: "gratuity_register", name: "Gratuity Register", form: "Form F", act: "Gratuity Act 1972", color: "amber" },
];

const CALENDAR = [
  { due: "15th Monthly", task: "PF ECR Filing (EPFO Portal)", act: "EPF Act", urgent: true },
  { due: "21st Monthly", task: "ESI Contribution Payment", act: "ESI Act", urgent: true },
  { due: "30th Monthly", task: "Professional Tax Payment", act: "PT Act", urgent: false },
  { due: "Apr 30", task: "Annual Return Form 20", act: "Factories Act", urgent: false },
  { due: "May 31", task: "PF Annual Return 3A/6A", act: "EPF Act", urgent: false },
];

export default function WorkforcePage() {
  const [tab, setTab] = useState<"employees"|"payroll"|"registers"|"calendar">("employees");
  const [employees] = useState(SAMPLE_EMPLOYEES);
  const [selected, setSelected] = useState(SAMPLE_EMPLOYEES[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [regInfo, setRegInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/workforce/payroll").then(r => r.json()).then(setRegInfo).catch(() => {});
  }, []);

  const calcPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workforce/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "calculate_payroll", employee: selected, month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
      });
      setResult(await res.json());
    } catch { setResult(null); }
    setLoading(false);
  };

  const downloadPayslip = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("PAYSLIP", 105, 12, { align: "center" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`${result.name} | ${result.month}/${result.year}`, 105, 20, { align: "center" });
    doc.setTextColor(0, 0, 0); doc.setFontSize(10);
    let y = 40;
    const row = (label: string, val: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(label, 20, y); doc.text(val, 140, y); y += 8;
    };
    doc.setFont("helvetica", "bold"); doc.text("EARNINGS", 20, y); y += 8;
    row("Basic", `₹${result.earnings?.basic}`);
    row("HRA", `₹${result.earnings?.hra}`);
    row("DA", `₹${result.earnings?.da}`);
    row("Special Allowance", `₹${result.earnings?.special}`);
    row("GROSS", `₹${result.earnings?.gross}`, true);
    y += 4; doc.setFont("helvetica", "bold"); doc.text("DEDUCTIONS", 20, y); y += 8;
    row("PF (Employee 12%)", `₹${result.deductions?.pf_employee}`);
    row("ESI", `₹${result.deductions?.esi_employee}`);
    row("Professional Tax", `₹${result.deductions?.professional_tax}`);
    row("TDS", `₹${result.deductions?.tds}`);
    row("TOTAL DEDUCTIONS", `₹${result.deductions?.total}`, true);
    y += 6;
    doc.setFillColor(240, 253, 244); doc.rect(15, y - 4, 180, 12, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("NET PAY", 20, y + 4); doc.text(`₹${result.net_pay}`, 140, y + 4);
    y += 20; doc.setFontSize(9);
    const status = result.compliance?.status;
    doc.setTextColor(status === "COMPLIANT" ? 5 : 220, status === "COMPLIANT" ? 150 : 38, status === "COMPLIANT" ? 105 : 38);
    doc.text(`Compliance: ${status}`, 20, y);
    if (result.compliance?.violations?.length > 0) {
      y += 7;
      result.compliance.violations.forEach((v: string) => { doc.text(`⚠ ${v}`, 20, y); y += 6; });
    }
    doc.save(`Payslip_${result.name.replace(/ /g, "_")}_${result.month}_${result.year}.pdf`);
  };

  const tabs = [
    { id: "employees", label: "Employees", icon: Users },
    { id: "payroll", label: "Payroll Calculator", icon: Calculator },
    { id: "registers", label: "Statutory Registers", icon: FileText },
    { id: "calendar", label: "Compliance Calendar", icon: CheckCircle },
  ] as const;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 border-b-4 border-amber-500">
        <div className="text-[10px] text-amber-400 font-black tracking-widest uppercase mb-2">MSME COMPLIANCE PLATFORM</div>
        <h1 className="text-2xl font-black">Workforce Management & Labour Compliance</h1>
        <p className="text-slate-400 text-sm mt-1">Payroll · PF/ESI · Minimum Wages · Statutory Registers · Compliance Calendar</p>
        <div className="flex gap-4 mt-4">
          {[["Total Staff", employees.length], ["Compliant", employees.length - 1], ["Violations", "1"], ["Due This Month", "3"]].map(([l, v]) => (
            <div key={l as string} className="bg-slate-800/60 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-black text-amber-400">{v}</div>
              <div className="text-[10px] text-slate-400 uppercase">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${tab === id ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* EMPLOYEES TAB */}
      {tab === "employees" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 dark:text-white">Employee Register</h2>
            <button className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Employee
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>{["ID","Name","Department","Designation","Category","Basic (₹)","Gross (₹)","PF Eligible","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {employees.map(emp => {
                  const gross = emp.basic + emp.hra + emp.da + emp.specialAllowance;
                  const minWage = emp.basic / 26 >= (emp.category === "skilled" ? 673 : emp.category === "semi-skilled" ? 618 : 563);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono text-slate-500">{emp.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp.designation}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{emp.category}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">₹{emp.basic.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">₹{gross.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {minWage
                          ? <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle className="w-3 h-3" />OK</span>
                          : <span className="flex items-center gap-1 text-red-600 font-bold"><AlertTriangle className="w-3 h-3" />BELOW</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setSelected(emp); setTab("payroll"); }}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-colors">
                          Run Payroll
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
      {tab === "payroll" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-500" />Payroll Calculator</h2>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1 block">Select Employee</label>
              <select value={selected.id} onChange={e => setSelected(employees.find(emp => emp.id === e.target.value) || employees[0])}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {emp.designation}</option>)}
              </select>
            </div>
            {[["Basic Salary", selected.basic], ["HRA", selected.hra], ["Dearness Allowance", selected.da], ["Special Allowance", selected.specialAllowance]].map(([l, v]) => (
              <div key={l as string} className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{l}</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{(v as number).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm py-2 bg-amber-50 dark:bg-amber-950/20 px-3 rounded-xl">
              <span className="font-bold text-amber-700 dark:text-amber-400">Gross Salary</span>
              <span className="font-black text-amber-700 dark:text-amber-400">₹{(selected.basic + selected.hra + selected.da + selected.specialAllowance).toLocaleString()}</span>
            </div>
            <button onClick={calcPayroll} disabled={loading}
              className="w-full bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50">
              {loading ? "Calculating..." : "Calculate Payroll + Compliance Check"}
            </button>
          </div>

          {result && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-slate-900 dark:text-white">Payslip — {result.name}</h2>
                <button onClick={downloadPayslip} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold">
                  <FileDown className="w-3.5 h-3.5" />Download PDF
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {[["Basic", result.earnings?.basic], ["HRA", result.earnings?.hra], ["DA", result.earnings?.da], ["Special", result.earnings?.special]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500">{l}</span><span className="font-bold dark:text-white">₹{(v as number)?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 bg-green-50 dark:bg-green-950/20 px-3 rounded-lg font-bold text-green-700 dark:text-green-400">
                  <span>Gross</span><span>₹{result.earnings?.gross?.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-xs font-black text-red-600 uppercase">Deductions</p>
                {[["PF (12%)", result.deductions?.pf_employee], ["ESI", result.deductions?.esi_employee], ["Prof. Tax", result.deductions?.professional_tax], ["TDS", result.deductions?.tds]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500">{l}</span><span className="font-bold text-red-600">-₹{(v as number)?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-xl p-4 text-center">
                <div className="text-xs uppercase tracking-widest opacity-70 mb-1">Net Pay</div>
                <div className="text-3xl font-black">₹{result.net_pay?.toLocaleString()}</div>
              </div>
              <div className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${result.compliance?.status === "COMPLIANT" ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"}`}>
                {result.compliance?.status === "COMPLIANT" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <div>
                  <div>{result.compliance?.status}</div>
                  {result.compliance?.violations?.map((v: string, i: number) => <div key={i} className="font-normal mt-0.5">{v}</div>)}
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <p className="font-bold mb-1 text-slate-700 dark:text-slate-300">Applicable Acts:</p>
                {result.compliance?.acts_applicable?.map((a: string, i: number) => <div key={i}>• {a}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REGISTERS TAB */}
      {tab === "registers" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <strong>Statutory Compliance:</strong> MSMEs must maintain these registers under Indian Labour Laws. Download, fill, and present during Labour Department inspections or audits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REGISTERS.map(reg => (
              <div key={reg.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">{reg.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{reg.act}</p>
                  </div>
                  <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg">{reg.form}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={async () => {
                    const res = await fetch("/api/workforce/payroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate_register", register_type: reg.id, employees: SAMPLE_EMPLOYEES }) });
                    const data = await res.json();
                    const doc = new jsPDF();
                    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text(reg.name, 105, 20, { align: "center" });
                    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`${reg.form} | ${reg.act}`, 105, 28, { align: "center" });
                    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 35, { align: "center" });
                    doc.text(`Records: ${data.records} employees`, 20, 50);
                    doc.text(`Status: ${data.status}`, 20, 58);
                    let y = 75;
                    SAMPLE_EMPLOYEES.forEach((emp, i) => {
                      doc.text(`${i+1}. ${emp.name} | ${emp.department} | ₹${(emp.basic+emp.hra+emp.da+emp.specialAllowance).toLocaleString()}`, 20, y); y += 8;
                    });
                    doc.save(`${reg.id}_${new Date().toISOString().split("T")[0]}.pdf`);
                  }} className="flex-1 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />Download {reg.form}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === "calendar" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 font-black text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500" />Compliance Filing Calendar — Labour Laws
            </div>
            {(regInfo?.compliance_calendar || CALENDAR).map((item: any, i: number) => (
              <div key={i} className={`p-4 flex items-center gap-4 ${item.urgent ? "border-l-4 border-red-500" : "border-l-4 border-green-500"}`}>
                <div className={`text-xs font-black px-3 py-2 rounded-xl text-center min-w-[80px] ${item.urgent ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400" : "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"}`}>
                  {item.due}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{item.task}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.act} {item.penalty ? `| Penalty: ${item.penalty}` : ""}</p>
                </div>
                {item.urgent && <span className="text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-lg uppercase">Recurring</span>}
              </div>
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Minimum Wages 2024 (Karnataka):</strong> Skilled ₹673/day · Semi-skilled ₹618/day · Unskilled ₹563/day. Violations attract prosecution under Section 22 of Minimum Wages Act.
          </div>
        </div>
      )}
    </div>
  );
}
