import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/hubspot';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const companies = await searchCompanies(q);
    return NextResponse.json({ results: companies });
  } catch (err) {
    console.error('Company search error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
