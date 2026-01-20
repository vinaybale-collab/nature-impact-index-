'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, Mail, Share2, Search, TrendingUp, FileText, Users, AlertTriangle, Building2 } from 'lucide-react';

// Hero images for carousel
const HERO_IMAGES = [
  '/images/hero/bavarian-forest-3385966_1920.jpg',
  '/images/hero/karsten-winegeart-Y4pW7n5FnsQ-unsplash.jpg',
  '/images/hero/pallavi-gondane-KdFi3mMepM0-unsplash.jpg',
  '/images/hero/renaldo-matamoro-Q4uhNoJNVqs-unsplash.jpg',
  '/images/hero/renaldo-matamoro-utGAO-2wabA-unsplash.jpg',
  '/images/hero/zoshua-colah-MajkDPV076s-unsplash.jpg',
];
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CountUp from '@/components/ui/CountUp';
import { ComparisonBars } from '@/components/ui/ImpactBar';
import { Metadata, RankingsData, SectorsData } from '@/types/company';
import { downloadAllCompaniesCSV, shareCurrentPage } from '@/lib/export';
import WaterfallChart, { WaterfallChartCompact } from '@/components/ui/WaterfallChart';
import SectorBarChart from '@/components/ui/SectorBarChart';

// Nature's Debtors - companies where ecosystem cost > revenue (NIR > 100%)
const NATURES_DEBTORS = [
  { name: 'Adani Power', value: 234.2, slug: 'adani-power-limited' },
  { name: 'NTPC Limited', value: 186.8, slug: 'ntpc-limited' },
  { name: 'Vedanta Limited', value: 169.8, slug: 'vedanta-limited' },
  { name: 'Tata Steel', value: 156.3, slug: 'tata-steel-limited' },
  { name: 'JSW Steel', value: 142.7, slug: 'jsw-steel-limited' },
  { name: 'Hindalco', value: 138.4, slug: 'hindalco-industries-limited' },
  { name: 'Coal India', value: 127.3, slug: 'coal-india-limited' },
  { name: 'Tata Power', value: 313.9, slug: 'tata-power' },
  { name: 'GAIL India', value: 118.2, slug: 'gail-india-limited' },
  { name: 'Oil India', value: 115.7, slug: 'oil-india-limited' },
  { name: 'IOCL', value: 112.4, slug: 'indian-oil-corporation-limited' },
  { name: 'BPCL', value: 108.6, slug: 'bharat-petroleum-corporation-limited' },
  { name: 'HPCL', value: 106.9, slug: 'hindustan-petroleum-corporation-limited' },
  { name: 'ACC Limited', value: 104.2, slug: 'acc-limited' },
  { name: 'Ambuja Cements', value: 102.8, slug: 'ambuja-cements-limited' },
].sort((a, b) => b.value - a.value);

// Dimension breakdown data for waterfall chart
const DIMENSIONS_WATERFALL = [
  { name: 'Climate', color: '#F97316', value: 1815776, description: 'GHG emissions (Scope 1, 2, 3)' },
  { name: 'Pollution', color: '#8B5CF6', value: 526724, description: 'Waste, air pollutants, e-waste' },
  { name: 'Biodiversity', color: '#10B981', value: 427272, description: 'MSA loss, PA proximity' },
  { name: 'Energy', color: '#EF4444', value: 229633, description: 'Resource depletion' },
  { name: 'Water', color: '#3B82F6', value: 143944, description: 'Consumption & stress' },
  { name: 'Land', color: '#84CC16', value: 94156, description: 'Footprint & degradation' },
];

const TOTAL_TAESC = 3237505; // Rs Cr


function formatLakhCr(value: number): string {
  const lakhCr = value / 100000;
  return lakhCr >= 10 ? `${lakhCr.toFixed(0)}` : `${lakhCr.toFixed(1)}`;
}

// Sector data type for the chart
interface SectorChartData {
  name: string;
  slug: string;
  nir: number;
  companyCount: number;
}

