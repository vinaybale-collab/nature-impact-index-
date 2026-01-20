'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ArrowUpDown, HelpCircle, Download } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import { useToggle } from '@/context/ToggleContext';
import { getRankingsStatic, getSectorsStatic } from '@/lib/data';
import { downloadAllCompaniesCSV } from '@/lib/export';
import { NiiRating } from '@/types/company';

const rankings = getRankingsStatic();
const sectors = getSectorsStatic();

const ITEMS_PER_PAGE = 50;

// Get impact color based on NIR percentage
function getImpactColor(nir: number): string {
  if (nir > 100) return '#DC2626';
  if (nir > 50) return '#EA580C';
  if (nir > 20) return '#CA8A04';
  if (nir > 5) return '#16A34A';
  return '#059669';
}

// Get score color (higher is better)
function getScoreColor(score: number): string {
  if (score >= 8) return '#059669';
  if (score >= 6) return '#16A34A';
  if (score >= 4) return '#CA8A04';
  if (score >= 2) return '#EA580C';
  return '#DC2626';
}

// Format large numbers
function formatCr(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L Cr`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K Cr`;
  return `${value.toFixed(0)} Cr`;
}

export default function RankingsPage() {
  const { isNiiMode, toggleMode } = useToggle();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'taesc'>('rank');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showNirTooltip, setShowNirTooltip] = useState(false);
  const [showNiiTooltip, setShowNiiTooltip] = useState(false);
  const [showTaescTooltip, setShowTaescTooltip] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredCompanies = useMemo(() => {
    let filtered = [...rankings.companies];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.company_name.toLowerCase().includes(query) ||
          c.sector.toLowerCase().includes(query)
      );
    }

    // Sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter((c) => c.sector === selectedSector);
    }

    // Sort
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.nii_score - a.nii_score);
    } else if (sortBy === 'taesc') {
      filtered.sort((a, b) => b.taesc_cr - a.taesc_cr);
    } else {
      // By rank (default)
      filtered.sort((a, b) => a.rank - b.rank);
    }

    return filtered;
  }, [searchQuery, selectedSector, sortBy]);

  const visibleCompanies = filteredCompanies.slice(0, visibleCount);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAllCompaniesCSV();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-16 pb-16 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Rankings
              </h1>
              <p className="text-gray-600">
                {rankings.total_companies} companies ranked by nature impact
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => !isNiiMode && toggleMode()}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isNiiMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  NII Score
                </button>
                <button
                  onClick={() => isNiiMode && toggleMode()}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !isNiiMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Nature Cost
                </button>
              </div>
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                {isDownloading ? 'Downloading...' : 'Download CSV'}
              </button>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Best Performers (Lowest NIR) */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-3">
                Best Performers (Lowest NIR)
              </h3>
              <div className="space-y-2">
                {rankings.companies.slice(0, 5).map((company, idx) => (
                  <Link
                    key={company.slug}
                    href={`/company/${company.slug}`}
                    className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                        {company.company_name.length > 30
                          ? company.company_name.slice(0, 30) + '...'
                          : company.company_name}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-emerald-600">
                      {(company.nir_pct ?? (company.nir * 100)).toFixed(1)}%
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-emerald-700 italic">
                Note: Low NIR in financial services may reflect sector methodology limitations.
              </p>
            </div>

            {/* Worst Performers (Highest NIR) */}
            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
              <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-3">
                Highest Impact (Highest NIR)
              </h3>
              <div className="space-y-2">
                {[...rankings.companies]
                  .sort((a, b) => (b.nir_pct ?? b.nir * 100) - (a.nir_pct ?? a.nir * 100))
                  .slice(0, 5)
                  .map((company, idx) => (
                  <Link
                    key={company.slug}
                    href={`/company/${company.slug}`}
                    className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-red-700">
                        {company.company_name.length > 30
                          ? company.company_name.slice(0, 30) + '...'
                          : company.company_name}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-red-600">
                      {(company.nir_pct ?? (company.nir * 100)).toFixed(1)}%
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-red-700 italic">
                NIR over 100% means nature cost exceeds revenue.
              </p>
            </div>
          </div>

          {/* Prominent Search Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search for any company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm"
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
                Click on any company to see full breakdown of their nature impact
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Sector and Sort filters */}

            {/* Sector Filter */}
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Sectors</option>
                {sectors.sectors.map((s) => (
                  <option key={s.sector} value={s.sector}>
                    {s.sector}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="rank">By Rank</option>
                <option value="score">By Score</option>
                <option value="taesc">By Impact (Rs Cr)</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            Showing {visibleCompanies.length} of {filteredCompanies.length} companies
          </p>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    {isNiiMode ? (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28 relative">
                        <div className="flex items-center gap-1">
                          <span>NII Score</span>
                          <button
                            onClick={() => setShowNiiTooltip(!showNiiTooltip)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <HelpCircle size={14} />
                          </button>
                          {showNiiTooltip && (
                            <div className="absolute top-full left-0 mt-1 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg normal-case font-normal">
                              <p className="font-medium mb-1">Nature Impact Index Score</p>
                              <p>A 0-10 score measuring environmental performance. Higher scores indicate better (lower) ecosystem impact relative to revenue.</p>
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          )}
                        </div>
                      </th>
                    ) : (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 relative">
                        <div className="flex items-center gap-1">
                          <span>TAESC (Rs Cr)</span>
                          <button
                            onClick={() => setShowTaescTooltip(!showTaescTooltip)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <HelpCircle size={14} />
                          </button>
                          {showTaescTooltip && (
                            <div className="absolute top-full left-0 mt-1 z-10 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg normal-case font-normal">
                              <p className="font-medium mb-1">Total Annual Ecosystem Service Cost</p>
                              <p>The monetary value of nature consumed by the company annually, calculated from climate, water, land, biodiversity, pollution, and energy dimensions.</p>
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          )}
                        </div>
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 relative">
                      <div className="flex items-center gap-1">
                        <span>NIR</span>
                        <button
                          onClick={() => setShowNirTooltip(!showNirTooltip)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <HelpCircle size={14} />
                        </button>
                        {showNirTooltip && (
                          <div className="absolute top-full left-0 mt-1 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg normal-case font-normal">
                            <p className="font-medium mb-1">Nature Impact Ratio (NIR)</p>
                            <p>Rs consumed from nature per Rs 100 of revenue. Values over 100% mean the company takes more from nature than it generates in revenue.</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleCompanies.map((company) => {
                    const nirPct = company.nir_pct ?? (company.nir * 100);

                    return (
                      <tr
                        key={company.slug}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-gray-500 text-sm">
                            #{company.rank}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <Link
                            href={`/company/${company.slug}`}
                            className="font-medium text-gray-900 hover:text-emerald-600 transition-colors block truncate"
                            title={company.company_name}
                          >
                            {company.company_name}
                          </Link>
                        </td>
                        {isNiiMode ? (
                          <td className="px-4 py-4">
                            <span
                              className="font-mono font-semibold"
                              style={{ color: getScoreColor(company.nii_score) }}
                            >
                              {company.nii_score.toFixed(1)}
                            </span>
                          </td>
                        ) : (
                          <td className="px-4 py-4">
                            <span className="font-mono text-gray-700">
                              {company.taesc_cr.toLocaleString()}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-4">
                          <span
                            className="font-mono font-semibold"
                            style={{ color: getImpactColor(nirPct) }}
                          >
                            {nirPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/sectors`}
                            className="text-gray-600 text-sm hover:text-emerald-600"
                          >
                            {company.sector}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <Badge rating={company.rating as NiiRating} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load More */}
          {visibleCount < filteredCompanies.length && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="btn btn-secondary"
              >
                Load More ({filteredCompanies.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
