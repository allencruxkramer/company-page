'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconHelpCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <path d="M12 17h.01"/>
  </svg>
);

const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function Sidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const isPersonaActive = pathname === '/' || pathname.startsWith('/company');

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col border-r border-border bg-background sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link href="/">
          <CruxLogo />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <div>
          <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">Tools</p>
          <Link
            href="/"
            className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
              isPersonaActive
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <IconUsers />
            Company Persona
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
          <IconHelpCircle />
          Resources
        </button>
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
          <IconFile />
          Documents
        </button>
      </div>

      {/* User Profile */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
          <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {email ? email.slice(0, 2).toUpperCase() : '??'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-900 truncate">{email ?? 'Signed in'}</p>
            <p className="text-xs text-stone-500 truncate">Crux Climate</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
