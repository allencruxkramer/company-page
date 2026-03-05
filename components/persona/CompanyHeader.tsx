interface CompanyHeaderProps {
  name: string;
  domain?: string;
  industry?: string;
  city?: string;
  state?: string;
  hubspotId: string;
  description?: string;
  aiDescription?: string;
}

const PERSONA_MAP: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  'clean energy': { label: 'Developer', dot: '#12B76A', text: '#027A48', bg: '#ECFDF3' },
  'solar': { label: 'Developer', dot: '#12B76A', text: '#027A48', bg: '#ECFDF3' },
  'wind energy': { label: 'Developer', dot: '#12B76A', text: '#027A48', bg: '#ECFDF3' },
  'renewables': { label: 'IPP', dot: '#2E90FA', text: '#175CD3', bg: '#EFF8FF' },
  'utilities': { label: 'Utility', dot: '#7A5AF8', text: '#5925DC', bg: '#F4F3FF' },
  'utilities - electric': { label: 'Utility', dot: '#7A5AF8', text: '#5925DC', bg: '#F4F3FF' },
  'private equity': { label: 'Sponsor', dot: '#FDB022', text: '#B54708', bg: '#FFFAEB' },
  'manufacturing': { label: 'Manufacturer', dot: '#FDB022', text: '#B54708', bg: '#FFFAEB' },
};

function getPersonaBadge(industry?: string) {
  if (!industry) return { label: 'Developer', dot: '#12B76A', text: '#027A48', bg: '#ECFDF3' };
  const key = Object.keys(PERSONA_MAP).find((k) => industry.toLowerCase().includes(k));
  return key ? PERSONA_MAP[key] : { label: 'Energy Company', dot: '#79716B', text: '#44403C', bg: '#F5F5F4' };
}

export default function CompanyHeader({
  name,
  domain,
  industry,
  city,
  state,
  hubspotId,
  description,
  aiDescription,
}: CompanyHeaderProps) {
  const persona = getPersonaBadge(industry);
  const location = [city, state].filter(Boolean).join(', ');

  return (
    <div className="bg-white border border-border rounded-lg p-5 mb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#79716B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold text-stone-900 tracking-tight">{name}</h1>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: persona.bg, color: persona.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: persona.dot }} />
                {persona.label}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-1 text-xs text-stone-500 flex-wrap">
              {industry && <span>{industry}</span>}
              {location && (
                <>
                  <span className="text-stone-300">·</span>
                  <span>{location}</span>
                </>
              )}
              {domain && (
                <>
                  <span className="text-stone-300">·</span>
                  <a
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-stone-900 transition-colors underline underline-offset-2"
                  >
                    {domain}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {hubspotId && (
          <a
            href={`https://app.hubspot.com/contacts/crux/company/${hubspotId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-stone-700 border border-stone-300 rounded-md hover:bg-stone-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.164 7.27V5.116a2.251 2.251 0 1 0-2.25 0V7.27A5.626 5.626 0 0 0 13.5 12.48v.055l-3.352 4.199a3.75 3.75 0 1 0 2.52 1.248l2.832-3.547a5.626 5.626 0 0 0 5.04-5.165V7.27a2.251 2.251 0 1 0-2.376 0Z" />
            </svg>
            View in HubSpot
          </a>
        )}
      </div>

      {(aiDescription || description) && (
        <p className="mt-4 text-sm text-stone-500 leading-relaxed border-t border-border pt-4">
          {aiDescription || description}
        </p>
      )}
    </div>
  );
}
