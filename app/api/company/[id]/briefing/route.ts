import { NextRequest } from 'next/server';
import { streamBriefing, buildBriefingPrompt } from '@/lib/anthropic';
import { getCompany, getContacts, getDeals, getEngagements } from '@/lib/hubspot';
import { getEIAData } from '@/lib/eia';
import { getNews } from '@/lib/news';
import { searchSlack } from '@/lib/slack';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyName = req.nextUrl.searchParams.get('name') || '';

  try {
    const [companyRes, contactsRes, dealsRes, engagementsRes, eiaRes, newsRes, slackRes] =
      await Promise.allSettled([
        getCompany(id),
        getContacts(id),
        getDeals(id),
        getEngagements(id),
        getEIAData(companyName),
        getNews(companyName),
        searchSlack(companyName),
      ]);

    const company = companyRes.status === 'fulfilled' ? companyRes.value : { id, name: companyName, domain: '', industry: '', city: '', state: '', numberofemployees: '', annualrevenue: '', description: '', hs_object_id: id };
    const contacts = contactsRes.status === 'fulfilled' ? contactsRes.value : [];
    const deals = dealsRes.status === 'fulfilled' ? dealsRes.value : [];
    const engagements = engagementsRes.status === 'fulfilled' ? engagementsRes.value : [];
    const eiaData = eiaRes.status === 'fulfilled' ? eiaRes.value : { operating: [], pipeline: [], totalOperatingMW: 0, projectCount: 0, pipelineCount: 0, totalPipelineMW: 0 };
    const news = newsRes.status === 'fulfilled' ? newsRes.value : [];
    const slackMessages = slackRes.status === 'fulfilled' ? slackRes.value : [];

    const stream = await streamBriefing({ company, contacts, deals, engagements, eiaData, news, slackMessages });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Briefing error:', err);
    return new Response('Briefing generation failed.', { status: 500 });
  }
}
