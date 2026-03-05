'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  city: string;
  state: string;
}

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function CompanySearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/company/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(company: Company) {
    setOpen(false);
    setQuery(company.name);
    router.push(`/company/${company.id}`);
  }

  function handlePreview() {
    if (query.trim().length < 2) return;
    setOpen(false);
    router.push(`/company/preview?name=${encodeURIComponent(query.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (results.length > 0) {
        handleSelect(results[0]);
      } else if (query.trim().length >= 2) {
        handlePreview();
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
          <IconSearch />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a company (e.g. Nexamp, DESRI, Ormat)..."
          className="w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 transition-colors"
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : query.length >= 2 ? (
          <button
            onClick={handlePreview}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-700 transition-colors"
            title="Preview with public data (EIA + News)"
          >
            <IconArrowRight />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className="w-full text-left px-4 py-2.5 hover:bg-stone-50 transition-colors flex items-center justify-between group border-b border-stone-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-stone-900">{company.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {[company.industry, company.city, company.state].filter(Boolean).join(' · ')}
                </p>
              </div>
              {company.domain && (
                <span className="text-xs text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {company.domain}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handlePreview}
            className="w-full text-left px-4 py-2.5 hover:bg-stone-50 transition-colors flex items-center gap-2 text-xs text-stone-500 border-t border-stone-200"
          >
            <span className="text-stone-400"><IconArrowRight /></span>
            Preview &ldquo;{query}&rdquo; with public data only (EIA + News)
          </button>
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-2.5 text-xs text-stone-400">
            No HubSpot results for &ldquo;{query}&rdquo;
          </div>
          <button
            onClick={handlePreview}
            className="w-full text-left px-4 py-2.5 hover:bg-stone-50 transition-colors border-t border-stone-200 flex items-center gap-2 text-sm font-medium text-stone-900"
          >
            <span className="text-stone-500"><IconArrowRight /></span>
            Preview &ldquo;{query}&rdquo; with public data (EIA + News)
          </button>
        </div>
      )}
    </div>
  );
}
