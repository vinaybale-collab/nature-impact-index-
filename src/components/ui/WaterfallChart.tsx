'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface WaterfallItem {
  name: string;
  value: number;
  color: string;
  description?: string;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  total: number;
  height?: number;
  showLabels?: boolean;
  showConnectors?: boolean;
  animated?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

// Default formatter for Indian Rupees in Crores/Lakh Crores
const defaultFormatValue = (value: number): string => {
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L Cr`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K Cr`;
  } else {
    return `${value.toFixed(0)} Cr`;
  }
};

export default function WaterfallChart({
  data,
  total,
  height = 400,
  showLabels = true,
  showConnectors = true,
  animated = true,
  formatValue = defaultFormatValue,
  className = '',
}: WaterfallChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [dimensions, setDimensions] = useState({ width: 600, height });

  // Calculate cumulative values for positioning
  const cumulativeData = data.reduce((acc, item, index) => {
    const prevCumulative = index > 0 ? acc[index - 1].cumulative : 0;
    return [
      ...acc,
      {
        ...item,
        start: prevCumulative,
        end: prevCumulative + item.value,
        cumulative: prevCumulative + item.value,
      },
    ];
  }, [] as (WaterfallItem & { start: number; end: number; cumulative: number })[]);

  // Chart dimensions
  const padding = { top: 40, right: 120, bottom: 60, left: 60 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;

  // Scale functions
  const maxValue = Math.max(total, ...cumulativeData.map((d) => d.cumulative));
  const yScale = (value: number) => chartHeight - (value / maxValue) * chartHeight;
  const barWidth = Math.min(60, chartWidth / (data.length + 1) - 10);
  const xScale = (index: number) =>
    (index * chartWidth) / data.length + chartWidth / data.length / 2 - barWidth / 2;

  // Animation variants
  const barVariants = {
    hidden: { scaleY: 0 },
    visible: (i: number) => ({
      scaleY: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const connectorVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: i * 0.15 + 0.3,
        duration: 0.3,
      },
    }),
  };

  const labelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15 + 0.4,
        duration: 0.3,
      },
    }),
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
        style={{ maxHeight: height }}
      >
        {/* Background grid lines */}
        <g className="text-gray-200">
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - pct)}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * (1 - pct)}
              stroke="currentColor"
              strokeDasharray="4,4"
            />
          ))}
        </g>

        {/* Y-axis labels */}
        <g className="text-gray-500 text-xs">
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <text
              key={pct}
              x={padding.left - 10}
              y={padding.top + chartHeight * (1 - pct) + 4}
              textAnchor="end"
              fill="currentColor"
            >
              {formatValue(maxValue * pct)}
            </text>
          ))}
        </g>

        {/* Zero line */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#374151"
          strokeWidth={2}
        />

        {/* Waterfall bars */}
        {cumulativeData.map((item, index) => {
          const x = padding.left + xScale(index);
          const barHeight = Math.abs(yScale(item.start) - yScale(item.end));
          const y = padding.top + Math.min(yScale(item.start), yScale(item.end));

          return (
            <g key={item.name}>
              {/* Connector line from previous bar */}
              {showConnectors && index > 0 && (
                <motion.line
                  x1={padding.left + xScale(index - 1) + barWidth}
                  y1={padding.top + yScale(cumulativeData[index - 1].cumulative)}
                  x2={x}
                  y2={padding.top + yScale(item.start)}
                  stroke="#9CA3AF"
                  strokeWidth={1}
                  strokeDasharray="4,2"
                  variants={connectorVariants}
                  initial={animated ? 'hidden' : 'visible'}
                  animate={isInView ? 'visible' : 'hidden'}
                  custom={index}
                />
              )}

              {/* Bar */}
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color}
                rx={4}
                style={{ originY: 1 }}
                variants={barVariants}
                initial={animated ? 'hidden' : 'visible'}
                animate={isInView ? 'visible' : 'hidden'}
                custom={index}
              />

              {/* Value label on bar */}
              {showLabels && (
                <motion.text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill={item.color}
                  variants={labelVariants}
                  initial={animated ? 'hidden' : 'visible'}
                  animate={isInView ? 'visible' : 'hidden'}
                  custom={index}
                >
                  +{formatValue(item.value)}
                </motion.text>
              )}

              {/* X-axis label */}
              <motion.text
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                className="text-xs font-medium"
                fill="#374151"
                variants={labelVariants}
                initial={animated ? 'hidden' : 'visible'}
                animate={isInView ? 'visible' : 'hidden'}
                custom={index}
              >
                {item.name}
              </motion.text>

              {/* Percentage label below name */}
              <motion.text
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 35}
                textAnchor="middle"
                className="text-xs"
                fill="#6B7280"
                variants={labelVariants}
                initial={animated ? 'hidden' : 'visible'}
                animate={isInView ? 'visible' : 'hidden'}
                custom={index}
              >
                {((item.value / total) * 100).toFixed(1)}%
              </motion.text>
            </g>
          );
        })}

        {/* Total bar */}
        <g>
          <motion.rect
            x={padding.left + xScale(data.length)}
            y={padding.top + yScale(total)}
            width={barWidth}
            height={chartHeight - yScale(total)}
            fill="#1F2937"
            rx={4}
            style={{ originY: 1 }}
            variants={barVariants}
            initial={animated ? 'hidden' : 'visible'}
            animate={isInView ? 'visible' : 'hidden'}
            custom={data.length}
          />

          <motion.text
            x={padding.left + xScale(data.length) + barWidth / 2}
            y={padding.top + yScale(total) - 8}
            textAnchor="middle"
            className="text-sm font-bold"
            fill="#1F2937"
            variants={labelVariants}
            initial={animated ? 'hidden' : 'visible'}
            animate={isInView ? 'visible' : 'hidden'}
            custom={data.length}
          >
            {formatValue(total)}
          </motion.text>

          <motion.text
            x={padding.left + xScale(data.length) + barWidth / 2}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            className="text-xs font-bold"
            fill="#1F2937"
            variants={labelVariants}
            initial={animated ? 'hidden' : 'visible'}
            animate={isInView ? 'visible' : 'hidden'}
            custom={data.length}
          >
            TOTAL
          </motion.text>
        </g>

        {/* Final connector to total */}
        {showConnectors && cumulativeData.length > 0 && (
          <motion.line
            x1={padding.left + xScale(data.length - 1) + barWidth}
            y1={padding.top + yScale(cumulativeData[data.length - 1].cumulative)}
            x2={padding.left + xScale(data.length)}
            y2={padding.top + yScale(total)}
            stroke="#9CA3AF"
            strokeWidth={1}
            strokeDasharray="4,2"
            variants={connectorVariants}
            initial={animated ? 'hidden' : 'visible'}
            animate={isInView ? 'visible' : 'hidden'}
            custom={data.length}
          />
        )}
      </svg>
    </div>
  );
}

