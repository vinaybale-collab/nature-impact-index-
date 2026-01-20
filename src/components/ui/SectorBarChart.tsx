'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

interface SectorData {
  name: string;
  slug: string;
  nir: number;
  companyCount: number;
}

interface SectorBarChartProps {
  sectors: SectorData[];
  highlightThreshold?: number;
  maxBars?: number;
  showAll?: boolean;
  className?: string;
}

// Color scale based on NIR
const getColor = (nir: number): string => {
  if (nir > 1) return '#DC2626'; // Critical - red
  if (nir > 0.5) return '#EA580C'; // High - orange
  if (nir > 0.2) return '#CA8A04'; // Moderate - yellow
  if (nir > 0.05) return '#16A34A'; // Good - green
  return '#059669'; // Excellent - emerald
};

export default function SectorBarChart({
  sectors,
  highlightThreshold = 1, // 100%
  maxBars = 10,
  showAll = false,
  className = '',
}: SectorBarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Sort by NIR descending
  const sortedSectors = [...sectors].sort((a, b) => b.nir - a.nir);
  const displaySectors = showAll ? sortedSectors : sortedSectors.slice(0, maxBars);
  const maxNir = Math.max(...sectors.map((s) => s.nir), highlightThreshold * 1.2);

  // Find threshold line position
  const thresholdPct = (highlightThreshold / maxNir) * 100;

  return (
    <div ref={ref} className={className}>
      <div className="relative">
        {/* Threshold indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
          style={{ left: `${thresholdPct}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
              100% threshold
            </span>
          </div>
        </div>

        {/* Bars */}
        <div className="space-y-3">
          {displaySectors.map((sector, index) => {
            const widthPct = Math.min((sector.nir / maxNir) * 100, 100);
            const isAboveThreshold = sector.nir > highlightThreshold;
            const color = getColor(sector.nir);

            return (
              <motion.div
                key={sector.slug}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={`/sector/${sector.slug}`}
                  className={`block group ${
                    isAboveThreshold ? 'bg-red-50 -mx-2 px-2 py-1 rounded-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium truncate max-w-[60%] group-hover:text-emerald-700 transition-colors ${
                        isAboveThreshold ? 'text-red-700' : 'text-gray-900'
                      }`}
                    >
                      {sector.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isAboveThreshold ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      {(sector.nir * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${widthPct}%` } : { width: 0 }}
                      transition={{
                        delay: index * 0.05 + 0.1,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                    >
                      <span className="text-xs text-white font-bold">
                        {sector.companyCount}
                      </span>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {/* Company count explanation */}
        <p className="text-xs text-gray-500">
          Number in bar = company count in sector
        </p>

        {/* Color legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-gray-600">&gt;100% (Critical)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-600" />
            <span className="text-gray-600">50-100% (High)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <span className="text-gray-600">20-50% (Moderate)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-gray-600">5-20% (Good)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-gray-600">&lt;5% (Excellent)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact horizontal list for landing page
export function SectorList({
  sectors,
  maxDisplay = 5,
  className = '',
}: {
  sectors: SectorData[];
  maxDisplay?: number;
  className?: string;
}) {
  const sortedSectors = [...sectors].sort((a, b) => b.nir - a.nir);
  const aboveThreshold = sortedSectors.filter((s) => s.nir > 1);
  const displaySectors = sortedSectors.slice(0, maxDisplay);

  return (
    <div className={className}>
      {aboveThreshold.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            {aboveThreshold.length} sectors consume &gt;100% of revenue from nature
          </p>
        </div>
      )}

      <div className="space-y-2">
        {displaySectors.map((sector) => (
          <Link
            key={sector.slug}
            href={`/sector/${sector.slug}`}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-8 rounded-full"
                style={{ backgroundColor: getColor(sector.nir) }}
              />
              <div>
                <p className="font-medium text-gray-900">{sector.name}</p>
                <p className="text-xs text-gray-500">{sector.companyCount} companies</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  sector.nir > 1 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {(sector.nir * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">of revenue</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
