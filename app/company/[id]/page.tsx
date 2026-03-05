import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCompany, getContacts, getDeals, getEngagements } from '@/lib/hubspot';
import { getEIAData } from '@/lib/eia';
import { getNews } from '@/lib/news';
import { searchSlack } from '@/lib/slack';
import { generateCompanyDescription } from '@/lib/anthropic';
import AppLayout from '@/components/AppLayout';
import { getSessionEmail } from '@/lib/session';
import CompanyHeader from '@/components/persona/CompanyHeader';
import AIBriefing from '@/components/persona/AIBriefing';
import HubSpotCard from '@/components/persona/HubSpotCard';
import EIACard from '@/components/persona/EIACard';
import SlackCard from '@/components/persona/SlackCard';
import NewsCard from '@/components/persona/NewsCard';
import { CardSkeleton, BriefingSkeleton } from '@/components/persona/CardSkeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchAllData(id: string) {
  const [companyRes, contactsRes, dealsRes, engagementsRes] = await Promise.allSettled([
    getCompany(id),
    getContacts(id),
    getDeals(id),
    getEngagements(id),
  ]);

  if (companyRes.status === 'rejected') return null;
  const company = companyRes.value;

  const [eiaRes, newsRes, slackRes] = await Promise.allSettled([
    getEIAData(company.name),
    getNews(company.name),
    searchSlack(company.name),
  ]);

  const contacts = contactsRes.status === 'fulfilled' ? contactsRes.value : [];
  const deals = dealsRes.status === 'fulfilled' ? dealsRes.value : [];
  const engagements = engagementsRes.status === 'fulfilled' ? engagementsRes.value : [];
  const eiaData = eiaRes.status === 'fulfilled' ? eiaRes.value : null;
  const news = newsRes.status === 'fulfilled' ? newsRes.value : [];
  const slackMessages = slackRes.status === 'fulfilled' ? slackRes.value : [];

  let aiDescription = '';
  try {
    aiDescription = await generateCompanyDescription(company, news);
  } catch {
    aiDescription = company.description || '';
  }

  return {
    company,
    contacts,
    deals,
    engagements,
    eiaData,
    news,
    slackMessages,
    aiDescription,
    errors: {
      eia: eiaRes.status === 'rejected',
      news: newsRes.status === 'rejected',
      slack: slackRes.status === 'rejected',
      contacts: contactsRes.status === 'rejected',
      deals: dealsRes.status === 'rejected',
    },
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  const [data, email] = await Promise.all([fetchAllData(id), getSessionEmail()]);

  if (!data) {
    notFound();
  }

  const { company, contacts, deals, engagements, eiaData, news, slackMessages, aiDescription, errors } = data;

  return (
    <AppLayout email={email}>
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
          name={company.name}
          domain={company.domain}
          industry={company.industry}
          city={company.city}
          state={company.state}
          hubspotId={id}
          aiDescription={aiDescription}
        />

        <Suspense fallback={<BriefingSkeleton />}>
          <AIBriefing companyId={id} companyName={company.name} />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Suspense fallback={<CardSkeleton rows={6} />}>
            <HubSpotCard
              contacts={contacts}
              deals={deals}
              engagements={engagements}
              error={errors.contacts && errors.deals}
            />
          </Suspense>
          <Suspense fallback={<CardSkeleton rows={6} />}>
            <EIACard data={eiaData} error={errors.eia} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <Suspense fallback={<CardSkeleton rows={4} />}>
            <SlackCard messages={slackMessages} error={errors.slack} />
          </Suspense>
          <Suspense fallback={<CardSkeleton rows={4} />}>
            <NewsCard articles={news} error={errors.news} />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
