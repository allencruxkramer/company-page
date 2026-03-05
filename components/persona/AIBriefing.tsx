'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIBriefingProps {
  companyId: string;
  companyName: string;
}

const IconStars = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  </svg>
);

export default function AIBriefing({ companyId, companyName }: AIBriefingProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function fetchBriefing() {
    setContent('');
    setLoading(true);
    setError(false);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/company/${companyId}/briefing?name=${encodeURIComponent(companyName)}`,
        { signal: abortRef.current.signal }
      );

      if (!res.ok) throw new Error('Briefing failed');
      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBriefing();
    return () => abortRef.current?.abort();
  }, [companyId, companyName]);

  function renderContent(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={i} className="text-sm font-semibold text-stone-900 mt-4 mb-1 first:mt-0">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      if (line.match(/^\*\*(.+)\*\*/)) {
        return (
          <p key={i} className="text-sm text-stone-700">
            {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
              part.startsWith('**') ? (
                <strong key={j} className="font-semibold text-stone-900">{part.replace(/\*\*/g, '')}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="text-sm text-stone-600 ml-4 list-disc">
            {line.slice(2)}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={i} className="text-sm text-stone-600 ml-4 list-decimal">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1" />;
      return (
        <p key={i} className="text-sm text-stone-600">
          {line}
        </p>
      );
    });
  }

  return (
    <Card className="mb-5 border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <span className="text-amber-500"><IconStars /></span>
            AI Meeting Briefing
          </CardTitle>
          {!loading && (
            <button
              onClick={fetchBriefing}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              <IconRefresh />
              Regenerate
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !content && (
          <div className="flex items-center gap-3 py-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
            </div>
            <span className="text-sm text-stone-500">Generating briefing...</span>
          </div>
        )}
        {error && (
          <p className="text-sm text-stone-500">
            Briefing generation failed.{' '}
            <button onClick={fetchBriefing} className="underline hover:text-stone-900">
              Try again
            </button>
          </p>
        )}
        {content && (
          <div className="prose prose-sm max-w-none">
            {renderContent(content)}
            {loading && (
              <span className="inline-block w-1 h-4 bg-amber-400 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
