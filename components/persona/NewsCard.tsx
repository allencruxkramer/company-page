import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NewsArticle } from '@/lib/news';

interface NewsCardProps {
  articles: NewsArticle[];
  error?: boolean;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

const IconNewspaper = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
  </svg>
);

const IconExternalLink = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function NewsCard({ articles, error }: NewsCardProps) {
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#79716B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            Recent News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">News data unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-stone-900">
          <span className="text-stone-500"><IconNewspaper /></span>
          Recent News
          <span className="ml-auto text-xs font-normal text-stone-400">Last 30 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="text-sm text-stone-500">No recent news articles found.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((a, i) => (
              <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <p className="text-sm font-medium text-stone-900 leading-snug group-hover:underline underline-offset-2 flex items-start gap-1">
                    <span className="flex-1">{a.title}</span>
                    <span className="flex-shrink-0 mt-0.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconExternalLink />
                    </span>
                  </p>
                </a>
                {a.description && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{a.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                  <span className="font-medium text-stone-500">{a.source}</span>
                  <span className="text-stone-300">·</span>
                  <span>{formatDate(a.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
