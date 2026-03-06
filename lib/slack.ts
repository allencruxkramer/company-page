export interface SlackMessage {
  text: string;
  channel: string;
  username: string;
  timestamp: string;
  permalink: string;
}

export async function searchSlack(companyName: string): Promise<SlackMessage[]> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return [];

  const d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const dateStr = d.toISOString().split('T')[0];
  const query = `"${companyName}" after:${dateStr}`;

  const res = await fetch(
    `https://slack.com/api/search.messages?query=${encodeURIComponent(query)}&count=10&sort=timestamp`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  if (!data.ok) return [];

  const messages = data.messages?.matches || [];
  return messages.map((m: any) => ({
    text: m.text || '',
    channel: m.channel?.name || m.channel?.id || 'unknown',
    username: m.username || m.user || 'unknown',
    timestamp: m.ts ? new Date(parseFloat(m.ts) * 1000).toISOString() : new Date().toISOString(),
    permalink: m.permalink || '',
  }));
}
