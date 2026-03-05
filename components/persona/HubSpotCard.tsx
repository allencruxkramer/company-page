import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HubSpotContact, HubSpotDeal, HubSpotEngagement } from '@/lib/hubspot';

interface HubSpotCardProps {
  contacts: HubSpotContact[];
  deals: HubSpotDeal[];
  engagements: HubSpotEngagement[];
  error?: boolean;
  unavailable?: boolean;
}

function formatAmount(amount: string) {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount || '—';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function formatDate(d: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconNote = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M10 16s.8 1 2 1 2-1 2-1"/><path d="M8 13h0"/><path d="M16 13h0"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);

const ENGAGEMENT_ICONS: Record<string, React.ReactNode> = {
  EMAIL: <IconMail />,
  NOTE: <IconNote />,
  MEETING: <IconCalendar />,
};

const STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  appointmentscheduled: { bg: '#EFF8FF', text: '#175CD3' },
  qualifiedtobuy: { bg: '#EEF4FF', text: '#3538CD' },
  presentationscheduled: { bg: '#F4F3FF', text: '#5925DC' },
  decisionmakerboughtin: { bg: '#F4F3FF', text: '#5925DC' },
  contractsent: { bg: '#FFFAEB', text: '#B54708' },
  closedwon: { bg: '#ECFDF3', text: '#027A48' },
  closedlost: { bg: '#FEF3F2', text: '#D92D20' },
};

function stageLabel(stage: string) {
  return stage
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

const HubSpotIcon = () => (
  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.164 7.27V5.116a2.251 2.251 0 1 0-2.25 0V7.27A5.626 5.626 0 0 0 13.5 12.48v.055l-3.352 4.199a3.75 3.75 0 1 0 2.52 1.248l2.832-3.547a5.626 5.626 0 0 0 5.04-5.165V7.27a2.251 2.251 0 1 0-2.376 0Z" />
  </svg>
);

export default function HubSpotCard({ contacts, deals, engagements, error, unavailable }: HubSpotCardProps) {
  if (unavailable) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HubSpotIcon />
            HubSpot CRM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">
            N/A — add <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">HUBSPOT_ACCESS_TOKEN</code> to enable CRM data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#79716B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            HubSpot CRM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">HubSpot data unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <HubSpotIcon />
          HubSpot CRM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Contacts */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Key Contacts</p>
          {contacts.length === 0 ? (
            <p className="text-sm text-stone-500">No contacts found</p>
          ) : (
            <div className="space-y-2.5">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconUser />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 leading-tight">{c.name}</p>
                    {c.title && <p className="text-xs text-stone-500">{c.title}</p>}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-xs text-stone-900 underline underline-offset-2 hover:text-stone-600 truncate block">
                        {c.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deals */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Open Deals & Listings</p>
          {deals.length === 0 ? (
            <p className="text-sm text-stone-500">No open deals</p>
          ) : (
            <div className="space-y-2">
              {deals.map((d) => {
                const style = STAGE_STYLES[d.dealstage] || { bg: '#F5F5F4', text: '#44403C' };
                return (
                  <div key={d.id} className="p-2.5 rounded-lg bg-stone-50 border border-border">
                    <p className="text-sm font-medium text-stone-900 leading-tight">{d.dealname}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.text }} />
                        {stageLabel(d.dealstage)}
                      </span>
                      {d.amount && (
                        <span className="text-xs text-stone-500">{formatAmount(d.amount)}</span>
                      )}
                      {d.closedate && (
                        <span className="text-xs text-stone-400">Close: {formatDate(d.closedate)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Engagements */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Recent Activity</p>
          {engagements.length === 0 ? (
            <p className="text-sm text-stone-500">No recent activity</p>
          ) : (
            <div className="space-y-2.5">
              {engagements.map((e) => (
                <div key={e.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-stone-500">
                    {ENGAGEMENT_ICONS[e.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-xs font-medium text-stone-900 truncate">{e.subject || `${e.type} activity`}</p>
                      <p className="text-xs text-stone-400 flex-shrink-0">{formatDate(e.timestamp)}</p>
                    </div>
                    {e.contactName && (
                      <p className="text-xs text-stone-500">with {e.contactName}</p>
                    )}
                    {e.body && (
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{e.body}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
