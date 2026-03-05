export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 w-full max-w-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-stone-900 mb-2">Check your email</h1>
        <p className="text-sm text-stone-500">
          We sent a login link to your Crux email address. Click the link to sign in — it expires in 15 minutes.
        </p>
      </div>
    </div>
  );
}