export default function HomePage() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [sectors, setSectors] = useState<SectorChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate hero images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [metaRes, sectorsRes] = await Promise.all([
          fetch('/data/metadata.json'),
          fetch('/data/sectors.json'),
        ]);

        const meta = await metaRes.json();
        const sectorsData = await sectorsRes.json();

        setMetadata(meta);

        // Transform sectors data for the chart
        const sectorsList = sectorsData.sectors.map((s: any) => ({
          name: s.sector,
          slug: s.slug,
          nir: s.avg_nir || s.median_nir || 0,
          companyCount: s.company_count,
        }));
        setSectors(sectorsList);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle CSV download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAllCompaniesCSV();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    const success = await shareCurrentPage();
    if (success) {
      setShareMessage('Link copied!');
      setTimeout(() => setShareMessage(''), 2000);
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

      <main>
        {/* ═══════════════════════════════════════════════════════════════════
            ACT 1: HERO SECTION (Asymmetric Layout)
            LEFT: Message | RIGHT: Image + CTAs
            ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-20 px-4 lg:px-6 min-h-[90vh] flex items-center">
        <div className="max-w-[1800px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT: Message + CTAs (5 cols) */}
            <div className="lg:col-span-5 text-left animate-fade-in">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-gothic uppercase tracking-wide text-gray-900 mb-6 leading-tight">
                India Nature<br />
                <span className="text-emerald-700">Impact Index</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Measuring the true cost of business on nature.
              </p>

              <div className="mb-8">
                <p className="text-lg text-gray-500 mb-2">
                  For every Rs 100 of revenue,
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl lg:text-9xl font-black text-red-600">
                    <CountUp end={23} duration={2000} decimals={0} />
                  </span>
                  <span className="text-3xl font-bold text-gray-700">Rupees</span>
                </div>
                <p className="text-lg text-gray-500 mt-2">
                  is consumed from nature <span className="font-semibold text-emerald-700">almost for free</span>.
                </p>
              </div>

              <p className="text-lg text-gray-600 mb-6">
                We analyzed <span className="font-bold text-gray-900">{metadata?.total_companies || 516}</span> Indian companies across{' '}
                <span className="font-bold text-gray-900">{metadata?.total_sectors || 29}</span> sectors.
              </p>

              {/* CTA Buttons - now on LEFT side */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/rankings"
                  className="btn btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg"
                >
                  Explore Rankings
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/methodology"
                  className="btn btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg"
                >
                  How We Calculate
                </Link>
              </div>
            </div>

            {/* RIGHT: Rotating Hero Image (7 cols - larger) */}
            <div className="lg:col-span-7 relative animate-slide-up">
              <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                {HERO_IMAGES.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt="Nature and ecosystems"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                    className={`object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    quality={85}
                  />
                ))}
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 2: NATURE'S DEBTORS (Asymmetric Layout)
          LEFT: Message | RIGHT: Company bars
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* LEFT: Message (35%) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-xl font-bold text-red-700">
                  If nature charged market rates...
                </p>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                these companies would be
              </h2>
              <p className="text-5xl lg:text-6xl font-black text-red-600 mb-6">
                BANKRUPT
              </p>
              <p className="text-lg text-gray-600 mb-8">
                right now.
              </p>

              <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-gray-200 pt-6">
                <AlertTriangle size={18} className="text-red-500" />
                <span>29 companies consume &gt;100% of revenue from nature</span>
              </div>
            </div>

            {/* RIGHT: Company bars (65%) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Company</span>
                  <span className="text-sm font-medium text-gray-500">NIR (% of Revenue)</span>
                </div>

                {/* Company bars */}
                <div className="space-y-4">
                  {NATURES_DEBTORS.map((company, index) => (
                    <Link
                      key={company.name}
                      href={`/company/${company.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {company.name}
                        </span>
                        <span className="font-bold text-red-600">{company.value.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                          style={{ width: `${Math.min((company.value / 350) * 100, 100)}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* 100% threshold line indicator */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-300 relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-400"
                        style={{ left: `${(100 / 350) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">100% = Revenue threshold</span>
                  </div>
                </div>

                {/* See all link */}
                <div className="mt-6 text-center">
                  <Link
                    href="/rankings?filter=debtors"
                    className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    See all 29 Nature&apos;s Debtors
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 3: THE BREAKDOWN (Asymmetric Layout)
          LEFT: Big statement | RIGHT: Waterfall chart
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* LEFT: Big statement (35%) */}
            <div className="lg:col-span-4">
              <p className="text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
                Rs {formatLakhCr(metadata?.statistics?.total_taesc_cr || TOTAL_TAESC)}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-6">
                Lakh Crore
              </p>

              <p className="text-xl text-gray-600 mb-4">
                Consumed from nature by{' '}
                <span className="font-bold text-gray-900">{metadata?.total_companies || 516}</span> companies in one year.
              </p>

              {/* GDP and Budget Comparison */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-lg font-bold text-amber-800 mb-2">
                  That&apos;s ~12% of India&apos;s GDP
                </p>
                <p className="text-sm text-amber-700">
                  Union Budget FY25: Rs 48 lakh crore
                </p>
                <p className="text-sm text-amber-700">
                  Nature&apos;s bill from just 516 companies: Rs 32 lakh crore
                </p>
              </div>

              <div className="space-y-4 text-sm text-gray-500 border-t border-gray-200 pt-6">
                <p className="font-medium text-gray-700">Six dimensions of impact:</p>
                {DIMENSIONS_WATERFALL.map((dim) => (
                  <div key={dim.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dim.color }}
                    />
                    <span className="font-medium text-gray-700">{dim.name}:</span>
                    <span>{dim.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Waterfall chart (65%) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  How ecosystem costs add up
                </h3>

                {/* Waterfall chart - use compact version for cleaner display */}
                <WaterfallChartCompact
                  data={DIMENSIONS_WATERFALL}
                  total={TOTAL_TAESC}
                  className="mb-6"
                />

                {/* Bottom annotation */}
                <div className="pt-4 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-500">
                    Values in Rs Crores. Based on FY2024 reported data and sector-specific coefficients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 4: SECTOR COMPARISON (Asymmetric Layout)
          LEFT: Message | RIGHT: All 29 sectors bar chart
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 lg:px-8 bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* LEFT: Message (35%) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <p className="text-lg text-gray-500 mb-4">Some industries</p>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                take more than they give.
              </h2>

              <p className="text-xl text-gray-600 mb-8">
                {sectors.filter((s) => s.nir > 1).length} sectors consume more from nature than they generate in economic value.
              </p>

              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <p className="text-sm text-red-700 font-medium mb-2">
                  Sectors exceeding 100% threshold:
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {sectors
                    .filter((s) => s.nir > 1)
                    .sort((a, b) => b.nir - a.nir)
                    .slice(0, 5)
                    .map((s) => (
                      <li key={s.slug}>
                        {s.name}: {(s.nir * 100).toFixed(1)}%
                      </li>
                    ))}
                </ul>
              </div>

              <Link
                href="/sectors"
                className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium"
              >
                View detailed sector analysis
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* RIGHT: Sector bar chart (65%) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  All {sectors.length || 29} Sectors by Nature Impact Ratio
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Showing ecosystem cost as percentage of revenue. Click any sector to explore.
                </p>

                {sectors.length > 0 ? (
                  <SectorBarChart
                    sectors={sectors}
                    highlightThreshold={1}
                    showAll={true}
                    className="mb-4"
                  />
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    Loading sectors...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 5: CALL TO ACTION - What Will You Do?
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What will you do with this knowledge?
            </h2>
            <p className="text-xl text-gray-600">
              This data is free and open. Use it to drive change.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Investor */}
            <div className="persona-card group hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Investor</h3>
              <p className="text-gray-600 mb-6">
                Screen your portfolio for nature risk
              </p>
              <Link
                href="/rankings"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                Explore <ArrowRight size={16} />
              </Link>
            </div>

            {/* Researcher */}
            <div className="persona-card group hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Researcher</h3>
              <p className="text-gray-600 mb-6">
                Download the full dataset
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
              >
                {downloading ? 'Downloading...' : 'Download'} <Download size={16} />
              </button>
            </div>

            {/* Journalist */}
            <div className="persona-card group hover:border-orange-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Journalist</h3>
              <p className="text-gray-600 mb-6">
                Investigate the data
              </p>
              <a
                href="mailto:vinay@urvara.life?subject=Nature Impact Index Inquiry"
                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
              >
                Contact <Mail size={16} />
              </a>
            </div>

            {/* Activist */}
            <div className="persona-card group hover:border-green-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activist</h3>
              <p className="text-gray-600 mb-6">
                Campaign for transparency
              </p>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
              >
                {shareMessage || 'Share'} <Share2 size={16} />
              </button>
            </div>

            {/* Companies - Highlighted upsell card */}
            <div className="persona-card group hover:border-emerald-400 hover:shadow-xl transition-all border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Companies</h3>
              <p className="text-gray-600 mb-6">
                Want a detailed ground-up assessment?
              </p>
              <a
                href="mailto:vinay@urvara.life?subject=Detailed Nature Impact Assessment Request"
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Contact Us <Mail size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          METHODOLOGY TEASER
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-emerald-50 border-y border-emerald-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Transparent. Rigorous. Open.
          </h2>
          <p className="text-gray-700 mb-8">
            Our methodology is based on UN SEEA standards, enhanced with MSA biodiversity metrics.
            Every coefficient is documented and traceable.
          </p>
          <Link
            href="/methodology"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            Read Our Methodology
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
