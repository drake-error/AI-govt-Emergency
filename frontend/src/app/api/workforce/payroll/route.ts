import { NextRequest, NextResponse } from 'next/server';

// Indian Labour Law Constants
const PF_RATE = 0.12;
const ESI_RATE = 0.0075;
const PT_MONTHLY = 200;
const GRATUITY_RATE = 4.81 / 100;
const MIN_WAGE_DAILY = 563; // Karnataka 2024

interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  doj: string;
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  category: 'skilled' | 'semi-skilled' | 'unskilled';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, employee, month, year } = body;

    if (action === 'calculate_payroll') {
      const emp: Employee = employee;
      const gross = emp.basic + emp.hra + emp.da + emp.specialAllowance;

      // Deductions
      const pf_employee = Math.round(emp.basic * PF_RATE);
      const pf_employer = Math.round(emp.basic * PF_RATE);
      const esi_employee = gross <= 21000 ? Math.round(gross * ESI_RATE) : 0;
      const esi_employer = gross <= 21000 ? Math.round(gross * 0.0325) : 0;
      const pt = PT_MONTHLY;
      const tds = gross > 50000 ? Math.round(gross * 0.1) : 0;
      const totalDeductions = pf_employee + esi_employee + pt + tds;
      const netPay = gross - totalDeductions;

      // Compliance checks
      const dailyWage = emp.basic / 26;
      const minWageCompliant = dailyWage >= MIN_WAGE_DAILY;
      const violations: string[] = [];
      if (!minWageCompliant) violations.push(`Minimum wage violation: ₹${dailyWage.toFixed(0)}/day < ₹${MIN_WAGE_DAILY}/day`);
      if (emp.basic < gross * 0.4) violations.push('Basic salary < 40% of gross (PF compliance risk)');

      return NextResponse.json({
        employee_id: emp.id,
        name: emp.name,
        month, year,
        earnings: { basic: emp.basic, hra: emp.hra, da: emp.da, special: emp.specialAllowance, gross },
        deductions: { pf_employee, esi_employee, professional_tax: pt, tds, total: totalDeductions },
        employer_contributions: { pf: pf_employer, esi: esi_employer, total: pf_employer + esi_employer },
        net_pay: netPay,
        compliance: {
          status: violations.length === 0 ? 'COMPLIANT' : 'VIOLATIONS FOUND',
          violations,
          acts_applicable: [
            'Minimum Wages Act, 1948',
            'Employees Provident Fund Act, 1952',
            ...(gross <= 21000 ? ['ESI Act, 1948'] : []),
            'Payment of Gratuity Act, 1972',
            'Professional Tax Act',
          ],
          gratuity_accrual: Math.round(emp.basic * GRATUITY_RATE),
        },
      });
    }

    if (action === 'generate_register') {
      const { register_type, employees } = body;
      return NextResponse.json({
        register_type,
        generated_at: new Date().toISOString(),
        records: employees?.length ?? 0,
        format: 'Form ' + (register_type === 'muster_roll' ? 'B' : register_type === 'wage_register' ? 'D' : 'A'),
        status: 'READY_FOR_DOWNLOAD',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    registers: [
      { id: 'muster_roll', name: 'Muster Roll', form: 'Form B', act: 'Contract Labour Act' },
      { id: 'wage_register', name: 'Wage Register', form: 'Form D', act: 'Minimum Wages Act' },
      { id: 'overtime_register', name: 'Overtime Register', form: 'Form IV', act: 'Factories Act' },
      { id: 'pf_register', name: 'PF Contribution Register', form: 'Form 3A', act: 'EPF Act' },
      { id: 'esi_register', name: 'ESI Contribution Register', form: 'Form 6', act: 'ESI Act' },
      { id: 'gratuity_register', name: 'Gratuity Register', form: 'Form F', act: 'Gratuity Act' },
      { id: 'leave_register', name: 'Leave Register', form: 'Form 14', act: 'Factories Act' },
      { id: 'accident_register', name: 'Accident Register', form: 'Form 26', act: 'Factories Act' },
    ],
    min_wages: { skilled: 673, semi_skilled: 618, unskilled: 563, currency: 'INR/day' },
    compliance_calendar: [
      { due: '15th every month', task: 'PF ECR filing (EPFO portal)', penalty: '₹5000/day delay' },
      { due: '21st every month', task: 'ESI contribution payment', penalty: '12% interest + damages' },
      { due: 'April 30', task: 'Annual Return - Form 20 (Factories Act)', penalty: '₹1 lakh' },
      { due: 'Before May 31', task: 'PF Annual Return Form 3A/6A', penalty: '₹5000' },
    ],
  });
}
