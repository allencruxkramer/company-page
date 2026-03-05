import { NextRequest, NextResponse } from 'next/server';
import { getCompany, getContacts, getDeals, getEngagements } from '@/lib/hubspot';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const [company, contacts, deals, engagements] = await Promise.allSettled([
      getCompany(id),
      getContacts(id),
      getDeals(id),
      getEngagements(id),
    ]);

    return NextResponse.json({
      company: company.status === 'fulfilled' ? company.value : null,
      contacts: contacts.status === 'fulfilled' ? contacts.value : [],
      deals: deals.status === 'fulfilled' ? deals.value : [],
      engagements: engagements.status === 'fulfilled' ? engagements.value : [],
    });
  } catch (err) {
    console.error('HubSpot API error:', err);
    return NextResponse.json({ error: 'HubSpot data unavailable' }, { status: 500 });
  }
}
