/**
 * CSV Export Utility for India Nature Impact Index
 *
 * Provides functions to download company data as CSV files.
 * Exports only user-facing indicators, excludes internal columns
 * (zero legitimacy, sources, confidence scores, etc.)
 */

import { Company, RankingCompany } from '@/types/company';

// CSV field definitions for export
interface ExportRow {
  company_name: string;
  sector: string;
  revenue_cr: number;
  nii_score: number;
  nii_rank: number;
  nii_rating: string;
  taesc_cr: number;
  nir_pct: number;
  climate_cr: number;
  water_cr: number;
  land_cr: number;
  biodiversity_cr: number;
  pollution_cr: number;
  energy_depletion_cr: number;
  scope1_ghg_tco2e: number | null;
  scope2_ghg_tco2e: number | null;
  scope3_ghg_tco2e: number | null;
  water_consumption_kl: number | null;
  water_stress_score: number | null;
  total_land_ha: number | null;
  waste_generated_mt: number | null;
  renewable_energy_pct: number | null;
}

// Simplified export row for rankings (without dimension breakdown)
interface ExportRowBasic {
  company_name: string;
  sector: string;
  nii_score: number;
  nii_rank: number;
  nii_rating: string;
  taesc_cr: number;
  nir_pct: number;
}

/**
 * Convert a Company object to an export row
 */
function companyToExportRow(company: Company): ExportRow {
  return {
    company_name: company.company_name,
    sector: company.sector,
    revenue_cr: company.revenue_cr,
    nii_score: company.nii_score,
    nii_rank: company.nii_rank,
    nii_rating: company.nii_rating,
    taesc_cr: company.taesc_cr,
    nir_pct: company.nir_pct,
    climate_cr: company.breakdown.climate?.value_cr ?? 0,
    water_cr: company.breakdown.water?.value_cr ?? 0,
    land_cr: company.breakdown.land?.value_cr ?? 0,
    biodiversity_cr: company.breakdown.biodiversity?.value_cr ?? 0,
    pollution_cr: company.breakdown.pollution?.value_cr ?? 0,
    energy_depletion_cr: (company.breakdown as any).energy_depletion?.value_cr ?? 0,
    scope1_ghg_tco2e: company.raw_data?.scope1_ghg_tco2e ?? null,
    scope2_ghg_tco2e: company.raw_data?.scope2_ghg_tco2e ?? null,
    scope3_ghg_tco2e: company.raw_data?.scope3_ghg_tco2e ?? null,
    water_consumption_kl: company.raw_data?.water_consumption_kl ?? null,
    water_stress_score: company.raw_data?.water_stress_score ?? null,
    total_land_ha: company.raw_data?.total_land_ha ?? null,
    waste_generated_mt: company.raw_data?.waste_generated_mt ?? null,
    renewable_energy_pct: company.raw_data?.renewable_energy_pct ?? null,
  };
}

/**
 * Convert a RankingCompany object to a basic export row
 */
function rankingToExportRow(company: RankingCompany, rank: number): ExportRowBasic {
  return {
    company_name: company.company_name,
    sector: company.sector,
    nii_score: company.nii_score,
    nii_rank: rank,
    nii_rating: company.rating,
    taesc_cr: company.taesc_cr,
    nir_pct: company.nir * 100,
  };
}

/**
 * Escape a CSV field value (handle commas, quotes, newlines)
 */
