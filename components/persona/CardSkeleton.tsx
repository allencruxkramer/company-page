import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-32 bg-stone-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 bg-stone-200" style={{ width: `${70 + (i * 7) % 30}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="bg-white border border-border rounded-lg p-5 mb-5">
      <div className="flex items-center gap-3.5">
        <Skeleton className="w-12 h-12 rounded-lg bg-stone-200" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 bg-stone-200" />
          <Skeleton className="h-3.5 w-32 bg-stone-200" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <Skeleton className="h-3.5 w-full bg-stone-200" />
        <Skeleton className="h-3.5 w-3/4 bg-stone-200" />
      </div>
    </div>
  );
}

export function BriefingSkeleton() {
  return (
    <Card className="mb-5 border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-40 bg-stone-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3.5 w-full bg-stone-200" />
        <Skeleton className="h-3.5 w-5/6 bg-stone-200" />
        <Skeleton className="h-3.5 w-4/5 bg-stone-200" />
        <Skeleton className="h-3.5 w-full bg-stone-200" />
        <Skeleton className="h-3.5 w-3/4 bg-stone-200" />
      </CardContent>
    </Card>
  );
}
