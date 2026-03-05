import { NextRequest, NextResponse } from 'next/server';
import { getNews } from '@/lib/news';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyName = req.nextUrl.searchParams.get('name');
  if (!companyName) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const articles = await getNews(companyName);
    return NextResponse.json({ articles });
  } catch (err) {
    console.error('News API error:', err);
    return NextResponse.json({ articles: [], error: 'News data unavailable' }, { status: 500 });
  }
}