function escapeCSVField(value: string | number | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape existing quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert an array of objects to CSV string
 */
function objectsToCSV(data: object[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create header row
  const headerRow = headers.map(h => escapeCSVField(h)).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    const rowObj = row as Record<string, unknown>;
    return headers.map(header => escapeCSVField(rowObj[header] as string | number | null)).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger a file download in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Download a single company's data as CSV
 * Includes full breakdown and raw data
 */
export function downloadCompanyCSV(company: Company): void {
  const exportRow = companyToExportRow(company);
  const csv = objectsToCSV([exportRow]);

  // Create filename from company name (sanitize for filesystem)
  const safeName = company.company_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  downloadFile(csv, `${safeName}-nature-impact-data.csv`);
}

/**
 * Download all companies' data as CSV
 * Uses rankings data for basic info (no dimension breakdown)
 */
export async function downloadAllCompaniesCSV(): Promise<void> {
  try {
    // Fetch rankings data
    const response = await fetch('/data/rankings.json');
    if (!response.ok) {
      throw new Error('Failed to load rankings data');
    }

    const data = await response.json();
    const companies = data.companies as RankingCompany[];

    // Convert to export rows
    const exportRows = companies.map((company, index) =>
      rankingToExportRow(company, index + 1)
    );

    const csv = objectsToCSV(exportRows);

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `india-nature-impact-index-${date}.csv`);
  } catch (error) {
    console.error('Failed to download CSV:', error);
    throw error;
  }
}

/**
 * Download all companies with full dimension breakdown
 * Fetches each company's JSON for complete data
 * Note: This is slower as it fetches 516 individual files
 */
export async function downloadAllCompaniesFullCSV(): Promise<void> {
  try {
    // First, get the list of all company slugs from rankings
    const rankingsResponse = await fetch('/data/rankings.json');
    if (!rankingsResponse.ok) {
      throw new Error('Failed to load rankings data');
    }

    const rankingsData = await rankingsResponse.json();
    const companies = rankingsData.companies as RankingCompany[];

    // Fetch all company data in parallel (in batches to avoid overwhelming)
    const batchSize = 50;
    const allCompanyData: Company[] = [];

    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      const batchPromises = batch.map(async (company) => {
        try {
          const response = await fetch(`/data/companies/${company.slug}.json`);
          if (response.ok) {
            return await response.json() as Company;
          }
          return null;
        } catch {
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allCompanyData.push(...batchResults.filter((c): c is Company => c !== null));
    }

    // Convert to export rows
    const exportRows = allCompanyData.map(company => companyToExportRow(company));

    const csv = objectsToCSV(exportRows);

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `india-nature-impact-index-full-${date}.csv`);
  } catch (error) {
    console.error('Failed to download full CSV:', error);
    throw error;
  }
}

/**
 * Download sector summary data as CSV
 */
export async function downloadSectorsCSV(): Promise<void> {
  try {
    const response = await fetch('/data/sectors.json');
    if (!response.ok) {
      throw new Error('Failed to load sectors data');
    }

    const data = await response.json();
    const sectors = data.sectors;

    // Flatten sector data for CSV export
    const exportRows = sectors.map((sector: any) => ({
      sector: sector.sector,
      company_count: sector.company_count,
      avg_nii_score: sector.avg_nii_score,
      avg_taesc_cr: sector.avg_taesc_cr,
      avg_nir: sector.avg_nir,
      median_nir: sector.median_nir,
      best_company: sector.best_company?.name ?? '',
      best_company_score: sector.best_company?.score ?? '',
      worst_company: sector.worst_company?.name ?? '',
      worst_company_score: sector.worst_company?.score ?? '',
      climate_cr: sector.avg_breakdown?.climate_cr ?? 0,
      water_cr: sector.avg_breakdown?.water_cr ?? 0,
      land_cr: sector.avg_breakdown?.land_cr ?? 0,
      biodiversity_cr: sector.avg_breakdown?.biodiversity_cr ?? 0,
      pollution_cr: sector.avg_breakdown?.pollution_cr ?? 0,
    }));

    const csv = objectsToCSV(exportRows);

    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `india-nature-impact-sectors-${date}.csv`);
  } catch (error) {
    console.error('Failed to download sectors CSV:', error);
    throw error;
  }
}

/**
 * Copy text to clipboard (for share functionality)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate shareable URL for current page
 */
export function getShareableUrl(): string {
  return window.location.href;
}

/**
 * Share page URL (copy to clipboard)
 */
export async function shareCurrentPage(): Promise<boolean> {
  return copyToClipboard(getShareableUrl());
}
