'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, TrendingDown, TrendingUp, Minus, TreePine, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import CountUp from '@/components/ui/CountUp';
import { DimensionWaterfall, DetailedWaterfall } from '@/components/ui/TrueWaterfall';
import { useToggle } from '@/context/ToggleContext';
import { Company, DIMENSION_INFO, DimensionKey } from '@/types/company';
import { downloadCompanyCSV } from '@/lib/export';

// Coefficient sources for TRUST element
const COEFFICIENT_SOURCES: Record<string, { value: string; source: string }> = {
  scc: { value: 'Rs 8,500/tCO2e', source: 'India Social Cost of Carbon - World Bank & RBI 2023' },
  water_base: { value: 'Rs 50K-500K/ML', source: 'WRI Aqueduct 4.0 Water Risk Atlas stress pricing' },
  land_footprint: { value: 'Rs 4L/ha', source: 'TEEB India Ecosystem Service Valuation 2018' },
  land_degradation: { value: 'Rs 8L/ha', source: 'UNCCD Land Degradation Neutrality Framework' },
  waste: { value: 'Rs 20K/MT', source: 'CPCB Municipal Waste Management Guidelines 2023' },
  plastic: { value: 'Rs 80K/MT', source: 'OECD Microplastics Cost Assessment 2022' },
  ewaste: { value: 'Rs 150K/MT', source: 'WHO Heavy Metal Toxicity Health Cost Estimates' },
  hap: { value: 'Rs 3K/kg', source: 'WHO Air Quality Health Impact Assessment' },
  msa: { value: 'GLOBIO4 MSA', source: 'PBL Netherlands - GLOBIO Biodiversity Model 2020' },
  energy: { value: 'Rs 300/GJ', source: 'World Bank Resource Scarcity Shadow Pricing' },
};

// Tooltip component for source attribution
function SourceTooltip({ coefficient, children }: { coefficient: string; children: React.ReactNode }) {
  const info = COEFFICIENT_SOURCES[coefficient];
  if (!info) return <>{children}</>;

  return (
    <span className="group relative cursor-help">
      {children}
      <span className="pointer-events-none absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
        <span className="font-semibold text-emerald-400">{info.value}</span>
        <br />
        <span className="text-gray-300">{info.source}</span>
        <span className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-gray-900" />
      </span>
    </span>
  );
}

interface Props {
  company: Company;
}

// Get impact color based on NIR percentage
function getImpactColor(nir: number): string {
  if (nir > 100) return '#DC2626'; // Critical - Red
  if (nir > 50) return '#EA580C';  // High - Orange
  if (nir > 20) return '#CA8A04';  // Moderate - Yellow
  if (nir > 5) return '#16A34A';   // Good - Green
  return '#059669';                // Excellent - Emerald
}

function getImpactLabel(nir: number): string {
  if (nir > 100) return "Nature's Debtor";
  if (nir > 50) return 'High Impact';
  if (nir > 20) return 'Moderate Impact';
  if (nir > 5) return 'Low Impact';
  return 'Excellent';
}

// Format large numbers in Indian style
function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
  return value.toFixed(0);
}

