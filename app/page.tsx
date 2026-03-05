import AppLayout from '@/components/AppLayout';
import CompanySearch from '@/components/CompanySearch';
import { getSessionEmail } from '@/lib/session';

export default async function Home() {
  const email = await getSessionEmail();
  return (
    <AppLayout email={email}>
      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Coverage &amp; Advisory</p>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-2">Company Persona</h1>
          <p className="text-sm text-stone-500 max-w-md">
            Instant meeting prep for any developer, IPP, utility, or sponsor. Aggregates HubSpot, EIA, Slack, and news into one briefing.
          </p>
        </div>

        <CompanySearch />

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'HubSpot CRM', desc: 'Contacts, deals & activity' },
            { label: 'EIA Portfolio', desc: 'Operating MW by technology' },
            { label: 'Slack', desc: 'Internal mentions & context' },
            { label: 'News', desc: 'Latest coverage via Google News' },
          ].map((item) => (
            <div key={item.label} className="p-3.5 rounded-lg border border-border bg-white">
              <p className="text-xs font-semibold text-stone-700">{item.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
