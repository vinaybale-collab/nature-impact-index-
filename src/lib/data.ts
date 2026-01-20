import {
  Company,
  RankingsData,
  SectorsData,
  Metadata,
  NiiRating,
} from '@/types/company';

// Base path for data files
const DATA_PATH = '/data';

// Load rankings data
export async function getRankings(): Promise<RankingsData> {
  const response = await fetch(`${DATA_PATH}/rankings.json`);
  if (!response.ok) {
    throw new Error('Failed to load rankings data');
  }
  return response.json();
}

// Load sectors data
export async function getSectors(): Promise<SectorsData> {
  const response = await fetch(`${DATA_PATH}/sectors.json`);
  if (!response.ok) {
    throw new Error('Failed to load sectors data');
  }
  return response.json();
}

// Load metadata
export async function getMetadata(): Promise<Metadata> {
  const response = await fetch(`${DATA_PATH}/metadata.json`);
  if (!response.ok) {
    throw new Error('Failed to load metadata');
  }
  return response.json();
}

// Load single company data
export async function getCompany(slug: string): Promise<Company> {
  const response = await fetch(`${DATA_PATH}/companies/${slug}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load company: ${slug}`);
  }
  return response.json();
}

// For static generation - get all company slugs
export async function getAllCompanySlugs(): Promise<string[]> {
  const rankings = await getRankings();
  return rankings.companies.map((c) => c.slug);
}

// Helper: Get score color class
export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-score-excellent';
  if (score >= 6) return 'text-score-good';
  if (score >= 4) return 'text-score-average';
  if (score >= 2) return 'text-score-poor';
  return 'text-score-critical';
}

// Helper: Get score background color class
export function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-score-excellent';
  if (score >= 6) return 'bg-score-good';
  if (score >= 4) return 'bg-score-average';
  if (score >= 2) return 'bg-score-poor';
  return 'bg-score-critical';
}

// Helper: Get rating color class
export function getRatingColor(rating: NiiRating): string {
  switch (rating) {
    case 'Excellent':
      return 'text-score-excellent';
    case 'Good':
      return 'text-score-good';
    case 'Average':
      return 'text-score-average';
    case 'Poor':
      return 'text-score-poor';
    case 'Critical':
      return 'text-score-critical';
    default:
      return 'text-text-secondary';
  }
}

// Helper: Get rating badge color class
export function getRatingBadgeColor(rating: NiiRating): string {
  switch (rating) {
    case 'Excellent':
      return 'bg-score-excellent/20 text-score-excellent border-score-excellent/30';
    case 'Good':
      return 'bg-score-good/20 text-score-good border-score-good/30';
    case 'Average':
      return 'bg-score-average/20 text-score-average border-score-average/30';
    case 'Poor':
      return 'bg-score-poor/20 text-score-poor border-score-poor/30';
    case 'Critical':
      return 'bg-score-critical/20 text-score-critical border-score-critical/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

// Helper: Format number as Rs Crores
export function formatCr(value: number): string {
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L Cr`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K Cr`;
  }
  return `${value.toFixed(1)} Cr`;
}

// Helper: Format percentage
export function formatPct(value: number): string {
  if (value < 0.1) {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (value < 1) {
    return `${(value * 100).toFixed(1)}%`;
  }
  return `${(value * 100).toFixed(0)}%`;
}

// Helper: Format large numbers
export function formatNumber(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

// Static data loading for build time
import rankingsJson from '../../public/data/rankings.json';
import sectorsJson from '../../public/data/sectors.json';
import metadataJson from '../../public/data/metadata.json';

export function getRankingsStatic(): RankingsData {
  return rankingsJson as RankingsData;
}

export function getSectorsStatic(): SectorsData {
  return sectorsJson as SectorsData;
}

export function getMetadataStatic(): Metadata {
  return metadataJson as Metadata;
}

// Get company data at build time
export async function getCompanyStatic(slug: string): Promise<Company | null> {
  try {
    const company = await import(`../../public/data/companies/${slug}.json`);
    return company.default as Company;
  } catch {
    return null;
  }
}
