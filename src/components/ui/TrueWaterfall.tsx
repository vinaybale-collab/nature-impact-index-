'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════════
// TRUE HORIZONTAL WATERFALL CHART
// Bars build from left to right, credits go backward (green), total at end
// ═══════════════════════════════════════════════════════════════════════════════

interface WaterfallBar {
  id: string;
  label: string;
  value: number;           // Positive = cost, Negative = credit
  color: string;
  isCredit?: boolean;
  isTotal?: boolean;
}

interface TrueWaterfallProps {
  bars: WaterfallBar[];
  height?: number;
  showConnectors?: boolean;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

// Format value for display
const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return `${value.toFixed(0)}`;
  }
};

export default function TrueWaterfall({
  bars,
  height = 300,
  showConnectors = true,
  showValues = true,
  animated = true,
  className = '',
}: TrueWaterfallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const [containerWidth, setContainerWidth] = useState(800);

  // Track container width for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setContainerWidth(Math.max(width, 400));
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Chart dimensions
  const padding = { top: 50, right: 20, bottom: 80, left: 20 };
  const chartWidth = containerWidth - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate cumulative positions (left-to-right)
  const maxAbsValue = bars.reduce((max, bar) => Math.max(max, Math.abs(bar.value)), 0);
  const totalValue = bars.filter(b => !b.isTotal).reduce((sum, bar) => sum + bar.value, 0);

  // Calculate bar positions
  const barWidth = Math.min(80, (chartWidth / (bars.length + 0.5)) * 0.7);
  const barGap = (chartWidth - barWidth * bars.length) / (bars.length + 1);

  // Build cumulative data for positioning
  let runningTotal = 0;
  const calculatedBars = bars.map((bar, index) => {
    const startValue = runningTotal;
    const endValue = bar.isTotal ? totalValue : runningTotal + bar.value;
    if (!bar.isTotal) {
      runningTotal += bar.value;
    }

    return {
      ...bar,
      index,
      startValue,
      endValue,
      x: padding.left + barGap * (index + 1) + barWidth * index,
    };
  });

  // Y-axis scale (value to Y position)
  const maxY = Math.max(totalValue, ...calculatedBars.map(b => Math.max(b.startValue, b.endValue)));
  const minY = Math.min(0, ...calculatedBars.map(b => Math.min(b.startValue, b.endValue)));
  const valueRange = maxY - minY || 1;

  const yScale = (value: number) => {
    return padding.top + chartHeight - ((value - minY) / valueRange) * chartHeight;
  };

  // Animation variants
  const barVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: (i: number) => ({
      scaleY: 1,
      opacity: 1,
      transition: {
        delay: i * 0.12,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  const labelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12 + 0.3,
        duration: 0.3,
      },
    }),
  };

  const connectorVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: i * 0.12 + 0.2,
        duration: 0.3,
      },
    }),
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${containerWidth} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Zero line */}
        <line
          x1={padding.left}
          y1={yScale(0)}
          x2={containerWidth - padding.right}
          y2={yScale(0)}
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => {
          const yPos = yScale(maxY * pct);
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={containerWidth - padding.right}
                y2={yPos}
                stroke="#F3F4F6"
                strokeDasharray="4,4"
              />
            </g>
          );
        })}

        {/* Bars and connectors */}
        {calculatedBars.map((bar, index) => {
          const isCredit = bar.isCredit || bar.value < 0;
          const barColor = isCredit ? '#10B981' : bar.color;

          // Bar positioning
          const topY = yScale(Math.max(bar.startValue, bar.endValue));
          const bottomY = yScale(Math.min(bar.startValue, bar.endValue));
          const barHeight = Math.max(bottomY - topY, 2);

          // For credits, the bar grows downward from start
          const transformOrigin = bar.value >= 0 ? 'bottom' : 'top';

          return (
            <g key={bar.id}>
              {/* Connector line from previous bar */}
              {showConnectors && index > 0 && !bar.isTotal && (
                <motion.line
                  x1={calculatedBars[index - 1].x + barWidth}
                  y1={yScale(calculatedBars[index - 1].endValue)}
                  x2={bar.x}
                  y2={yScale(bar.startValue)}
                  stroke="#9CA3AF"
                  strokeWidth={1.5}
                  strokeDasharray="4,2"
                  variants={connectorVariants}
                  initial={animated ? 'hidden' : 'visible'}
                  animate={isInView ? 'visible' : 'hidden'}
                  custom={index}
                />
              )}

              {/* Bar */}
              <motion.rect
                x={bar.x}
                y={topY}
                width={barWidth}
                height={barHeight}
                fill={bar.isTotal ? '#1F2937' : barColor}
                rx={4}
                style={{
                  transformOrigin: `${bar.x + barWidth / 2}px ${transformOrigin === 'bottom' ? bottomY : topY}px`,
                }}
                variants={barVariants}
                initial={animated ? 'hidden' : 'visible'}
                animate={isInView ? 'visible' : 'hidden'}
                custom={index}
              />

              {/* Value label above/below bar */}
              {showValues && (
                <motion.text
                  x={bar.x + barWidth / 2}
                  y={bar.value >= 0 || bar.isTotal ? topY - 8 : bottomY + 16}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill={bar.isTotal ? '#1F2937' : barColor}
                  variants={labelVariants}
                  initial={animated ? 'hidden' : 'visible'}
                  animate={isInView ? 'visible' : 'hidden'}
                  custom={index}
                >
                  {isCredit && !bar.isTotal ? '-' : '+'}{formatValue(Math.abs(bar.value))}
                </motion.text>
              )}

              {/* Label below chart */}
              <motion.text
                x={bar.x + barWidth / 2}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className={`text-xs ${bar.isTotal ? 'font-bold' : 'font-medium'}`}
                fill={bar.isTotal ? '#1F2937' : '#374151'}
                variants={labelVariants}
                initial={animated ? 'hidden' : 'visible'}
                animate={isInView ? 'visible' : 'hidden'}
                custom={index}
              >
                {bar.label}
              </motion.text>

              {/* Percentage below label (skip for total) */}
              {!bar.isTotal && (
                <motion.text
                  x={bar.x + barWidth / 2}
                  y={height - padding.bottom + 35}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#9CA3AF"
                  variants={labelVariants}
                  initial={animated ? 'hidden' : 'visible'}
                  animate={isInView ? 'visible' : 'hidden'}
                  custom={index}
                >
                  {((Math.abs(bar.value) / totalValue) * 100).toFixed(0)}%
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Connector to total */}
        {showConnectors && calculatedBars.length > 1 && (
          <motion.line
            x1={calculatedBars[calculatedBars.length - 2].x + barWidth}
            y1={yScale(calculatedBars[calculatedBars.length - 2].endValue)}
            x2={calculatedBars[calculatedBars.length - 1].x}
            y2={yScale(totalValue)}
            stroke="#9CA3AF"
            strokeWidth={1.5}
            strokeDasharray="4,2"
            variants={connectorVariants}
            initial={animated ? 'hidden' : 'visible'}
            animate={isInView ? 'visible' : 'hidden'}
            custom={calculatedBars.length - 1}
          />
        )}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIMENSION WATERFALL - 6 dimensions for hero section
// ═══════════════════════════════════════════════════════════════════════════════

interface DimensionData {
  name: string;
  value: number;
  color: string;
}

interface DimensionWaterfallProps {
  dimensions: DimensionData[];
  total: number;
  height?: number;
  className?: string;
}

export function DimensionWaterfall({
  dimensions,
  total,
  height = 280,
  className = '',
}: DimensionWaterfallProps) {
  // Convert dimensions to waterfall bars
  const bars: WaterfallBar[] = [
    ...dimensions.map((dim, i) => ({
      id: `dim-${i}`,
      label: dim.name,
      value: dim.value,
      color: dim.color,
    })),
    {
      id: 'total',
      label: 'TOTAL',
      value: total,
      color: '#1F2937',
      isTotal: true,
    },
  ];

  return (
    <TrueWaterfall
      bars={bars}
      height={height}
      showConnectors={true}
      showValues={true}
      animated={true}
      className={className}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAILED WATERFALL - All sub-components (for breakdown section)
// ═══════════════════════════════════════════════════════════════════════════════

interface SubComponent {
  name: string;
  value: number;
  isCredit?: boolean;
}

interface DimensionWithSubs {
  name: string;
  value: number;
  color: string;
  subComponents: SubComponent[];
}

interface DetailedWaterfallProps {
  dimensions: DimensionWithSubs[];
  total: number;
  height?: number;
  className?: string;
}

export function DetailedWaterfall({
  dimensions,
  total,
  height = 400,
  className = '',
}: DetailedWaterfallProps) {
  // Flatten all sub-components into sequential bars
  const bars: WaterfallBar[] = [];

  dimensions.forEach((dim, dimIndex) => {
    // Add each sub-component as a bar
    dim.subComponents.forEach((sub, subIndex) => {
      const isCredit = sub.isCredit || sub.value < 0;
      bars.push({
        id: `${dim.name}-${subIndex}`,
        label: sub.name.length > 12 ? sub.name.slice(0, 10) + '..' : sub.name,
        value: sub.value,
        color: isCredit ? '#10B981' : dim.color,
        isCredit,
      });
    });
  });

  // Add total bar
  bars.push({
    id: 'total',
    label: 'TOTAL',
    value: total,
    color: '#1F2937',
    isTotal: true,
  });

  // Calculate dynamic height based on number of bars
  const dynamicHeight = Math.max(height, 300);

  return (
    <TrueWaterfall
      bars={bars}
      height={dynamicHeight}
      showConnectors={true}
      showValues={true}
      animated={true}
      className={className}
    />
  );
}
