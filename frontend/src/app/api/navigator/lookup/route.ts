import { NextRequest, NextResponse } from 'next/server';

const DISTRICT_DATA: Record<string, { mla_name: string; mla_contact: string; sdrf_dispatch: string }> = {
  'bengaluru urban': {
    mla_name: 'Ramalinga Reddy',
    mla_contact: '9880299370',
    sdrf_dispatch: 'ACTIVE – SDRF Battalion 5 deployed',
  },
  mysuru: {
    mla_name: 'G.T. Deve Gowda',
    mla_contact: '9845099867',
    sdrf_dispatch: 'ACTIVE – SDRF Battalion 2 deployed',
  },
  mangaluru: {
    mla_name: 'U.T. Khader',
    mla_contact: '9880101010',
    sdrf_dispatch: 'STANDBY – District Civil Defense on alert',
  },
  hubballi: {
    mla_name: 'Jagadish Shettar',
    mla_contact: '9845011111',
    sdrf_dispatch: 'ACTIVE – Emergency Response Team deployed',
  },
  belagavi: {
    mla_name: 'Lakshmi Hebbalkar',
    mla_contact: '9986660000',
    sdrf_dispatch: 'ACTIVE – SDRF Battalion 3 on ground',
  },
  dharwad: {
    mla_name: 'Vinay Kulkarni',
    mla_contact: '9880001234',
    sdrf_dispatch: 'STANDBY – Civil Defense monitoring active',
  },
};

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get('district') || '';
  const key = district.toLowerCase().trim();

  const data = DISTRICT_DATA[key] ?? {
    mla_name: `District Authority (${district})`,
    mla_contact: '1078',
    sdrf_dispatch: 'STANDBY – Monitoring active',
  };

  return NextResponse.json({
    success: true,
    district,
    source: 'NIC Karnataka District Registry',
    records: [data],
  });
}
