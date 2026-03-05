import Sidebar from './Sidebar';

export default function AppLayout({ children, email }: { children: React.ReactNode; email?: string }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar email={email} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
