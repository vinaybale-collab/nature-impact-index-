// Company data types for India Nature Impact Index

export type NiiRating = 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';

export type ViewMode = 'nii' | 'nc';

export interface DimensionBreakdown {
  value_cr: number;
  pct: number;
  sub_components?: {
    // Climate
    scope1_cost_cr?: number;
    scope2_cost_cr?: number;
    scope3_cost_cr?: number;
    re_credit_cr?: number;
    // Water
    consumption_cost_cr?: number;
    recycling_credit_cr?: number;
    // Land
    footprint_cost_cr?: number;
    degradation_cost_cr?: number;
    restoration_credit_cr?: number;
    // Biodiversity
    direct_msa_cost_cr?: number;
    habitat_cost_cr?: number;
    pa_proximity_cost_cr?: number;
    msa_loss_cost_cr?: number;
    // Pollution
    air_cost_cr?: number;
    waste_cost_cr?: number;
    hazardous_cost_cr?: number;
    // Energy
    depletion_cost_cr?: number;
  };
}

export interface CompanyBreakdown {
  climate: DimensionBreakdown;
  water: DimensionBreakdown;
  land: DimensionBreakdown;
  biodiversity: DimensionBreakdown;
  pollution: DimensionBreakdown;
  energy_depletion?: DimensionBreakdown;
}

export interface RawData {
  scope1_ghg_tco2e: number;
  scope2_ghg_tco2e: number;
  scope3_ghg_tco2e: number;
  water_consumption_kl: number;
  water_stress_score: number;
  total_land_ha: number;
  base_msa_loss: number;
  pa_proximity_score: number;
  waste_generated_mt: number;
  renewable_energy_pct: number;
  total_energy_gj?: number;
  renewable_energy_gj?: number;
}

export interface PeerComparison {
  sector_median_score: number;
  sector_best_score: number;
  sector_median_taesc: number;
  sector_best_taesc: number;
}

export interface DataQuality {
  tier: string;
  confidence: string;
}

export interface RestorationEstimate {
  // New ES-increment based formula
  acres_needed: number;
  hectares_equiv: number;
  theta_per_acre_lakh: number;
  methodology: string;
  // Legacy fields (may be present in old data)
  hectares_needed?: number;
  years?: number;
  cost_per_ha_lakhs?: number;
}

export interface Company {
  company_name: string;
  slug: string;
  sector: string;
  state: string;
  revenue_cr: number;

  // NII Mode Data
  nii_score: number;
  nii_rank: number;
  nii_sector_rank: number;
  nii_sector_total: number;
  nii_total_companies: number;
  nii_rating: NiiRating;
  nii_percentile: number;

  // NC Mode Data
  taesc_cr: number;
  nir: number;
  nir_pct: number;

  // Dimension breakdown
  breakdown: CompanyBreakdown;

  // Raw data
  raw_data: RawData;

  // Peer comparison
  peer_comparison: PeerComparison;

  // Data quality
  data_quality: DataQuality;

  // Restoration estimate
  restoration_estimate?: RestorationEstimate;
}

export interface RankingCompany {
  company_name: string;
  slug: string;
  sector: string;
  rank: number;
  nii_score: number;
  taesc_cr: number;
  nir: number;
  nir_pct: number;
  rating: string;
  // Optional fields that may or may not exist
  state?: string;
  nii_rank?: number;
  confidence?: string;
}

export interface RankingsData {
  generated_date: string;
  total_companies: number;
  companies: RankingCompany[];
}

export interface SectorBreakdown {
  climate_cr: number;
  water_cr: number;
  land_cr: number;
  biodiversity_cr: number;
  pollution_cr: number;
}

export interface SectorBestWorst {
  name: string;
  slug: string;
  score: number;
}

export interface Sector {
  sector: string;
  company_count: number;
  avg_nii_score: number;
  avg_taesc_cr: number;
  avg_nir: number;
  median_nir: number;
  best_company: SectorBestWorst;
  worst_company: SectorBestWorst;
  avg_breakdown: SectorBreakdown;
}

export interface SectorsData {
  sectors: Sector[];
}

export interface Statistics {
  total_taesc_cr: number;
  total_taesc_formatted: string;
  union_budget_comparison: string;
  avg_nii_score: number;
  median_nii_score: number;
  avg_nir: number;
  avg_nir_pct: number;
  aggregate_nir_pct: number;
  companies_above_100pct: number;
  sectors_above_100pct: string[];
}

export interface DimensionTotals {
  climate: number;
  water: number;
  land: number;
  biodiversity: number;
  pollution: number;
  energy_depletion?: number;
}

export interface RatingDistribution {
  Excellent: number;
  Good: number;
  Average: number;
  Poor: number;
  Critical: number;
}

export interface DimensionPercentages {
  climate: number;
  water: number;
  land: number;
  biodiversity: number;
  pollution: number;
  energy_depletion: number;
}

export interface Metadata {
  total_companies: number;
  total_sectors: number;
  generated_date: string;
  statistics: Statistics;
  dimension_totals_cr: DimensionTotals;
  dimension_percentages: DimensionPercentages;
  rating_distribution: RatingDistribution;
}

// Dimension info for charts
export const DIMENSION_INFO = {
  climate: {
    name: 'Climate',
    color: '#F97316',
    bgColor: 'bg-dim-climate',
    textColor: 'text-dim-climate',
  },
  water: {
    name: 'Water',
    color: '#3B82F6',
    bgColor: 'bg-dim-water',
    textColor: 'text-dim-water',
  },
  land: {
    name: 'Land',
    color: '#84CC16',
    bgColor: 'bg-dim-land',
    textColor: 'text-dim-land',
  },
  biodiversity: {
    name: 'Biodiversity',
    color: '#10B981',
    bgColor: 'bg-dim-biodiversity',
    textColor: 'text-dim-biodiversity',
  },
  pollution: {
    name: 'Pollution',
    color: '#8B5CF6',
    bgColor: 'bg-dim-pollution',
    textColor: 'text-dim-pollution',
  },
  energy_depletion: {
    name: 'Energy Depletion',
    color: '#EF4444',
    bgColor: 'bg-dim-energy',
    textColor: 'text-dim-energy',
  },
} as const;

export type DimensionKey = keyof typeof DIMENSION_INFO;
