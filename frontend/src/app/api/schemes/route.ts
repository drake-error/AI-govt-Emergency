import { NextResponse } from 'next/server';

// Real Indian Government Relief & Welfare Schemes (comprehensive database)
const SCHEMES = [
  // ─── DISASTER RELIEF ────────────────────────────────────────────
  {
    id: 'sdrf-2024',
    title: 'State Disaster Relief Fund (SDRF)',
    category: 'Disaster Relief',
    ministry: 'Ministry of Home Affairs',
    description:
      'Immediate financial assistance to families affected by declared natural disasters including cyclones, floods, earthquakes, and landslides. Covers temporary shelter, food, and rehabilitation costs.',
    eligibility: 'Citizens in disaster-declared districts. BPL and AAY ration card holders get priority.',
    amount: '₹3,500 per family (immediate); ₹95,100 for house damage',
    link: 'https://ndma.gov.in/Disaster-Risk-Governance/DM-Plans/SDRF',
    link_text: 'Apply via NDMA',
  },
  {
    id: 'ndrf-relief',
    title: 'National Disaster Response Fund (NDRF)',
    category: 'Disaster Relief',
    ministry: 'Ministry of Home Affairs',
    description:
      'Central supplementary assistance provided to state governments when the disaster is of severe nature and SDRF funds are insufficient. Covers search & rescue, gratuitous relief, and restoration.',
    eligibility: 'State government applies on behalf of affected citizens. No individual application needed.',
    amount: 'Variable based on disaster severity and central assessment',
    link: 'https://ndma.gov.in',
    link_text: 'NDMA Official Portal',
  },
  {
    id: 'cyclone-exgratia',
    title: 'Cyclone & Flood Ex-Gratia Compensation',
    category: 'Disaster Relief',
    ministry: 'State Revenue Department',
    description:
      'Ex-gratia payment to next of kin of deceased and for grievous injuries sustained during cyclone or flood disasters. Separate compensation for loss of cattle, agricultural land, and fishing boats.',
    eligibility: 'Families of disaster victims; Injured persons with medical certification from government hospital.',
    amount: '₹4 lakh per death | ₹2.12 lakh grievous injury | ₹68,900 minor injury',
    link: 'https://ndma.gov.in/Disaster-Risk-Governance/DM-Plans/NDRF-Norms',
    link_text: 'Check NDRF Norms',
  },

  // ─── HEALTH ─────────────────────────────────────────────────────
  {
    id: 'pmjay-2024',
    title: 'Ayushman Bharat PM-JAY',
    category: 'Health',
    ministry: 'Ministry of Health & Family Welfare',
    description:
      "World's largest government-funded health assurance scheme. Provides cashless and paperless access to healthcare services for secondary and tertiary hospitalization at empanelled hospitals across India.",
    eligibility: 'Bottom 40% of population as per SECC-2011. BPL families. Automatically enrolled — no registration needed.',
    amount: '₹5 lakh per family per year (health cover)',
    link: 'https://pmjay.gov.in',
    link_text: 'Check Eligibility on PM-JAY',
  },
  {
    id: 'cghs-2024',
    title: 'Central Government Health Scheme (CGHS)',
    category: 'Health',
    ministry: 'Ministry of Health & Family Welfare',
    description:
      'Comprehensive healthcare for central government employees, pensioners, and their dependents. Covers OPD, indoor treatment, specialist consultations, and medicines from CGHS dispensaries.',
    eligibility: 'Central government employees (serving & retired), freedom fighters, journalists accredited to PIB.',
    amount: 'Cashless treatment; subscription ₹250–₹1000/month based on pay grade',
    link: 'https://cghs.gov.in',
    link_text: 'Apply on CGHS Portal',
  },

  // ─── AGRICULTURE ─────────────────────────────────────────────────
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Samman Nidhi',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description:
      'Direct income support to all landholding farmer families to supplement their financial needs for procuring various inputs for crop cultivation. Amount transferred directly to bank accounts.',
    eligibility: 'All land-holding farmer families with cultivable land. Excludes government employees, taxpayers, and professionals.',
    amount: '₹6,000 per year in 3 equal installments of ₹2,000',
    link: 'https://pmkisan.gov.in',
    link_text: 'Register on PM-KISAN Portal',
  },
  {
    id: 'pmfby',
    title: 'PM Fasal Bima Yojana (PMFBY)',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description:
      'Comprehensive crop insurance to provide financial support to farmers suffering crop loss due to unforeseen calamities like drought, flood, pest attacks, hailstorm, and natural fires.',
    eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.',
    amount: 'Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial crops. Claim based on actual loss.',
    link: 'https://pmfby.gov.in',
    link_text: 'Apply on PMFBY Portal',
  },
  {
    id: 'kcc-2024',
    title: 'Kisan Credit Card (KCC) Scheme',
    category: 'Agriculture',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description:
      'Provides farmers with short-term credit for cultivation, post-harvest expenses, produce marketing, and allied activities at subsidised interest rates. Also covers disaster-affected farmers.',
    eligibility: 'All farmers — individual or joint borrowers, tenant farmers, oral lessees, and SHGs.',
    amount: 'Credit up to ₹3 lakh at 4% interest rate (with interest subvention)',
    link: 'https://www.nabard.org/content.aspx?id=572',
    link_text: 'Apply via nearest Bank/NABARD',
  },

  // ─── HOUSING ─────────────────────────────────────────────────────
  {
    id: 'pmay-gramin',
    title: 'PMAY Gramin (Rural Housing)',
    category: 'Housing',
    ministry: 'Ministry of Rural Development',
    description:
      'Financial assistance to rural BPL households for construction of pucca houses with basic amenities. Includes MGNREGS labour wages for house construction and sanitation facilities.',
    eligibility: 'Houseless families and those with kutcha/dilapidated houses as per SECC-2011 database.',
    amount: '₹1.2 lakh (plain areas) | ₹1.3 lakh (hilly/NE/IAP districts)',
    link: 'https://pmayg.nic.in',
    link_text: 'Apply on PMAY-G Portal',
  },
  {
    id: 'pmay-urban',
    title: 'PMAY Urban (Credit Linked Subsidy)',
    category: 'Housing',
    ministry: 'Ministry of Housing & Urban Affairs',
    description:
      'Credit Linked Subsidy Scheme for home loans to EWS, LIG, and MIG categories. Provides interest subsidy on housing loans to help urban poor own a house.',
    eligibility: 'EWS (income ≤3 lakh), LIG (3–6 lakh), MIG-I (6–12 lakh), MIG-II (12–18 lakh) families without pucca house.',
    amount: 'Interest subsidy: 6.5% (EWS/LIG) | 4% (MIG-I) | 3% (MIG-II) on home loans',
    link: 'https://pmaymis.gov.in',
    link_text: 'Check Eligibility on PMAY-Urban',
  },

  // ─── EMPLOYMENT & LIVELIHOOD ─────────────────────────────────────
  {
    id: 'mgnregs',
    title: 'MGNREGS (100 Days Employment Guarantee)',
    category: 'Employment',
    ministry: 'Ministry of Rural Development',
    description:
      'Guarantees 100 days of wage employment per year to adult members of rural households willing to do unskilled manual work. Provides livelihood security, especially post-disaster.',
    eligibility: 'Adult member (18+) of any rural household. No income criteria. Works within 5 km radius.',
    amount: '₹220–₹357/day (state-wise rates). Payment within 15 days of work.',
    link: 'https://nrega.nic.in',
    link_text: 'Apply via Gram Panchayat',
  },
  {
    id: 'pmegp',
    title: 'PM Employment Generation Programme (PMEGP)',
    category: 'Employment',
    ministry: 'Ministry of MSME',
    description:
      'Credit-linked subsidy scheme to generate employment opportunities in rural and urban areas by helping individuals set up micro enterprises in non-farm sector.',
    eligibility: 'Any individual above 18 years. For projects above ₹10 lakh — 8th standard pass. No income ceiling.',
    amount: 'Subsidy: 15–35% of project cost (up to ₹25 lakh manufacturing, ₹10 lakh service)',
    link: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    link_text: 'Apply on PMEGP Portal',
  },
  {
    id: 'pm-svanidhi',
    title: 'PM SVANidhi (Street Vendor Scheme)',
    category: 'Employment',
    ministry: 'Ministry of Housing & Urban Affairs',
    description:
      'Provides affordable working capital loans to street vendors who lost their livelihoods due to COVID-19 or natural disasters. Includes digital transaction rewards and social security benefits.',
    eligibility: 'Street vendors with Certificate of Vending or Letter of Recommendation from ULB.',
    amount: '₹10,000 (1st loan) → ₹20,000 → ₹50,000 (on timely repayment)',
    link: 'https://pmsvanidhi.mohua.gov.in',
    link_text: 'Apply on SVANidhi Portal',
  },

  // ─── SOCIAL SECURITY ─────────────────────────────────────────────
  {
    id: 'nsap-pension',
    title: 'National Social Assistance Programme (NSAP)',
    category: 'Social Security',
    ministry: 'Ministry of Rural Development',
    description:
      'Social protection to elderly, widows, and disabled persons Below Poverty Line. Covers Indira Gandhi National Old Age, Widow, and Disability Pension Schemes.',
    eligibility: 'BPL elderly (60+), widows (40+), severely disabled persons (80%+ disability). Aadhaar linked bank account required.',
    amount: '₹200–₹500/month (centre) + state top-up (total varies ₹500–₹1,500/month)',
    link: 'https://nsap.nic.in',
    link_text: 'Apply via Gram Panchayat / ULB',
  },
  {
    id: 'pm-jjby',
    title: 'PM Jeevan Jyoti Bima Yojana (PMJJBY)',
    category: 'Social Security',
    ministry: 'Ministry of Finance',
    description:
      'Life insurance scheme offering renewable one-year term life cover. Simple enrollment through bank accounts. Covers death due to any reason including natural disasters.',
    eligibility: 'Bank account holders aged 18–50 years. Auto-debit from savings bank account.',
    amount: '₹436/year premium | ₹2 lakh life cover on death',
    link: 'https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana(PMJJBY)',
    link_text: 'Enroll via Bank Branch',
  },
  {
    id: 'pm-suby',
    title: 'PM Suraksha Bima Yojana (PMSBY)',
    category: 'Social Security',
    ministry: 'Ministry of Finance',
    description:
      'Accidental death and disability insurance scheme. Extremely low premium making it accessible to weaker sections. Covers accidental deaths including during natural disasters.',
    eligibility: 'Savings bank account holders aged 18–70 years with Aadhaar-linked account.',
    amount: '₹20/year premium | ₹2 lakh (accidental death) | ₹1 lakh (partial disability)',
    link: 'https://jansuraksha.gov.in',
    link_text: 'Enroll via Jan Suraksha Portal',
  },

  // ─── WOMEN & CHILDREN ────────────────────────────────────────────
  {
    id: 'sukanya-samriddhi',
    title: 'Sukanya Samriddhi Yojana (SSY)',
    category: 'Women & Children',
    ministry: 'Ministry of Finance',
    description:
      "Small savings scheme for the girl child to meet education and marriage expenses. One of India's highest interest rate small savings schemes with tax benefits under Section 80C.",
    eligibility: 'Girl child below 10 years. Maximum 2 girls per family (3 in case of twins/triplets).',
    amount: 'Min ₹250/year; Max ₹1.5 lakh/year. Current interest rate: 8.2% (Q1 2024)',
    link: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89',
    link_text: 'Open at Post Office / Bank',
  },
  {
    id: 'pm-matru-vandana',
    title: 'PM Matru Vandana Yojana (PMMVY)',
    category: 'Women & Children',
    ministry: 'Ministry of Women & Child Development',
    description:
      'Maternity benefit scheme providing cash incentive for pregnant and lactating mothers to partly compensate for wage loss and improve health & nutrition practices.',
    eligibility: 'Pregnant women aged 19+ years for first live birth. Not applicable to central/state government employees.',
    amount: '₹5,000 in 3 installments (₹1000 + ₹2000 + ₹2000)',
    link: 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana',
    link_text: 'Apply at Anganwadi Centre',
  },

  // ─── EDUCATION ──────────────────────────────────────────────────
  {
    id: 'pm-scholarship',
    title: 'PM Scholarship Scheme (PMSS)',
    category: 'Education',
    ministry: 'Ministry of Home Affairs / Ex-Servicemen Welfare',
    description:
      'Scholarship for children of ex-servicemen, ex-coastguard personnel and their widows for professional degree courses. Priority to wards of personnel killed/disabled in action.',
    eligibility: 'Children/widows of Ex-Servicemen & Ex-Coastguard. Minimum 60% marks in last qualifying exam.',
    amount: '₹3,000/month (girls) | ₹2,500/month (boys) for up to 5 years',
    link: 'https://ksb.gov.in/pmss.htm',
    link_text: 'Apply on KSB Portal',
  },

  // ─── ENERGY & UTILITIES ──────────────────────────────────────────
  {
    id: 'pm-ujjwala',
    title: 'PM Ujjwala Yojana 2.0',
    category: 'Energy',
    ministry: 'Ministry of Petroleum & Natural Gas',
    description:
      'Free LPG connections to women from BPL households to protect their health and shift from polluting cooking fuels. Includes first refill and stove at no cost to beneficiaries.',
    eligibility: 'Women aged 18+ from BPL households. SECC, SC/ST, PM-AWAS, AAY, MGNREGS or Forest Dwellers list.',
    amount: 'Free LPG connection + first cylinder refill + EMI-free hotplate',
    link: 'https://pmuy.gov.in',
    link_text: 'Apply on PMUY Portal',
  },
  {
    id: 'saubhagya',
    title: 'Saubhagya – Rural Electrification',
    category: 'Energy',
    ministry: 'Ministry of Power',
    description:
      'Free electricity connections to all unelectrified BPL households in rural areas and all unelectrified households in urban areas. Includes wiring, meter, LED bulbs, and switch.',
    eligibility: 'Households identified in SECC 2011 data without electricity connections.',
    amount: 'Free connection for BPL | ₹500 deposit (10 installments) for APL rural families',
    link: 'https://saubhagya.gov.in',
    link_text: 'Check Status on Saubhagya',
  },
];

export async function GET() {
  return NextResponse.json({ success: true, schemes: SCHEMES });
}