// Compact version for smaller spaces
export function WaterfallChartCompact({
  data,
  total,
  className = '',
}: {
  data: WaterfallItem[];
  total: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={`space-y-2 ${className}`}>
      {data.map((item, index) => {
        const pct = (item.value / total) * 100;
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${pct}%` } : { width: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 w-20 text-right">
              {item.value >= 100000
                ? `${(item.value / 100000).toFixed(1)}L Cr`
                : item.value >= 1000
                ? `${(item.value / 1000).toFixed(1)}K Cr`
                : `${item.value.toFixed(0)} Cr`}
            </span>
          </motion.div>
        );
      })}

      {/* Total row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: data.length * 0.1 + 0.3, duration: 0.3 }}
        className="flex items-center gap-3 pt-3 border-t border-gray-200 mt-3"
      >
        <div className="w-3 h-3 rounded-full bg-gray-900 flex-shrink-0" />
        <span className="flex-1 text-sm font-bold text-gray-900">TOTAL</span>
        <span className="text-sm font-bold text-gray-900 w-20 text-right">
          {total >= 100000
            ? `${(total / 100000).toFixed(1)}L Cr`
            : total >= 1000
            ? `${(total / 1000).toFixed(1)}K Cr`
            : `${total.toFixed(0)} Cr`}
        </span>
      </motion.div>
    </div>
  );
}

// Super detailed version showing all sub-components
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

interface WaterfallChartDetailedProps {
  dimensions: DimensionWithSubs[];
  total: number;
  className?: string;
}

const formatCr = (value: number): string => {
  if (Math.abs(value) >= 100000) {
    return `${(value / 100000).toFixed(1)}L Cr`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K Cr`;
  } else {
    return `${value.toFixed(0)} Cr`;
  }
};

export function WaterfallChartDetailed({
  dimensions,
  total,
  className = '',
}: WaterfallChartDetailedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set(dimensions.map(d => d.name)));

  const toggleDimension = (name: string) => {
    setExpandedDims(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  let animationIndex = 0;

  return (
    <div ref={ref} className={`space-y-1 ${className}`}>
      {dimensions.map((dim) => {
        const isExpanded = expandedDims.has(dim.name);
        const dimPct = (dim.value / total) * 100;
        const currentAnimIndex = animationIndex++;

        return (
          <div key={dim.name}>
            {/* Dimension header row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: currentAnimIndex * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2"
              onClick={() => toggleDimension(dim.name)}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: dim.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900 truncate">
                    {dim.name}
                    <span className="ml-2 text-xs text-gray-500">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </span>
                  <span className="text-sm font-medium ml-2" style={{ color: dim.color }}>
                    {dimPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: dim.color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${dimPct}%` } : { width: 0 }}
                    transition={{ delay: currentAnimIndex * 0.05 + 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
              <span className="text-base font-bold w-24 text-right" style={{ color: dim.color }}>
                {formatCr(dim.value)}
              </span>
            </motion.div>

            {/* Sub-components (collapsible) */}
            {isExpanded && dim.subComponents.length > 0 && (
              <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-1 pb-2">
                {dim.subComponents.map((sub) => {
                  const subAnimIndex = animationIndex++;
                  const isCredit = sub.isCredit || sub.value < 0;
                  const displayValue = Math.abs(sub.value);

                  return (
                    <motion.div
                      key={sub.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: subAnimIndex * 0.03, duration: 0.2 }}
                      className={`flex items-center gap-3 py-1.5 px-2 rounded ${
                        isCredit ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCredit ? 'bg-emerald-400' : 'bg-gray-300'
                        }`}
                      />
                      <span className={`flex-1 text-sm ${
                        isCredit ? 'text-emerald-700' : 'text-gray-600'
                      }`}>
                        {sub.name}
                      </span>
                      <span className={`text-sm font-mono w-20 text-right ${
                        isCredit ? 'text-emerald-600 font-medium' : 'text-gray-700'
                      }`}>
                        {isCredit ? '-' : ''}{formatCr(displayValue)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Total row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: animationIndex * 0.03 + 0.2, duration: 0.3 }}
        className="flex items-center gap-3 pt-4 mt-3 border-t-2 border-gray-900"
      >
        <div className="w-4 h-4 rounded-full bg-gray-900 flex-shrink-0" />
        <span className="flex-1 text-lg font-bold text-gray-900">TOTAL ANNUAL ECOSYSTEM SERVICE COST</span>
        <span className="text-xl font-bold text-gray-900 w-24 text-right">
          {formatCr(total)}
        </span>
      </motion.div>
    </div>
  );
}
