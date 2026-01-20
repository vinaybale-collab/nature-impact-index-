'use client';

import { useEffect, useState, useRef } from 'react';

interface ImpactBarProps {
  value: number;
  max?: number;
  showOverflow?: boolean;
  label?: string;
  sublabel?: string;
  animate?: boolean;
  className?: string;
}

function getImpactColor(value: number): string {
  if (value > 100) return '#DC2626'; // Critical - Red
  if (value > 50) return '#EA580C';  // High - Orange
  if (value > 20) return '#CA8A04';  // Moderate - Yellow
  if (value > 5) return '#16A34A';   // Good - Green
  return '#059669';                  // Excellent - Emerald
}

function getImpactLabel(value: number): string {
  if (value > 100) return 'Nature Debtor';
  if (value > 50) return 'High Impact';
  if (value > 20) return 'Moderate';
  if (value > 5) return 'Low Impact';
  return 'Excellent';
}

export default function ImpactBar({
  value,
  max = 100,
  showOverflow = true,
  label,
  sublabel,
  animate = true,
  className = '',
}: ImpactBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) {
      setWidth(Math.min(value, max));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            setWidth(Math.min(value, max));
          }, 100);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, max, animate]);

  const color = getImpactColor(value);
  const percentage = (width / max) * 100;
  const isOverflow = value > max;

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {/* Labels */}
      {(label || sublabel) && (
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-medium text-gray-900">{label}</span>
          <span className="text-sm text-gray-500">{sublabel}</span>
        </div>
      )}

      {/* Bar container */}
      <div className="relative">
        {/* Track */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          {/* Fill */}
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* 100% marker */}
        {showOverflow && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: '100%', transform: 'translateX(-50%)' }}
          />
        )}

        {/* Overflow indicator */}
        {isOverflow && showOverflow && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700">
              +{(value - 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Value display */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">{getImpactLabel(value)}</span>
        <span
          className="text-sm font-semibold"
          style={{ color }}
        >
          {value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// Horizontal comparison bar for multiple companies
interface ComparisonBarProps {
  companies: Array<{
    name: string;
    value: number;
    highlight?: boolean;
  }>;
  max?: number;
  className?: string;
}

export function ComparisonBars({ companies, max, className = '' }: ComparisonBarProps) {
  const maxValue = max || Math.max(...companies.map(c => c.value), 100);

  return (
    <div className={`space-y-4 ${className}`}>
      {companies.map((company, index) => (
        <div key={company.name} className={company.highlight ? 'opacity-100' : 'opacity-70'}>
          <div className="flex justify-between items-baseline mb-1">
            <span className={`text-sm ${company.highlight ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
              {company.name}
            </span>
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: getImpactColor(company.value) }}
            >
              {company.value.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min((company.value / maxValue) * 100, 100)}%`,
                backgroundColor: getImpactColor(company.value),
                transitionDelay: `${index * 100}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
