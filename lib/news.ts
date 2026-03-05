export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
}

// Google News RSS — free, no API key, works server-side, updated in real time
export async function getNews(companyName: string): Promise<NewsArticle[]> {
  try {
    const query = encodeURIComponent(`"${companyName}" energy`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CruxPersona/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const xml = await res.text();

    return parseRSSFeed(xml).slice(0, 8);
  } catch {
    return [];
  }
}

function parseRSSFeed(xml: string): NewsArticle[] {
  const items: NewsArticle[] = [];

  // Extract all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link');
    const pubDate = extractTag(item, 'pubDate');
    const description = extractTag(item, 'description');
    const source = extractTag(item, 'source');

    if (!title || !link) continue;

    // Google News wraps article URLs in a redirect — the actual URL is in the link tag
    const cleanUrl = link.replace(/^https:\/\/news\.google\.com\/rss\/articles\//, '');

    // Parse ISO date from pubDate (e.g., "Thu, 05 Mar 2026 12:00:00 GMT")
    let publishedAt = '';
    try {
      publishedAt = pubDate ? new Date(pubDate).toISOString() : '';
    } catch {
      publishedAt = pubDate || '';
    }

    // Strip HTML from description
    const cleanDesc = (description || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    items.push({
      title: cleanTitle(title),
      source: source || extractSourceFromTitle(title),
      url: link,
      publishedAt,
      description: cleanDesc,
    });
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = regex.exec(xml);
  if (!match) return '';
  return (match[1] || match[2] || '').trim();
}

function cleanTitle(title: string): string {
  // Google News titles often end with " - Source Name"
  return title
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractSourceFromTitle(title: string): string {
  // "Article Title - Source Name" format
  const parts = title.split(' - ');
  return parts.length > 1 ? parts[parts.length - 1].trim() : '';
}
