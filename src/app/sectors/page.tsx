'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { downloadSectorsCSV } from '@/lib/export';

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

export default function SectorsPage() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sortBy, setSortBy] = useState<'nir' | 'taesc' | 'companies'>('nir');

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/sectors.json');
        const data = await response.json();
        setSectors(data.sectors || []);
      } catch (error) {
        console.error('Failed to load sectors:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sort sectors
  const sortedSectors = [...sectors].sort((a, b) => {
    if (sortBy === 'nir') return b.avg_nir - a.avg_nir;
    if (sortBy === 'taesc') return (b.avg_taesc_cr * b.company_count) - (a.avg_taesc_cr * a.company_count);
    return b.company_count - a.company_count;
  });

  // Count sectors above threshold
  const sectorsAbove100 = sectors.filter(s => s.avg_nir > 1).length;
  const totalTaesc = sectors.reduce((sum, s) => sum + (s.avg_taesc_cr * s.company_count), 0);

  // Handle download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadSectorsCSV();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Sectors
                </h1>
                <p className="text-lg text-gray-600">
                  Environmental impact across {sectors.length} industry sectors
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                {downloading ? 'Downloading...' : 'Download CSV'}
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Total Sectors</p>
                <p className="text-2xl font-bold text-gray-900">{sectors.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Total TAESC</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalTaesc / 100000).toFixed(1)}L Cr
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-600 mb-1">Above 100% NIR</p>
                <p className="text-2xl font-bold text-red-600">{sectorsAbove100} sectors</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm text-emerald-600 mb-1">Best Performer</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {sortedSectors[sortedSectors.length - 1]?.sector?.split(' ')[0] || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Instruction */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
            <p className="text-emerald-800 text-center font-medium">
              Click on any sector for detailed analysis of companies within that sector
            </p>
          </div>

          {/* Table Section */}
          <div className="mb-12">
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Sort controls */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('nir')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === 'nir'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      NIR
                    </button>
                    <button
                      onClick={() => setSortBy('taesc')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === 'taesc'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      TAESC
                    </button>
                    <button
                      onClick={() => setSortBy('companies')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === 'companies'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Companies
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Sector</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Companies</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">NIR</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">TAESC</th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedSectors.map((sector) => {
                        const slug = generateSlug(sector.sector);
                        return (
                        <tr key={slug} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/sector/${slug}`}
                              className="font-medium text-gray-900 hover:text-emerald-700 flex items-center gap-2"
                            >
                              <div
                                className="w-2 h-6 rounded-full"
                                style={{ backgroundColor: getNirColor(sector.avg_nir) }}
                              />
                              {sector.sector}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {sector.company_count}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className="font-bold"
                              style={{ color: getNirColor(sector.avg_nir) }}
                            >
                              {(sector.avg_nir * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">
                            {(() => {
                              const total = sector.avg_taesc_cr * sector.company_count;
                              return total >= 100000
                                ? `${(total / 100000).toFixed(1)}L`
                                : total >= 1000
                                ? `${(total / 1000).toFixed(1)}K`
                                : total.toFixed(0);
                            })()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {sector.avg_nir > 1 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                <AlertTriangle size={12} />
                                Critical
                              </span>
                            ) : sector.avg_nir > 0.5 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                High
                              </span>
                            ) : sector.avg_nir > 0.2 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                Moderate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Good
                              </span>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Link
              href="/rankings"
              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium text-lg"
            >
              View all 516 companies
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
