import { HeaderSkeleton, BriefingSkeleton, CardSkeleton } from '@/components/persona/CardSkeleton';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-4">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to search
        </a>
      </div>
      <HeaderSkeleton />
      <BriefingSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton rows={6} />
        <CardSkeleton rows={6} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  );
}
