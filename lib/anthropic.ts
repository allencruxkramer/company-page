import Anthropic from '@anthropic-ai/sdk';
import type { HubSpotCompany, HubSpotContact, HubSpotDeal, HubSpotEngagement } from './hubspot';
import type { EIAData } from './eia';
import type { NewsArticle } from './news';
import type { SlackMessage } from './slack';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const ADVISORY_COMPETITORS = [
  'Marathon Capital',
  'CRC-IB',
  'Citizens',
  'CohnReznick',
  'PEI',
  'Power Educators',
  'Javelin Energy',
];

export async function generateCompanyDescription(
  company: HubSpotCompany,
  news: NewsArticle[]
): Promise<string> {
  const newsText = news
    .slice(0, 5)
    .map((a) => `- ${a.title}: ${a.description}`)
    .join('\n');

  const prompt = `Based on the following information about ${company.name}, write a concise 3-5 sentence company description covering: what the company does, their business model, known equity backers or PE sponsors, and any identified financing partners (tax equity investors, lenders, advisors).

Company info:
- Name: ${company.name}
- Industry: ${company.industry || 'Energy'}
- Employees: ${company.numberofemployees || 'Unknown'}
- Description: ${company.description || 'N/A'}

Recent news:
${newsText || 'No recent news available.'}

Write only the description paragraph, no headers or labels.`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return (msg.content[0] as any).text || '';
}

export interface BriefingContext {
  company: HubSpotCompany;
  contacts: HubSpotContact[];
  deals: HubSpotDeal[];
  engagements: HubSpotEngagement[];
  eiaData: EIAData;
  news: NewsArticle[];
  slackMessages: SlackMessage[];
}

export function buildBriefingPrompt(ctx: BriefingContext): string {
  const { company, contacts, deals, engagements, eiaData, news, slackMessages } = ctx;

  const hubspotSummary = `
Company: ${company.name}
Industry: ${company.industry || 'N/A'}
Employees: ${company.numberofemployees || 'N/A'}
Revenue: ${company.annualrevenue || 'N/A'}
Location: ${company.city || ''} ${company.state || ''}

Key Contacts: ${contacts.map((c) => `${c.name} (${c.title})`).join(', ') || 'None found'}

Open Deals: ${
    deals.length
      ? deals
          .map((d) => `${d.dealname} — Stage: ${d.dealstage}, Amount: $${d.amount || 'N/A'}, Close: ${d.closedate || 'N/A'}`)
          .join('\n')
      : 'No open deals'
  }

Recent Engagements (last 3 of each type):
${
  engagements
    .map(
      (e) =>
        `[${e.type}] ${e.subject || '(no subject)'} — ${new Date(e.timestamp).toLocaleDateString()} ${e.contactName ? `(${e.contactName})` : ''}\n${e.body ? e.body.slice(0, 200) : ''}`
    )
    .join('\n---\n') || 'None'
}`;

  const eiaSummary = `
Total Operating MW: ${eiaData.totalOperatingMW.toFixed(1)} MW
Pipeline Projects: ${eiaData.pipelineCount} projects, ${eiaData.totalPipelineMW.toFixed(1)} MW total

Top Operating Projects:
${
  eiaData.operating
    .sort((a, b) => b.capacityMW - a.capacityMW)
    .slice(0, 5)
    .map((g) => `  - ${g.plantName} (${g.state}): ${g.capacityMW} MW ${g.technology}`)
    .join('\n') || '  None found in EIA database'
}`;

  const newsSummary = news
    .slice(0, 5)
    .map((a) => `- [${a.source}] ${a.title}: ${a.description}`)
    .join('\n') || 'No recent news';

  const slackSummary = slackMessages
    .slice(0, 5)
    .map((m) => `- [#${m.channel}] ${m.username}: ${m.text.slice(0, 150)}`)
    .join('\n') || 'No recent Slack mentions';

  return `You are a strategic briefing assistant for Crux Capital, the capital platform for the clean economy. Given the following company data, generate a concise meeting prep briefing for the Crux coverage team.

Include:
1. **Persona Classification** — Developer / IPP / Utility / Sponsor / Manufacturer (pick the most likely)
2. **Capital Needs Summary** — Inferred from deal stage, project portfolio, employee size
3. **Relevant Crux Solutions** — From: TTCs (Transferable Tax Credits), Tax Equity, Debt/DCM, Advisory, Intelligence Platform
4. **3 Key Talking Points** — Personalized to this company's situation
5. **Open Items / Follow-ups** — From HubSpot activity log
6. **Advisory Target Flag** — Has this company had any publicly announced transactions with: ${ADVISORY_COMPETITORS.join(', ')}? Check the recent news for mentions. If yes, surface the transaction(s) and flag with: "This company has worked with [competitor] — strong advisory target for Crux."

---
HubSpot Data:
${hubspotSummary}

EIA Project Portfolio:
${eiaSummary}

Recent News (last 30 days):
${newsSummary}

Recent Slack Mentions:
${slackSummary}

Advisory competitors to flag: ${ADVISORY_COMPETITORS.join(', ')}
---

Write the briefing in a clean, scannable format using bold headers for each section. Be direct and actionable.`;
}

export async function streamBriefing(ctx: BriefingContext) {
  const prompt = buildBriefingPrompt(ctx);

  return getClient().messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });
}
