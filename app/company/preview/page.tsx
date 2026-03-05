import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getEIAData } from '@/lib/eia';
import { getNews } from '@/lib/news';
import AppLayout from '@/components/AppLayout';
import CompanyHeader from '@/components/persona/CompanyHeader';
import EIACard from '@/components/persona/EIACard';
import NewsCard from '@/components/persona/NewsCard';
import HubSpotCard from '@/components/persona/HubSpotCard';
import SlackCard from '@/components/persona/SlackCard';
import { CardSkeleton } from '@/components/persona/CardSkeleton';

interface PageProps {
  searchParams: Promise<{ name?: string }>;
}

export default async function PreviewPage({ searchParams }: PageProps) {
  const { name } = await searchParams;
  if (!name) redirect('/');

  const [eiaRes, newsRes] = await Promise.allSettled([
    getEIAData(name),
    getNews(name),
  ]);

  const eiaData = eiaRes.status === 'fulfilled' ? eiaRes.value : null;
  const news = newsRes.status === 'fulfilled' ? newsRes.value : [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-5">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to search
          </a>
        </div>

        <CompanyHeader
          name={name}
          hubspotId=""
          aiDescription={`Preview mode — searching public data sources for "${name}". Add API keys to enable HubSpot CRM data, Slack mentions, and AI briefing.`}
        />

        {/* AI Briefing placeholder */}
        <div className="border border-border rounded-lg p-5 mb-5 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">AI Meeting Briefing</p>
          <p className="text-sm text-stone-500">
            Add <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">ANTHROPIC_API_KEY</code> to{' '}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> to enable streaming AI briefings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Suspense fallback={<CardSkeleton rows={4} />}>
            <HubSpotCard contacts={[]} deals={[]} engagements={[]} unavailable />
          </Suspense>
          <Suspense fallback={<CardSkeleton rows={6} />}>
            <EIACard data={eiaData} error={eiaRes.status === 'rejected'} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <Suspense fallback={<CardSkeleton rows={4} />}>
            <SlackCard messages={[]} unavailable />
          </Suspense>
          <Suspense fallback={<CardSkeleton rows={4} />}>
            <NewsCard articles={news} error={newsRes.status === 'rejected'} />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
