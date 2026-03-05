import { NextRequest, NextResponse } from 'next/server';
import { searchSlack } from '@/lib/slack';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyName = req.nextUrl.searchParams.get('name');
  if (!companyName) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const messages = await searchSlack(companyName);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Slack API error:', err);
    return NextResponse.json({ messages: [], error: 'Slack data unavailable' }, { status: 500 });
  }
}
