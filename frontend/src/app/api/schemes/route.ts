import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    schemes: [
      {
        id: 'cyclone-1',
        title: 'Cyclone Biparjoy Relief Fund',
        category: 'Natural Disaster',
        description:
          'Ex-gratia compensation of ₹10,000 for flood-affected families. Additional ₹5,000 for loss of agricultural equipment.',
        eligibility:
          'Families in declared flood-affected taluks with Aadhaar-linked bank account',
        link: 'https://ndma.gov.in',
        link_text: 'Apply on NDMA Portal',
      },
      {
        id: 'relief-2',
        title: 'State Disaster Relief Fund (SDRF) 2024',
        category: 'Emergency Relief',
        description:
          'Immediate relief of ₹3,500 per family for temporary shelter, food, and drinking water during declared disasters.',
        eligibility: 'BPL & AAY ration card holders in disaster-declared districts',
        link: 'https://dpar.kar.nic.in',
        link_text: 'Karnataka DPAR Portal',
      },
      {
        id: 'agri-3',
        title: 'PM Fasal Bima Yojana (PMFBY)',
        category: 'Agricultural Support',
        description:
          'Crop insurance providing financial support to farmers suffering crop loss due to natural calamities, pests & diseases.',
        eligibility:
          'All farmers including sharecroppers and tenant farmers growing notified crops',
        link: 'https://pmfby.gov.in',
        link_text: 'Apply on PMFBY Portal',
      },
      {
        id: 'health-4',
        title: 'Ayushman Bharat PM-JAY',
        category: 'Medical Relief',
        description:
          'Health coverage of up to ₹5 lakh per family per year for secondary and tertiary hospitalization for disaster-related injuries.',
        eligibility: 'Families listed in SECC database and BPL certificate holders',
        link: 'https://pmjay.gov.in',
        link_text: 'Check Eligibility on PM-JAY',
      },
      {
        id: 'housing-5',
        title: 'PMAY Gramin Housing Grant',
        category: 'Housing Support',
        description:
          'Financial assistance for reconstruction of a fully damaged house. ₹1.2 lakh in plain areas, ₹1.3 lakh in hilly/difficult areas.',
        eligibility: 'Houseless families or those with kuchha houses as per SECC-2011 data',
        link: 'https://pmayg.nic.in',
        link_text: 'Apply on PMAYG Portal',
      },
    ],
  });
}
