'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, AlertTriangle, Award, XCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WaterfallChartCompact } from '@/components/ui/WaterfallChart';
import { DIMENSION_INFO } from '@/types/company';

interface SectorData {
  sector: string;
  company_count: number;
  avg_nii_score: number;
  avg_taesc_cr: number;
  avg_nir: number;
  median_nir: number;
  best_company: {
    name: string;
    slug: string;
    score: number;
  };
  worst_company: {
    name: string;
    slug: string;
    score: number;
  };
  avg_breakdown: {
    climate_cr: number;
    water_cr: number;
    land_cr: number;
    biodiversity_cr: number;
    pollution_cr: number;
  };
}

interface CompanyData {
  company_name: string;
  slug: string;
  sector: string;
  nii_score: number;
  taesc_cr: number;
  nir: number;
  nir_pct: number;
  rating: string;
}

// Get color based on NIR
function getNirColor(nir: number): string {
  if (nir > 1) return '#DC2626';
  if (nir > 0.5) return '#EA580C';
  if (nir > 0.2) return '#CA8A04';
  if (nir > 0.05) return '#16A34A';
  return '#059669';
}

// Generate slug from sector name
function generateSlug(sector: string): string {
  return sector.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatCr(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L Cr`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K Cr`;
  return `${value.toFixed(0)} Cr`;
}

interface SectorClientProps {
  slug: string;
}

export default function SectorClient({ slug }: SectorClientProps) {
  const [sector, setSector] = useState<SectorData | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load sectors data
        const sectorsRes = await fetch('/data/sectors.json');
        const sectorsData = await sectorsRes.json();
        const foundSector = sectorsData.sectors.find((s: SectorData) => generateSlug(s.sector) === slug);
        setSector(foundSector || null);

        // Load rankings to get companies in this sector
        const rankingsRes = await fetch('/data/rankings.json');
        const rankingsData = await rankingsRes.json();
        const sectorCompanies = rankingsData.companies.filter(
          (c: CompanyData) => c.sector === foundSector?.sector
        );
        setCompanies(sectorCompanies || []);
      } catch (error) {
        console.error('Failed to load sector data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sector Not Found</h1>
            <p className="text-gray-600 mb-8">The sector you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/sectors" className="text-emerald-600 hover:text-emerald-700 font-medium">
              View all sectors
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare waterfall data from breakdown
  const waterfallData = [
    { name: 'Climate', value: sector.avg_breakdown.climate_cr, color: DIMENSION_INFO.climate.color },
    { name: 'Water', value: sector.avg_breakdown.water_cr, color: DIMENSION_INFO.water.color },
    { name: 'Land', value: sector.avg_breakdown.land_cr, color: DIMENSION_INFO.land.color },
    { name: 'Biodiversity', value: sector.avg_breakdown.biodiversity_cr, color: DIMENSION_INFO.biodiversity.color },
    { name: 'Pollution', value: sector.avg_breakdown.pollution_cr, color: DIMENSION_INFO.pollution.color },
  ].filter(d => d.value > 0);

  const avgTaesc = sector.avg_taesc_cr;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back link */}
          <Link
            href="/sectors"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sectors
          </Link>

          {/* HERO SECTION */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT: Sector info */}
              <div className="lg:col-span-5">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {sector.sector}
                </h1>
                <p className="text-lg text-gray-500 mb-6">
                  {sector.company_count} companies analyzed
                </p>

                {/* Big NIR number */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-1">Average Nature Impact Ratio</p>
                  <p
                    className="text-6xl font-black mb-2"
                    style={{ color: getNirColor(sector.avg_nir) }}
                  >
                    {(sector.avg_nir * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Rs {(sector.avg_nir * 100).toFixed(1)} consumed from nature per Rs 100 revenue
                  </p>
                </div>

                {/* Status badge */}
                {sector.avg_nir > 1 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg mb-6">
                    <AlertTriangle size={18} />
                    <span className="font-medium">This sector consumes more from nature than it generates</span>
                  </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Avg TAESC</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCr(sector.avg_taesc_cr)}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Companies</p>
                    <p className="text-xl font-bold text-gray-900">
                      {sector.company_count}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Best/Worst + Breakdown */}
              <div className="lg:col-span-7">
                {/* Best and Worst */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Best Company */}
                  <Link
                    href={`/company/${sector.best_company.slug}`}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 hover:border-emerald-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-emerald-600 font-medium">Best Performer</span>
                    </div>
                    <p className="font-bold text-gray-900 group-hover:text-emerald-700 mb-1">
                      {sector.best_company.name}
                    </p>
                    <p className="text-sm text-emerald-600">
                      Score: {sector.best_company.score.toFixed(1)}
                    </p>
                  </Link>

                  {/* Worst Company */}
                  <Link
                    href={`/company/${sector.worst_company.slug}`}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 hover:border-red-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Highest Impact</span>
                    </div>
                    <p className="font-bold text-gray-900 group-hover:text-red-700 mb-1">
                      {sector.worst_company.name}
                    </p>
                    <p className="text-sm text-red-600">
                      Score: {sector.worst_company.score.toFixed(1)}
                    </p>
                  </Link>
                </div>

                {/* Dimension breakdown */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Average Cost Breakdown by Dimension
                  </h3>
                  <WaterfallChartCompact
                    data={waterfallData}
                    total={avgTaesc}
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    Per company average in Rs Crores
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* COMPANIES IN SECTOR */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All {sector.company_count} Companies
              </h2>
              <Link
                href={`/rankings?sector=${encodeURIComponent(sector.sector)}`}
                className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
              >
                View in Rankings <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Company</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">NII Score</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">NIR</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">TAESC</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companies
                      .sort((a, b) => (b.nii_score || 0) - (a.nii_score || 0))
                      .map((company, index) => (
                        <tr key={company.slug} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/company/${company.slug}`}
                              className="font-medium text-gray-900 hover:text-emerald-700"
                            >
                              {company.company_name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {company.nii_score?.toFixed(1) || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className="font-bold"
                              style={{ color: getNirColor(company.nir || 0) }}
                            >
                              {(company.nir_pct || company.nir * 100 || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">
                            {company.taesc_cr?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                company.rating === 'Excellent'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : company.rating === 'Good'
                                  ? 'bg-green-100 text-green-700'
                                  : company.rating === 'Average'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : company.rating === 'Poor'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {company.rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
