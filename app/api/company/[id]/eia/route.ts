import { NextRequest, NextResponse } from 'next/server';
import { getEIAData } from '@/lib/eia';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyName = req.nextUrl.searchParams.get('name');
  if (!companyName) {
    return NextResponse.json({ operating: [], pipeline: [], totalOperatingMW: 0, pipelineCount: 0, totalPipelineMW: 0 });
  }

  try {
    const data = await getEIAData(companyName);
    return NextResponse.json(data);
  } catch (err) {
    console.error('EIA API error:', err);
    return NextResponse.json({ error: 'EIA data unavailable' }, { status: 500 });
  }
}
