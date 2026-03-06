const HUBSPOT_BASE = 'https://api.hubapi.com';

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60000) {
    return cachedToken.token;
  }

  const refreshToken = process.env.HUBSPOT_REFRESH_TOKEN;
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('HubSpot OAuth credentials not configured');
  }

  const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`HubSpot token refresh failed: ${data.message}`);

  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function headers() {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export interface HubSpotContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface HubSpotDeal {
  id: string;
  dealname: string;
  dealstage: string;
  amount: string;
  closedate: string;
  pipeline: string;
  dealtype?: string;
}

export interface HubSpotEngagement {
  id: string;
  type: 'EMAIL' | 'NOTE' | 'MEETING';
  subject?: string;
  body?: string;
  timestamp: string;
  contactName?: string;
}

export interface HubSpotCompany {
  id: string;
  name: string;
  domain: string;
  industry: string;
  city: string;
  state: string;
  numberofemployees: string;
  annualrevenue: string;
  description: string;
  hs_object_id: string;
}

export async function searchCompanies(query: string): Promise<HubSpotCompany[]> {
  const res = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/companies/search`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            { propertyName: 'name', operator: 'CONTAINS_TOKEN', value: query },
          ],
        },
      ],
      properties: ['name', 'domain', 'industry', 'city', 'state', 'numberofemployees', 'annualrevenue', 'description'],
      limit: 10,
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`HubSpot search failed: ${res.status}`);
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    id: r.id,
    hs_object_id: r.id,
    ...r.properties,
  }));
}

export async function getCompany(id: string): Promise<HubSpotCompany> {
  const res = await fetch(
    `${HUBSPOT_BASE}/crm/v3/objects/companies/${id}?properties=name,domain,industry,city,state,numberofemployees,annualrevenue,description`,
    { headers: await headers(), next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`HubSpot getCompany failed: ${res.status}`);
  const data = await res.json();
  return { id: data.id, hs_object_id: data.id, ...data.properties };
}

export async function getContacts(companyId: string): Promise<HubSpotContact[]> {
  const assocRes = await fetch(
    `${HUBSPOT_BASE}/crm/v3/objects/companies/${companyId}/associations/contacts?limit=5`,
    { headers: await headers(), next: { revalidate: 3600 } }
  );
  if (!assocRes.ok) return [];
  const assocData = await assocRes.json();
  const contactIds: string[] = (assocData.results || []).slice(0, 5).map((r: any) => r.id);
  if (!contactIds.length) return [];

  const contacts = await Promise.all(
    contactIds.map(async (cid) => {
      const res = await fetch(
        `${HUBSPOT_BASE}/crm/v3/objects/contacts/${cid}?properties=firstname,lastname,jobtitle,email,phone`,
        { headers: await headers(), next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const d = await res.json();
      const p = d.properties;
      return {
        id: cid,
        name: [p.firstname, p.lastname].filter(Boolean).join(' ') || 'Unknown',
        title: p.jobtitle || '',
        email: p.email || '',
        phone: p.phone || '',
      };
    })
  );
  return contacts.filter(Boolean) as HubSpotContact[];
}

export async function getDeals(companyId: string): Promise<HubSpotDeal[]> {
  const assocRes = await fetch(
    `${HUBSPOT_BASE}/crm/v3/objects/companies/${companyId}/associations/deals?limit=20`,
    { headers: await headers(), next: { revalidate: 3600 } }
  );
  if (!assocRes.ok) return [];
  const assocData = await assocRes.json();
  const dealIds: string[] = (assocData.results || []).map((r: any) => r.id);
  if (!dealIds.length) return [];

  const deals = await Promise.all(
    dealIds.map(async (did) => {
      const res = await fetch(
        `${HUBSPOT_BASE}/crm/v3/objects/deals/${did}?properties=dealname,dealstage,amount,closedate,pipeline,dealtype`,
        { headers: await headers(), next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const d = await res.json();
      return { id: did, ...d.properties };
    })
  );

  return (deals.filter(Boolean) as HubSpotDeal[]).filter(
    (d) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost'
  );
}

export async function getEngagements(companyId: string): Promise<HubSpotEngagement[]> {
  const assocRes = await fetch(
    `${HUBSPOT_BASE}/crm/v3/objects/companies/${companyId}/associations/engagements?limit=50`,
    { headers: await headers(), next: { revalidate: 3600 } }
  );
  if (!assocRes.ok) return [];
  const assocData = await assocRes.json();
  const engIds: string[] = (assocData.results || []).map((r: any) => r.id);
  if (!engIds.length) return [];

  const engagements = await Promise.all(
    engIds.slice(0, 30).map(async (eid) => {
      const res = await fetch(
        `${HUBSPOT_BASE}/crm/v1/engagements/${eid}`,
        { headers: await headers(), next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const d = await res.json();
      const eng = d.engagement;
      const meta = d.metadata;
      const assocContacts = d.associations?.contactIds || [];

      let contactName: string | undefined;
      if (assocContacts[0]) {
        try {
          const cr = await fetch(
            `${HUBSPOT_BASE}/crm/v3/objects/contacts/${assocContacts[0]}?properties=firstname,lastname`,
            { headers: await headers(), next: { revalidate: 3600 } }
          );
          if (cr.ok) {
            const cd = await cr.json();
            contactName = [cd.properties.firstname, cd.properties.lastname].filter(Boolean).join(' ');
          }
        } catch {}
      }

      return {
        id: eid,
        type: eng.type as 'EMAIL' | 'NOTE' | 'MEETING',
        subject: meta?.subject || meta?.title || '',
        body: meta?.body || meta?.text || '',
        timestamp: new Date(eng.createdAt || eng.timestamp || Date.now()).toISOString(),
        contactName,
      };
    })
  );

  const valid = engagements.filter(Boolean) as HubSpotEngagement[];
  valid.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const emails = valid.filter((e) => e.type === 'EMAIL').slice(0, 3);
  const notes = valid.filter((e) => e.type === 'NOTE').slice(0, 3);
  const meetings = valid.filter((e) => e.type === 'MEETING').slice(0, 3);

  return [...emails, ...notes, ...meetings];
}
