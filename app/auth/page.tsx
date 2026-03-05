'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CruxLogo = () => (
  <svg width="100" height="32" viewBox="0 0 200 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(32, 32)" fill="#1C1917">
      <g transform="translate(0, -18)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
      <g transform="translate(12.7, -12.7)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
      <g transform="translate(12.7, 12.7)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
      <g transform="translate(0, 18)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
      <g transform="translate(-12.7, 12.7)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
      <g transform="translate(-18, 0)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
      <g transform="translate(-12.7, -12.7)"><polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"/><polygon points="0,-5 1.2,-1.2 5,0 1.2,1.2 0,5 -1.2,1.2 -5,0 -1.2,-1.2" transform="rotate(45)"/></g>
    </g>
    <text x="62" y="42" fontFamily="Inter, -apple-system, sans-serif" fontSize="32" fontWeight="500" fill="#1C1917" letterSpacing="-0.5">crux</text>
  </svg>
);

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, from }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    window.location.href = '/auth/verify';
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 w-full max-w-sm p-8">
        <div className="flex justify-center mb-8">
          <CruxLogo />
        </div>
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Sign in to Crux</h1>
        <p className="text-sm text-stone-500 mb-6">Enter your Crux email to receive a login link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@cruxclimate.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send login link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
