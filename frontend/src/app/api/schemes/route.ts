import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 25+ real Indian government schemes database
const SCHEMES_DB = [
  { id: 1, name: "PM Fasal Bima Yojana (PMFBY)", category: "Agriculture", benefit: "Crop insurance up to ₹2 lakh", eligibility: "Farmers with land ownership or tenancy", link: "https://pmfby.gov.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 2, name: "PM Awas Yojana - Gramin (PMAY-G)", category: "Housing", benefit: "₹1.2 lakh for plain areas, ₹1.3 lakh for hilly areas for house construction", eligibility: "BPL families without pucca house", link: "https://pmayg.nic.in", state: "All India", minIncome: 0, maxIncome: 100000 },
  { id: 3, name: "MGNREGA - Employment Guarantee", category: "Employment", benefit: "100 days guaranteed employment per year per household", eligibility: "Adult members of rural households", link: "https://nrega.nic.in", state: "All India", minIncome: 0, maxIncome: 200000 },
  { id: 4, name: "PM Kisan Samman Nidhi (PM-KISAN)", category: "Agriculture", benefit: "₹6,000 per year (₹2,000 per quarter)", eligibility: "Small and marginal farmers with less than 2 hectares land", link: "https://pmkisan.gov.in", state: "All India", minIncome: 0, maxIncome: 300000 },
  { id: 5, name: "Ayushman Bharat PM-JAY", category: "Health", benefit: "Health cover up to ₹5 lakh per family per year", eligibility: "BPL families (based on SECC data)", link: "https://pmjay.gov.in", state: "All India", minIncome: 0, maxIncome: 150000 },
  { id: 6, name: "National Disaster Relief Fund (NDRF)", category: "Disaster Relief", benefit: "Ex-gratia ₹4 lakh for death, ₹1.2 lakh for severe injury", eligibility: "Disaster victims and their families", link: "https://ndma.gov.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 7, name: "Cyclone Relief Compensation Scheme", category: "Disaster Relief", benefit: "₹10,000 immediate relief + house repair up to ₹95,100", eligibility: "Households in cyclone-affected districts", link: "https://ndma.gov.in/relief", state: "Coastal States", minIncome: 0, maxIncome: 500000 },
  { id: 8, name: "Flood Relief Assistance Scheme", category: "Disaster Relief", benefit: "₹3,800 per month for 30 days + free food kits", eligibility: "Flood-affected families in notified districts", link: "https://ndma.gov.in/floods", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 9, name: "PM Jeevan Jyoti Bima Yojana", category: "Insurance", benefit: "₹2 lakh life insurance cover at ₹330/year premium", eligibility: "Bank account holders aged 18-50", link: "https://jansuraksha.gov.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 10, name: "PM Suraksha Bima Yojana", category: "Insurance", benefit: "₹2 lakh accident insurance at ₹12/year premium", eligibility: "Bank account holders aged 18-70", link: "https://jansuraksha.gov.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 11, name: "National Family Benefit Scheme", category: "Social Security", benefit: "₹20,000 lump sum on death of breadwinner", eligibility: "BPL families (18-60 years breadwinner death)", link: "https://nsap.nic.in", state: "All India", minIncome: 0, maxIncome: 100000 },
  { id: 12, name: "Indira Gandhi National Old Age Pension", category: "Social Security", benefit: "₹200-500/month pension for elderly poor", eligibility: "BPL citizens aged 60+ years", link: "https://nsap.nic.in", state: "All India", minIncome: 0, maxIncome: 50000 },
  { id: 13, name: "PM Kaushal Vikas Yojana (PMKVY)", category: "Skill Development", benefit: "Free skill training + ₹8,000 reward on certification", eligibility: "Youth aged 15-45 years seeking employment", link: "https://pmkvyofficial.org", state: "All India", minIncome: 0, maxIncome: 500000 },
  { id: 14, name: "Pradhan Mantri Ujjwala Yojana", category: "Energy", benefit: "Free LPG connection for BPL families", eligibility: "BPL women without LPG connection", link: "https://pmuy.gov.in", state: "All India", minIncome: 0, maxIncome: 100000 },
  { id: 15, name: "PM Jan Dhan Yojana", category: "Financial Inclusion", benefit: "Zero-balance savings account + ₹1 lakh accident insurance", eligibility: "All Indian citizens without bank account", link: "https://pmjdy.gov.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 16, name: "Earthquake Affected Family Relief", category: "Disaster Relief", benefit: "₹95,100 for house repair, ₹4 lakh for death of family member", eligibility: "Earthquake-affected families in notified areas", link: "https://ndma.gov.in/earthquake", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 17, name: "Drought Affected Farmer Compensation", category: "Agriculture", benefit: "₹6,800/hectare for irrigated, ₹13,500/hectare for unirrigated crop loss", eligibility: "Farmers in officially drought-declared districts", link: "https://agriculture.gov.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 18, name: "National Scholarship Portal Scheme", category: "Education", benefit: "₹500-5,000/month scholarship for students", eligibility: "Students from minority/SC/ST/OBC communities with 50%+ marks", link: "https://scholarships.gov.in", state: "All India", minIncome: 0, maxIncome: 200000 },
  { id: 19, name: "Atal Pension Yojana", category: "Pension", benefit: "Guaranteed pension ₹1,000-5,000/month after 60 years", eligibility: "Unorganized sector workers aged 18-40", link: "https://enps.nsdl.com", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 20, name: "PM Mudra Yojana (PMMY)", category: "Entrepreneurship", benefit: "Loans from ₹50,000 to ₹10 lakh for small businesses", eligibility: "Small/micro businesses seeking working capital", link: "https://mudra.org.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 21, name: "Beti Bachao Beti Padhao", category: "Women & Child", benefit: "Financial incentives + free education for girl child", eligibility: "Girl child born in targeted districts", link: "https://wcd.nic.in", state: "All India", minIncome: 0, maxIncome: 999999 },
  { id: 22, name: "PM Garib Kalyan Ann Yojana", category: "Food Security", benefit: "5 kg free food grains per person per month", eligibility: "National Food Security Act beneficiaries", link: "https://dfpd.gov.in", state: "All India", minIncome: 0, maxIncome: 150000 },
  { id: 23, name: "Rainfed Area Development Programme", category: "Agriculture", benefit: "Subsidy up to 50% for soil conservation and water harvesting", eligibility: "Farmers in notified rainfed districts", link: "https://agriculture.gov.in/rainfed", state: "All India", minIncome: 0, maxIncome: 500000 },
  { id: 24, name: "PM SVANidhi (Street Vendors)", category: "Entrepreneurship", benefit: "Working capital loan ₹10,000 to ₹50,000 at low interest", eligibility: "Urban street vendors with vending certificate", link: "https://pmsvanidhi.mohua.gov.in", state: "All India", minIncome: 0, maxIncome: 300000 },
  { id: 25, name: "Kerala Disaster Relief Fund", category: "Disaster Relief", benefit: "₹10,000 immediate relief + rehabilitation support", eligibility: "Kerala disaster-affected families", link: "https://kerala.gov.in/relief", state: "Kerala", minIncome: 0, maxIncome: 999999 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const income = parseInt(searchParams.get('income') || '0');
  const disaster = searchParams.get('disaster') || '';

  let filtered = SCHEMES_DB;

  if (category) {
    filtered = filtered.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (disaster) {
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(disaster.toLowerCase()) || 
      s.category.toLowerCase().includes('disaster')
    );
  }
  if (income > 0) {
    filtered = filtered.filter(s => income <= s.maxIncome);
  }

  return NextResponse.json({ schemes: filtered, total: filtered.length });
}

export async function POST(req: NextRequest) {
  try {
    const { query = '', income = 0, familySize = 1, state = 'All India', disaster = '' } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Filter relevant schemes first
    let relevant = SCHEMES_DB;
    if (disaster) {
      relevant = relevant.filter(s => s.category.includes('Disaster') || s.name.toLowerCase().includes(disaster.toLowerCase()));
    }
    if (income > 0) {
      relevant = relevant.filter(s => income <= s.maxIncome);
    }

    const prompt = `You are an Indian government scheme expert. 
User query: "${query}"
User income: ₹${income}/year, Family size: ${familySize}, State: ${state}
Available schemes: ${JSON.stringify(relevant.slice(0, 10).map(s => ({ name: s.name, benefit: s.benefit, eligibility: s.eligibility })))}

Based on the user's profile and query, identify the TOP 3 most relevant schemes and explain WHY they qualify.
Return a JSON array: [{ "scheme_name": "...", "eligibility_score": 85, "reason": "...", "next_step": "..." }]
Keep reasons brief and practical.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const aiRecs = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ recommendations: aiRecs, all_schemes: relevant.slice(0, 15) });
    }

    return NextResponse.json({ recommendations: [], all_schemes: relevant.slice(0, 15) });
  } catch {
    return NextResponse.json({ recommendations: [], all_schemes: SCHEMES_DB.slice(0, 15) });
  }
}
