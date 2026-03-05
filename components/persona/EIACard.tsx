'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EIAData, EIAGenerator } from '@/lib/eia';

interface EIACardProps {
  data: EIAData | null;
  error?: boolean;
}

const IconZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

type SortKey = keyof EIAGenerator;

function SortableHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  direction: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
}) {
  const active = currentSort === sortKey;
  return (
    <TableHead
      className="cursor-pointer select-none hover:text-stone-900 whitespace-nowrap text-xs font-semibold text-stone-500 uppercase tracking-wide"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          direction === 'desc' ? <IconChevronDown /> : <IconChevronUp />
        ) : (
          <span className="opacity-30"><IconChevronDown /></span>
        )}
      </span>
    </TableHead>
  );
}

export default function EIACard({ data, error }: EIACardProps) {
  const [sortKey, setSortKey] = useState<SortKey>('capacityMW');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#79716B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            EIA Project Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">EIA data unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const allProjects = data.operating;

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...allProjects].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    }
    const aStr = String(aVal || '');
    const bStr = String(bVal || '');
    return sortDir === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
  });

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-stone-900">
          <span className="text-amber-500"><IconZap /></span>
          EIA Project Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-stone-50 p-3 text-center">
            <p className="text-xs font-medium text-stone-500 mb-1">Total Operating</p>
            <p className="text-lg font-semibold text-stone-900">
              {data.totalOperatingMW >= 1000
                ? `${(data.totalOperatingMW / 1000).toFixed(1)} GW`
                : `${data.totalOperatingMW.toFixed(0)} MW`}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-stone-50 p-3 text-center">
            <p className="text-xs font-medium text-stone-500 mb-1">Projects Found</p>
            <p className="text-lg font-semibold text-stone-900">{data.projectCount ?? data.operating.length}</p>
          </div>
        </div>

        {allProjects.length === 0 ? (
          <p className="text-sm text-stone-500">
            No operating clean energy projects found in EIA data. The company may use a different legal entity name, or primarily develops projects owned by third-party investors.
          </p>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <SortableHeader label="Plant" sortKey="plantName" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    <SortableHeader label="State" sortKey="state" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    <SortableHeader label="Technology" sortKey="technology" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    <SortableHeader label="MW" sortKey="capacityMW" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                    <SortableHeader label="Year" sortKey="year" currentSort={sortKey} direction={sortDir} onSort={handleSort} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.map((g, i) => (
                    <TableRow key={i} className="text-xs border-b border-border hover:bg-stone-50">
                      <TableCell className="font-medium text-stone-900 max-w-[140px] truncate py-2">{g.plantName}</TableCell>
                      <TableCell className="text-stone-600 py-2">{g.state}</TableCell>
                      <TableCell className="text-stone-600 py-2">{g.technology}</TableCell>
                      <TableCell className="font-mono text-stone-900 py-2">{g.capacityMW.toFixed(1)}</TableCell>
                      <TableCell className="text-stone-500 py-2">{g.year || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {allProjects.length > 10 && (
              <button
                onClick={() => setShowAll((s) => !s)}
                className="w-full text-xs text-stone-500 hover:text-stone-900 transition-colors py-1 font-medium"
              >
                {showAll ? 'Show less' : `Show all ${allProjects.length} projects`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
