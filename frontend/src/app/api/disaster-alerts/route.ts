import { NextResponse } from 'next/server';

// India Disaster Historical Data + Simulated Live Feed
const HISTORICAL_DATA = {
  cyclones: [
    { id: 'cy1', name: 'Cyclone Fengal', year: 2024, state: 'Tamil Nadu, Puducherry', severity: 'CRITICAL', casualties: 38, displaced: 180000, description: 'Severe cyclonic storm made landfall near Puducherry. Heavy rainfall caused severe flooding in Tamil Nadu and Puducherry.' },
    { id: 'cy2', name: 'Cyclone Michaung', year: 2023, state: 'Andhra Pradesh, Tamil Nadu', severity: 'HIGH', casualties: 21, displaced: 500000, description: 'Category 1 cyclone caused massive flooding in Chennai and Andhra Pradesh coastal districts.' },
    { id: 'cy3', name: 'Cyclone Biparjoy', year: 2023, state: 'Gujarat', severity: 'HIGH', casualties: 3, displaced: 175000, description: 'Extremely Severe Cyclonic Storm hit Saurashtra-Kutch coast of Gujarat.' },
    { id: 'cy4', name: 'Cyclone Yaas', year: 2021, state: 'Odisha, West Bengal', severity: 'CRITICAL', casualties: 19, displaced: 2000000, description: 'Very Severe Cyclonic Storm caused massive destruction along Odisha and West Bengal coast.' },
    { id: 'cy5', name: 'Cyclone Amphan', year: 2020, state: 'West Bengal, Odisha', severity: 'CRITICAL', casualties: 128, displaced: 4900000, description: 'Super Cyclonic Storm — most powerful cyclone to hit West Bengal since 1999. ₹1 lakh crore in damages.' },
    { id: 'cy6', name: 'Cyclone Gaja', year: 2018, state: 'Tamil Nadu', severity: 'HIGH', casualties: 63, displaced: 800000, description: 'Severe Cyclonic Storm devastated Nagapattinam, Thanjavur, Tiruvarur districts.' },
    { id: 'cy7', name: 'Cyclone Ockhi', year: 2017, state: 'Kerala, Tamil Nadu', severity: 'HIGH', casualties: 245, displaced: 123000, description: 'Extremely severe storm caused massive loss of life among fishermen in Kerala and Tamil Nadu.' },
  ],
  floods: [
    { id: 'fl1', name: 'Wayanad Landslide & Floods', year: 2024, state: 'Kerala', severity: 'CRITICAL', casualties: 400, displaced: 50000, description: 'Catastrophic landslides in Mundakkai-Chooralmala area of Wayanad killed hundreds. Most devastating disaster in Kerala history.' },
    { id: 'fl2', name: 'Himachal Pradesh Flash Floods', year: 2023, state: 'Himachal Pradesh', severity: 'HIGH', casualties: 340, displaced: 200000, description: 'Severe monsoon floods and landslides across Shimla, Mandi, Kullu. Roads and infrastructure severely damaged.' },
    { id: 'fl3', name: 'Assam Floods', year: 2022, state: 'Assam', severity: 'HIGH', casualties: 193, displaced: 5500000, description: 'Severe annual floods affected 33 districts. Kaziranga National Park submerged, wildlife casualties.' },
    { id: 'fl4', name: 'Kerala Floods', year: 2018, state: 'Kerala', severity: 'CRITICAL', casualties: 483, displaced: 1500000, description: 'Worst floods in Kerala in 100 years. Entire state declared disaster zone. ₹40,000 crore in damages.' },
    { id: 'fl5', name: 'Bihar Floods', year: 2019, state: 'Bihar', severity: 'HIGH', casualties: 481, displaced: 8000000, description: 'Annual floods affected 13 districts. North Bihar worst hit. Embankments breached at multiple points.' },
    { id: 'fl6', name: 'Chennai Floods', year: 2015, state: 'Tamil Nadu', severity: 'CRITICAL', casualties: 500, displaced: 1800000, description: 'Worst flooding in Chennai in 100 years. Entire city paralyzed for weeks. ₹15,000 crore damages.' },
    { id: 'fl7', name: 'Uttarakhand Flash Floods', year: 2021, state: 'Uttarakhand', severity: 'HIGH', casualties: 70, displaced: 15000, description: 'Glacier burst triggered flash floods in Chamoli district. Hydro power projects severely damaged.' },
  ],
  earthquakes: [
    { id: 'eq1', name: 'Joshimath Subsidence Crisis', year: 2023, state: 'Uttarakhand', severity: 'HIGH', casualties: 0, displaced: 25000, description: 'Massive land subsidence caused cracks in 700+ buildings. Government declared emergency evacuation.' },
    { id: 'eq2', name: 'Nepal-India Border Earthquake', year: 2023, state: 'Bihar, UP', severity: 'MEDIUM', casualties: 6, displaced: 1000, description: '5.6 magnitude earthquake felt across North India. Minor damage reported in border districts.' },
    { id: 'eq3', name: 'Manipur Earthquake', year: 2023, state: 'Manipur', severity: 'HIGH', casualties: 1, displaced: 5000, description: '6.8 magnitude earthquake hit Manipur. Significant structural damage in Churachandpur district.' },
    { id: 'eq4', name: 'Bhuj Earthquake Anniversary Zone Risk', year: 2001, state: 'Gujarat', severity: 'HIGH', casualties: 20085, displaced: 600000, description: 'Historic reference: 7.7 magnitude earthquake killed 20,000+. Gujarat still in seismic zone IV.' },
    { id: 'eq5', name: 'Sikkim Earthquake', year: 2011, state: 'Sikkim', severity: 'HIGH', casualties: 111, displaced: 20000, description: '6.9 magnitude earthquake caused landslides across North Sikkim. Roads blocked for weeks.' },
  ],
  rainstorms: [
    { id: 'rs1', name: 'Mumbai Extreme Rainfall', year: 2024, state: 'Maharashtra', severity: 'HIGH', casualties: 24, displaced: 80000, description: 'Unprecedented rainfall (294mm/day) in Mumbai. Flooding in low-lying areas. IMD issued red alert.' },
    { id: 'rs2', name: 'Bengaluru Urban Flooding', year: 2022, state: 'Karnataka', severity: 'HIGH', casualties: 15, displaced: 30000, description: 'Record rainfall caused severe urban flooding in tech hubs. IT companies relocated staff. ₹8,000 crore damages.' },
    { id: 'rs3', name: 'Uttarakhand Cloudburst', year: 2022, state: 'Uttarakhand', severity: 'CRITICAL', casualties: 90, displaced: 40000, description: 'Series of cloudbursts triggered landslides. Char Dham Yatra suspended. Multiple villages cut off.' },
    { id: 'rs4', name: 'Delhi NCR Flash Flood', year: 2023, state: 'Delhi', severity: 'HIGH', casualties: 17, displaced: 25000, description: 'Yamuna river reached highest level since 1978. Yamuna floodplain evacuated. Major roads submerged.' },
    { id: 'rs5', name: 'Rajasthan Cloudburst', year: 2023, state: 'Rajasthan', severity: 'MEDIUM', casualties: 22, displaced: 10000, description: 'Unexpected heavy rains in desert state caused flash floods in Jaisalmer, Barmer districts.' },
  ],
};

