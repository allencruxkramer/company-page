const EIA_BASE = 'https://api.eia.gov/v2/electricity/operating-generator-capacity/data/';

export interface EIAGenerator {
  plantName: string;
  state: string;
  technology: string;
  capacityMW: number;
  status: string;
  year: string;
}

// Technologies to query — each in separate requests where needed to stay under the 5000-row API limit.
// Solar (~7,773 rows in 2025-12) requires 2 pages; all others fit in one call.
const SOLAR_TECHS = [
  'Solar Photovoltaic',
  'Solar Thermal with Energy Storage',
  'Solar Thermal without Energy Storage',
];

const OTHER_CLEAN_TECHS = [
  'Onshore Wind Turbine',
  'Offshore Wind Turbine',
  'Batteries',
  'Pumped-Hydro Storage',
  'Conventional Hydroelectric',
  'Geothermal',
];

const LATEST_PERIOD = '2025-12';

function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(
      /\b(llc|inc|corp|co|ltd|lp|limited|company|group|energy|power|renewables|renewable|capital|holdings|partners|services|solar|wind|storage)\b/g,
      ''
    )
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fuzzyMatch(eiaEntityName: string, companyName: string): boolean {
  const normalizedEIA = normalizeName(eiaEntityName);
  const normalizedCompany = normalizeName(companyName);
  if (!normalizedCompany || normalizedCompany.length < 3) return false;
  const companyWords = normalizedCompany.split(' ').filter((w) => w.length > 2);
  if (!companyWords.length) return false;
  return companyWords.every((word) => normalizedEIA.includes(word));
}

async function fetchPage(technologies: string[], offset: number): Promise<any[]> {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams();
  params.set('api_key', apiKey);
  params.set('frequency', 'monthly');
  params.append('data[]', 'nameplate-capacity-mw');
  params.append('data[]', 'operating-year-month');
  params.append('facets[status][]', 'OP');
  technologies.forEach((t) => params.append('facets[technology][]', t));
  params.set('start', LATEST_PERIOD);
  params.set('end', LATEST_PERIOD);
  params.set('sort[0][column]', 'nameplate-capacity-mw');
  params.set('sort[0][direction]', 'desc');
  params.set('length', '5000');
  params.set('offset', String(offset));

  try {
    const res = await fetch(`${EIA_BASE}?${params}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.response?.data || [];
  } catch {
    return [];
  }
}

function mapGenerator(g: any): EIAGenerator {
  const opYearMonth: string = g['operating-year-month'] || '';
  return {
    plantName: g['plantName'] || 'Unknown',
    state: g['stateid'] || '',
    technology: g['technology'] || '',
    capacityMW: parseFloat(g['nameplate-capacity-mw'] || '0'),
    status: 'OP',
    year: opYearMonth ? opYearMonth.slice(0, 4) : '',
  };
}

function dedup(generators: EIAGenerator[]): EIAGenerator[] {
  const map = new Map<string, EIAGenerator>();
  for (const g of generators) {
    const key = `${g.plantName}|${g.technology}|${g.state}`;
    const existing = map.get(key);
    if (!existing || g.capacityMW > existing.capacityMW) {
      map.set(key, g);
    }
  }
  return Array.from(map.values());
}

export interface EIAData {
  operating: EIAGenerator[];
  totalOperatingMW: number;
  projectCount: number;
  // pipeline kept as empty arrays for backward compat with existing UI
  pipeline: EIAGenerator[];
  pipelineCount: number;
  totalPipelineMW: number;
}

export async function getEIAData(companyName: string): Promise<EIAData> {
  // Fetch solar (2 pages to cover all 7,773 rows) and other clean tech (1 page each)
  const [solarPage1, solarPage2, otherTech] = await Promise.all([
    fetchPage(SOLAR_TECHS, 0),
    fetchPage(SOLAR_TECHS, 5000),
    fetchPage(OTHER_CLEAN_TECHS, 0),
  ]);

  const allRows = [...solarPage1, ...solarPage2, ...otherTech];
  const matched = allRows.filter((g) => fuzzyMatch(g['entityName'] || '', companyName));
  const operating = dedup(matched.map(mapGenerator)).sort((a, b) => b.capacityMW - a.capacityMW);

  const totalOperatingMW = operating.reduce((sum, g) => sum + g.capacityMW, 0);

  return {
    operating,
    totalOperatingMW,
    projectCount: operating.length,
    pipeline: [],
    pipelineCount: 0,
    totalPipelineMW: 0,
  };
}