export default function CompanyClient({ company }: Props) {
  const { isNiiMode } = useToggle();
  const [downloading, setDownloading] = useState(false);

  // Include energy_depletion if available
  const dimensions: DimensionKey[] = ['climate', 'water', 'land', 'biodiversity', 'pollution', 'energy_depletion'];

  // Calculate Rs per Rs 100 (NIR as percentage)
  const rsPerRs100 = company.nir_pct || company.nir * 100;

  // Prepare waterfall data
  const waterfallData = dimensions
    .filter(dim => company.breakdown[dim]?.value_cr)
    .map(dim => ({
      name: DIMENSION_INFO[dim]?.name || dim,
      value: company.breakdown[dim]?.value_cr || 0,
      color: DIMENSION_INFO[dim]?.color || '#6B7280',
    }));

  // Prepare detailed waterfall data with sub-components
  const detailedWaterfallData = dimensions
    .filter(dim => company.breakdown[dim]?.value_cr)
    .map(dim => {
      const breakdown = company.breakdown[dim];
      const subs = breakdown?.sub_components || {};

      // Build sub-components based on dimension type
      let subComponents: { name: string; value: number; isCredit?: boolean }[] = [];

      if (dim === 'climate') {
        if (subs.scope1_cost_cr) subComponents.push({ name: 'Scope 1 (Direct)', value: subs.scope1_cost_cr });
        if (subs.scope2_cost_cr) subComponents.push({ name: 'Scope 2 (Purchased Energy)', value: subs.scope2_cost_cr });
        if (subs.scope3_cost_cr) subComponents.push({ name: 'Scope 3 (Value Chain)', value: subs.scope3_cost_cr });
        if (subs.re_credit_cr) subComponents.push({ name: 'Renewable Energy Credit', value: -subs.re_credit_cr, isCredit: true });
      } else if (dim === 'water') {
        if (subs.consumption_cost_cr) subComponents.push({ name: 'Water Consumption', value: subs.consumption_cost_cr });
        if (subs.recycling_credit_cr) subComponents.push({ name: 'Recycling Credit', value: -subs.recycling_credit_cr, isCredit: true });
      } else if (dim === 'land') {
        if (subs.footprint_cost_cr) subComponents.push({ name: 'Land Footprint', value: subs.footprint_cost_cr });
        if (subs.degradation_cost_cr) subComponents.push({ name: 'Land Degradation', value: subs.degradation_cost_cr });
        if (subs.restoration_credit_cr) subComponents.push({ name: 'Restoration Credit', value: -subs.restoration_credit_cr, isCredit: true });
      } else if (dim === 'biodiversity') {
        if (subs.direct_msa_cost_cr) subComponents.push({ name: 'Direct MSA Loss', value: subs.direct_msa_cost_cr });
        if (subs.scope3_bio_cost_cr) subComponents.push({ name: 'Supply Chain Biodiversity', value: subs.scope3_bio_cost_cr });
      } else if (dim === 'pollution') {
        if (subs.waste_cost_cr) subComponents.push({ name: 'Operational Waste', value: subs.waste_cost_cr });
        if (subs.overburden_cost_cr) subComponents.push({ name: 'Mining Overburden', value: subs.overburden_cost_cr });
        if (subs.plastic_cost_cr) subComponents.push({ name: 'Plastic Waste', value: subs.plastic_cost_cr });
        if (subs.ewaste_cost_cr) subComponents.push({ name: 'E-Waste', value: subs.ewaste_cost_cr });
        if (subs.hap_cost_cr) subComponents.push({ name: 'Hazardous Air Pollutants', value: subs.hap_cost_cr });
        if (subs.recycling_credit_cr) subComponents.push({ name: 'Recycling Credit', value: -subs.recycling_credit_cr, isCredit: true });
      } else if (dim === 'energy_depletion') {
        if (subs.non_renewable_cost_cr) subComponents.push({ name: 'Non-Renewable Energy', value: subs.non_renewable_cost_cr });
      }

      return {
        name: DIMENSION_INFO[dim]?.name || dim,
        value: breakdown?.value_cr || 0,
        color: DIMENSION_INFO[dim]?.color || '#6B7280',
        subComponents: subComponents.filter(s => s.value !== 0),
      };
    });

  // Handle download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      downloadCompanyCSV(company);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-16 pb-16 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Back link */}
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Rankings
          </Link>

          {/* ═══════════════════════════════════════════════════════════════
              HERO SECTION (Redesigned per Design Review 2)
              LEFT: Company name, Two big numbers (TAESC + NIR), Ranks
              RIGHT: Breakdown waterfall + Peer comparison
              ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-12">
            {/* Company Header with Download */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <h1
                    className="text-4xl lg:text-5xl xl:text-6xl font-gothic text-gray-900 uppercase tracking-wide break-words"
                    title={company.company_name}
                  >
                    {company.company_name}
                  </h1>
                  <Badge rating={company.nii_rating} className="text-base flex-shrink-0" />
                </div>
                <p className="text-xl text-gray-500">{company.sector}</p>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                {downloading ? 'Downloading...' : 'Download Data'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT: Two big numbers + Ranks */}
              <div className="lg:col-span-5">
                {/* Two Big Numbers Side by Side */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* TAESC */}
                  <div className="bg-gray-50 rounded-3xl p-6 lg:p-8">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-medium">Total Annual Ecosystem Service Cost</p>
                    <p className="text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900">
                      <CountUp end={company.taesc_cr} duration={1500} decimals={0} />
                    </p>
                    <p className="text-base text-gray-500 mt-1">Rs Crores</p>
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                      The monetary value of ecosystem services consumed annually - including climate, water, land, biodiversity, pollution, and energy.
                    </p>
                  </div>
                  {/* NIR */}
                  <div
                    className="rounded-3xl p-6 lg:p-8"
                    style={{ backgroundColor: `${getImpactColor(rsPerRs100)}10` }}
                  >
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-medium">Nature Impact Ratio</p>
                    <p className="text-5xl lg:text-6xl xl:text-7xl font-black" style={{ color: getImpactColor(rsPerRs100) }}>
                      {rsPerRs100.toFixed(1)}%
                    </p>
                    <p className="text-base mt-1" style={{ color: getImpactColor(rsPerRs100) }}>{getImpactLabel(rsPerRs100)}</p>
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                      For every Rs 100 of revenue generated, Rs {rsPerRs100.toFixed(1)} worth of nature is consumed. Values over 100% indicate unsustainable operations.
                    </p>
                  </div>
                </div>

                {/* Ranks */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-medium">Overall Rank</p>
                    <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                      #{company.nii_rank}
                      <span className="text-base font-normal text-gray-500 ml-2">
                        of {company.nii_total_companies || 516}
                      </span>
                    </p>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-medium">Sector Rank</p>
                    <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                      #{company.nii_sector_rank}
                      <span className="text-base font-normal text-gray-500 ml-2">
                        of {company.nii_sector_total || '?'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Revenue info */}
                <p className="text-base text-gray-600 mb-6">
                  Revenue: <span className="font-semibold">Rs {company.revenue_cr.toLocaleString()} Cr</span> (FY24)
                </p>

                {/* Peer Comparison - Moved to left side */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Peer Comparison</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Company</span>
                      <span className="text-base font-bold" style={{ color: getImpactColor(rsPerRs100) }}>
                        {company.taesc_cr.toLocaleString()} Cr
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sector Median</span>
                      <span className="text-base font-bold text-gray-700">
                        {company.peer_comparison?.sector_median_taesc?.toLocaleString() || 'N/A'} Cr
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Best in Sector</span>
                      <span className="text-base font-bold text-emerald-600">
                        {company.peer_comparison?.sector_best_taesc?.toLocaleString() || 'N/A'} Cr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Breakdown Waterfall + Peer Comparison */}
              <div className="lg:col-span-7">
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
                  {/* Breakdown Header */}
                  <h2 className="text-lg font-gothic text-gray-900 uppercase tracking-wider mb-6">
                    Annual Ecosystem Service Cost Breakdown
                  </h2>

                  {/* Dimension Waterfall Chart (TRUE waterfall) - Expanded height */}
                  <div className="mb-6">
                    <DimensionWaterfall
                      dimensions={waterfallData}
                      total={company.taesc_cr}
                      height={380}
                    />
                  </div>

                  {/* Dimension Legend with values */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {waterfallData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              SUPER DETAILED WATERFALL CHART (All Sub-Components)
              ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-gothic text-gray-900 mb-3 uppercase tracking-wide">
                Detailed Cost Breakdown
              </h2>
              <p className="text-lg text-gray-600">
                All sub-components across dimensions. Credits shown in green reduce the total cost.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 lg:p-10">
              {/* Dimension Legend */}
              <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
                {waterfallData.map((dim) => (
                  <div key={dim.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${dim.color}15` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dim.color }} />
                    <span className="text-sm font-medium" style={{ color: dim.color }}>{dim.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">Credits</span>
                </div>
              </div>

              <DetailedWaterfall
                dimensions={detailedWaterfallData}
                total={company.taesc_cr}
                height={500}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              RESTORATION ESTIMATE - ACTION ELEMENT
              ═══════════════════════════════════════════════════════════════ */}
          {company.restoration_estimate && (
            <section className="mb-16">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <TreePine className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Path to Nature Positive</p>
                      <h3 className="text-3xl lg:text-4xl font-gothic text-emerald-900 uppercase tracking-wide">
                        Restoration Opportunity
                      </h3>
                    </div>
                  </div>

                  {/* Big Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-emerald-200">
                      <p className="text-sm text-emerald-600 uppercase tracking-wider mb-2 font-medium">Land to Restore</p>
                      <p className="text-5xl lg:text-6xl font-black text-emerald-700">
                        {(company.restoration_estimate.acres_needed || 0).toLocaleString()}
                      </p>
                      <p className="text-lg text-emerald-600 mt-1">acres ({(company.restoration_estimate.hectares_equiv || 0).toLocaleString()} hectares)</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-emerald-200">
                      <p className="text-sm text-emerald-600 uppercase tracking-wider mb-2 font-medium">Timeline</p>
                      <p className="text-5xl lg:text-6xl font-black text-emerald-700">5</p>
                      <p className="text-lg text-emerald-600 mt-1">years to offset annual impact</p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-emerald-600 text-white rounded-2xl p-6 lg:p-8">
                    <p className="text-lg lg:text-xl mb-4">
                      By investing in ecosystem restoration, {company.company_name} can transition from being a nature debtor to becoming <span className="font-bold">nature positive</span>.
                    </p>
                    <p className="text-emerald-200 text-sm">
                      {company.restoration_estimate.methodology}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              PHYSICAL FOOTPRINT - Organized by Dimension
              ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-gothic text-gray-900 mb-3 uppercase tracking-wide">
              Physical Footprint
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Raw environmental data from company disclosures (FY2024)
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CLIMATE */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_INFO.climate.color }} />
                  <h3 className="font-semibold text-gray-900">Climate</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Scope 1 GHG</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.scope1_ghg_tco2e)} tCO2e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Scope 2 GHG</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.scope2_ghg_tco2e)} tCO2e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Scope 3 GHG</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.scope3_ghg_tco2e)} tCO2e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Renewable Energy</span>
                    <span className="text-sm font-mono font-medium">{company.raw_data.renewable_energy_pct?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </div>

              {/* WATER */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_INFO.water.color }} />
                  <h3 className="font-semibold text-gray-900">Water</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Consumption</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.water_consumption_kl)} KL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Stress Score</span>
                    <span className="text-sm font-mono font-medium">{company.raw_data.water_stress_score?.toFixed(1) || 'N/A'} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* LAND */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_INFO.land.color }} />
                  <h3 className="font-semibold text-gray-900">Land</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Land</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.total_land_ha)} ha</span>
                  </div>
                </div>
              </div>

              {/* BIODIVERSITY */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_INFO.biodiversity.color }} />
                  <h3 className="font-semibold text-gray-900">Biodiversity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">MSA Loss</span>
                    <span className="text-sm font-mono font-medium">{company.raw_data.base_msa_loss?.toFixed(4) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">PA Proximity</span>
                    <span className="text-sm font-mono font-medium">{company.raw_data.pa_proximity_score?.toFixed(4) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* POLLUTION */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_INFO.pollution.color }} />
                  <h3 className="font-semibold text-gray-900">Pollution</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Waste Generated</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.waste_generated_mt)} MT</span>
                  </div>
                </div>
              </div>

              {/* ENERGY */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_INFO.energy_depletion?.color || '#EF4444' }} />
                  <h3 className="font-semibold text-gray-900">Energy</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Energy</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.total_energy_gj || 0)} GJ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Renewable</span>
                    <span className="text-sm font-mono font-medium">{formatNumber(company.raw_data.renewable_energy_gj || 0)} GJ</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              DETAILED DATA TABLE (Collapsible Sections)
              ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-gothic text-gray-900 mb-2 uppercase tracking-wide">
                  Detailed Environmental Data
                </h2>
                <p className="text-lg text-gray-600">
                  Complete breakdown of ecosystem service costs by dimension
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-base table-fixed min-w-[900px]">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-4 font-semibold text-gray-700 w-[22%]">Indicator</th>
                      <th className="text-right px-4 py-4 font-semibold text-gray-700 w-[18%]">Physical Value</th>
                      <th className="text-right px-4 py-4 font-semibold text-gray-700 w-[15%]">ES Cost (Rs Cr)</th>
                      <th className="text-left px-4 py-4 font-semibold text-gray-700 w-[33%]">Calculation Method</th>
                      <th className="text-center px-4 py-4 font-semibold text-gray-700 w-[12%]">% of TAESC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* CLIMATE */}
                    <tr className="bg-orange-50/70">
                      <td className="px-5 py-4 font-semibold text-orange-700">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-orange-500" />
                          Climate
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">-</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-orange-700 text-lg">{company.breakdown.climate?.value_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        <SourceTooltip coefficient="scc">Sum of GHG costs at Rs 8,500/tCO2e (India SCC)</SourceTooltip>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-orange-700">{company.breakdown.climate?.pct?.toFixed(1) || 0}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Scope 1 (Direct emissions)</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.scope1_ghg_tco2e?.toLocaleString() || 0} tCO2e</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.climate?.sub_components?.scope1_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">
                        <SourceTooltip coefficient="scc">tCO2e x Rs 8,500 (100% responsibility)</SourceTooltip>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Scope 2 (Purchased energy)</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.scope2_ghg_tco2e?.toLocaleString() || 0} tCO2e</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.climate?.sub_components?.scope2_net_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">Net after RE credit offset</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Scope 3 (Value chain)</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.scope3_ghg_tco2e?.toLocaleString() || 0} tCO2e</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.climate?.sub_components?.scope3_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">
                        <SourceTooltip coefficient="scc">tCO2e x Rs 8,500 x 50% (indirect)</SourceTooltip>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-emerald-50/30">
                      <td className="px-5 py-3 pl-10 text-emerald-600">RE Credit (Offset)</td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-600">{company.raw_data.renewable_energy_pct?.toFixed(1) || 0}% RE share</td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-emerald-600">-{company.breakdown.climate?.sub_components?.re_credit_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-emerald-600 text-sm">Avoided grid emissions credit</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>

                    {/* WATER */}
                    <tr className="bg-blue-50/70">
                      <td className="px-5 py-4 font-semibold text-blue-700">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-500" />
                          Water
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">-</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-blue-700 text-lg">{company.breakdown.water?.value_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        <SourceTooltip coefficient="water_base">Stress-adjusted water pricing (Rs 50K-500K/ML)</SourceTooltip>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-blue-700">{company.breakdown.water?.pct?.toFixed(1) || 0}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Water Consumption</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.water_consumption_kl?.toLocaleString() || 0} KL</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.water?.sub_components?.consumption_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">KL x stress-adjusted price</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-emerald-50/30">
                      <td className="px-5 py-3 pl-10 text-emerald-600">Recycling Credit</td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-600">{company.raw_data.water_stress_score?.toFixed(2) || 'N/A'} stress score</td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-emerald-600">-{company.breakdown.water?.sub_components?.recycling_credit_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-emerald-600 text-sm">50% credit on recycled water</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>

                    {/* LAND */}
                    <tr className="bg-lime-50/70">
                      <td className="px-5 py-4 font-semibold text-lime-700">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-lime-500" />
                          Land
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">-</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-lime-700 text-lg">{company.breakdown.land?.value_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        <SourceTooltip coefficient="land_footprint">Land footprint + degradation (TEEB India)</SourceTooltip>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-lime-700">{company.breakdown.land?.pct?.toFixed(1) || 0}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Land Footprint</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.total_land_ha?.toLocaleString() || 0} hectares</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.land?.sub_components?.footprint_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">
                        <SourceTooltip coefficient="land_footprint">ha x Rs 4L/ha x sector multiplier</SourceTooltip>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Land Degradation</td>
                      <td className="px-5 py-3 text-right font-mono">-</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.land?.sub_components?.degradation_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">
                        <SourceTooltip coefficient="land_degradation">Degraded ha x Rs 8L/ha</SourceTooltip>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-emerald-50/30">
                      <td className="px-5 py-3 pl-10 text-emerald-600">Restoration Credit</td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-600">-</td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-emerald-600">-{company.breakdown.land?.sub_components?.restoration_credit_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-emerald-600 text-sm">Restored ha x Rs 4L/ha credit</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>

                    {/* BIODIVERSITY */}
                    <tr className="bg-emerald-50/70">
                      <td className="px-5 py-4 font-semibold text-emerald-700">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-500" />
                          Biodiversity
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">-</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700 text-lg">{company.breakdown.biodiversity?.value_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        <SourceTooltip coefficient="msa">GLOBIO MSA loss model (direct + supply chain)</SourceTooltip>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-emerald-700">{company.breakdown.biodiversity?.pct?.toFixed(1) || 0}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Direct MSA Loss</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.base_msa_loss?.toFixed(4) || 'N/A'} MSA</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.biodiversity?.sub_components?.direct_msa_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">MSA x Revenue x PA proximity multiplier</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Supply Chain Biodiversity</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.pa_proximity_score?.toFixed(4) || 'N/A'} PA score</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.biodiversity?.sub_components?.scope3_bio_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">EXIOBASE Scope 3 x 50% (indirect)</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>

                    {/* POLLUTION */}
                    <tr className="bg-purple-50/70">
                      <td className="px-5 py-4 font-semibold text-purple-700">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-purple-500" />
                          Pollution
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">-</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-purple-700 text-lg">{company.breakdown.pollution?.value_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        <SourceTooltip coefficient="waste">Waste, plastic, e-waste, HAP (CPCB rates)</SourceTooltip>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-purple-700">{company.breakdown.pollution?.pct?.toFixed(1) || 0}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Operational Waste</td>
                      <td className="px-5 py-3 text-right font-mono">{company.raw_data.waste_generated_mt?.toLocaleString() || 0} MT</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.pollution?.sub_components?.waste_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">MT x Rs 20K/MT</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Plastic Waste</td>
                      <td className="px-5 py-3 text-right font-mono">-</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.pollution?.sub_components?.plastic_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">MT x Rs 80K/MT (OECD microplastics)</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">E-Waste</td>
                      <td className="px-5 py-3 text-right font-mono">-</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.pollution?.sub_components?.ewaste_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">MT x Rs 150K/MT (heavy metal toxicity)</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-3 pl-10 text-gray-600">Hazardous Air Pollutants</td>
                      <td className="px-5 py-3 text-right font-mono">-</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.pollution?.sub_components?.hap_cost_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">kg x Rs 3K/kg (WHO health cost)</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-emerald-50/30">
                      <td className="px-5 py-3 pl-10 text-emerald-600">Recycling Credit</td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-600">-</td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-emerald-600">-{company.breakdown.pollution?.sub_components?.recycling_credit_cr?.toLocaleString() || 0}</td>
                      <td className="px-5 py-3 text-emerald-600 text-sm">Recycled MT x Rs 10K/MT credit</td>
                      <td className="px-5 py-3 text-center text-gray-500">-</td>
                    </tr>

                    {/* ENERGY DEPLETION */}
                    {company.breakdown.energy_depletion && (
                      <>
                        <tr className="bg-amber-50/70">
                          <td className="px-5 py-4 font-semibold text-amber-700">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-amber-500" />
                              Energy Resource Depletion
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono">-</td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-amber-700 text-lg">{company.breakdown.energy_depletion?.value_cr?.toLocaleString() || 0}</td>
                          <td className="px-5 py-4 text-gray-500 text-sm">Non-renewable resource scarcity (World Bank)</td>
                          <td className="px-5 py-4 text-center font-semibold text-amber-700">{company.breakdown.energy_depletion?.pct?.toFixed(1) || 0}%</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-5 py-3 pl-10 text-gray-600">Non-Renewable Energy</td>
                          <td className="px-5 py-3 text-right font-mono">{((company.raw_data.total_energy_gj || 0) - (company.raw_data.renewable_energy_gj || 0)).toLocaleString()} GJ</td>
                          <td className="px-5 py-3 text-right font-mono font-medium">{company.breakdown.energy_depletion?.sub_components?.non_renewable_cost_cr?.toLocaleString() || 0}</td>
                          <td className="px-5 py-3 text-gray-500 text-sm">GJ x Rs 300/GJ (extraction + scarcity)</td>
                          <td className="px-5 py-3 text-center text-gray-500">-</td>
                        </tr>
                      </>
                    )}

                    {/* TOTAL */}
                    <tr className="bg-gray-900 text-white">
                      <td className="px-5 py-5 font-bold text-lg">TOTAL ANNUAL ECOSYSTEM SERVICE COST</td>
                      <td className="px-5 py-5 text-right">-</td>
                      <td className="px-5 py-5 text-right font-mono font-bold text-2xl">{company.taesc_cr?.toLocaleString()}</td>
                      <td className="px-5 py-5 text-gray-300 text-sm">Sum of all dimension costs</td>
                      <td className="px-5 py-5 text-center font-bold text-lg">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              DATA QUALITY SECTION (Task 4.4)
              ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Quality Assessment</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Tier Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Data Source Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm text-gray-700">Tier 1 (Direct BRSR)</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {company.data_quality?.tier === 'Tier 1' ? '100%' : company.data_quality?.tier === 'Tier 2' ? '60%' : '30%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-700">Tier 2 (Calculated/Estimated)</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {company.data_quality?.tier === 'Tier 1' ? '0%' : company.data_quality?.tier === 'Tier 2' ? '30%' : '40%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm text-gray-700">Tier 3 (Sector Averages)</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {company.data_quality?.tier === 'Tier 1' ? '0%' : company.data_quality?.tier === 'Tier 2' ? '10%' : '30%'}
                      </span>
                    </div>
                  </div>
                  {/* Visual bar */}
                  <div className="mt-4 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500"
                      style={{ width: company.data_quality?.tier === 'Tier 1' ? '100%' : company.data_quality?.tier === 'Tier 2' ? '60%' : '30%' }}
                    />
                    <div
                      className="bg-yellow-500"
                      style={{ width: company.data_quality?.tier === 'Tier 1' ? '0%' : company.data_quality?.tier === 'Tier 2' ? '30%' : '40%' }}
                    />
                    <div
                      className="bg-orange-500"
                      style={{ width: company.data_quality?.tier === 'Tier 1' ? '0%' : company.data_quality?.tier === 'Tier 2' ? '10%' : '30%' }}
                    />
                  </div>
                </div>

                {/* Right: Confidence Score */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Overall Confidence</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={parseInt(company.data_quality?.confidence || '0') >= 75 ? '#10B981' : parseInt(company.data_quality?.confidence || '0') >= 50 ? '#F59E0B' : '#EF4444'}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(parseInt(company.data_quality?.confidence || '0') / 100) * 251} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{company.data_quality?.confidence || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{company.data_quality?.tier || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Data Quality Tier</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">
                    Confidence score reflects the proportion of directly reported vs. estimated data points.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Data sourced from BRSR FY24 filings, annual reports, and sector benchmarks.
                </p>
                <Link
                  href="/methodology"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View Full Methodology
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