// Live Alert Feed (current/upcoming)
const LIVE_ALERTS = [
  { id: 'la1', type: 'CYCLONE', title: 'Cyclone Watch — Bay of Bengal', severity: 'HIGH', states: ['Andhra Pradesh', 'Odisha', 'Tamil Nadu'], message: 'Low pressure system forming in Bay of Bengal. IMD monitoring. Citizens in coastal areas advised to remain vigilant.', time: new Date(Date.now() - 3600000).toISOString(), source: 'IMD' },
  { id: 'la2', type: 'FLOOD', title: 'Flood Alert — Assam & Meghalaya', severity: 'HIGH', states: ['Assam', 'Meghalaya'], message: 'Pre-monsoon heavy rains causing river levels to rise. NDRF teams deployed. Orange alert in 12 districts.', time: new Date(Date.now() - 7200000).toISOString(), source: 'NDMA' },
  { id: 'la3', type: 'RAINSTORM', title: 'Red Alert — Mumbai MMR', severity: 'CRITICAL', states: ['Maharashtra'], message: 'IMD issues Red Alert for Mumbai. 200mm rainfall expected in 24 hours. Avoid travel, low-lying areas at risk.', time: new Date(Date.now() - 1800000).toISOString(), source: 'IMD Mumbai' },
  { id: 'la4', type: 'EARTHQUAKE', title: 'Seismic Activity — Andaman Islands', severity: 'MEDIUM', states: ['Andaman & Nicobar'], message: '4.8 magnitude earthquake detected near Andaman Islands. No tsunami warning issued. INCOIS monitoring.', time: new Date(Date.now() - 14400000).toISOString(), source: 'INCOIS' },
  { id: 'la5', type: 'RAINSTORM', title: 'Heavy Rain Alert — Kerala', severity: 'HIGH', states: ['Kerala'], message: 'Yellow alert issued for Wayanad, Idukki, Kozhikode. Heavy to very heavy rainfall expected. Landslide risk zones identified.', time: new Date(Date.now() - 900000).toISOString(), source: 'Kerala SEOC' },
];

export async function GET() {
  return NextResponse.json({
    liveAlerts: LIVE_ALERTS,
    historical: HISTORICAL_DATA,
    lastUpdated: new Date().toISOString(),
    totalEvents: {
      cyclones: HISTORICAL_DATA.cyclones.length,
      floods: HISTORICAL_DATA.floods.length,
      earthquakes: HISTORICAL_DATA.earthquakes.length,
      rainstorms: HISTORICAL_DATA.rainstorms.length,
    }
  });
}
