'use client';

import { useToggle } from '@/context/ToggleContext';
import { motion } from 'framer-motion';

interface ToggleProps {
  className?: string;
}

export default function Toggle({ className = '' }: ToggleProps) {
  const { mode, setMode, isNiiMode, isNcMode } = useToggle();

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg ${className}`}
      role="radiogroup"
      aria-label="View mode toggle"
    >
      <button
        role="radio"
        aria-checked={isNiiMode}
        onClick={() => setMode('nii')}
        className={`relative px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
          isNiiMode
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {isNiiMode && (
          <motion.div
            layoutId="toggle-bg"
            className="absolute inset-0 bg-emerald-600 rounded-md"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10">Nature Impact Index</span>
      </button>

      <button
        role="radio"
        aria-checked={isNcMode}
        onClick={() => setMode('nc')}
        className={`relative px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
          isNcMode
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {isNcMode && (
          <motion.div
            layoutId="toggle-bg"
            className="absolute inset-0 bg-blue-600 rounded-md"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10">Natural Capital Value</span>
      </button>
    </div>
  );
}

// Compact version for table headers
export function ToggleCompact({ className = '' }: ToggleProps) {
  const { mode, setMode, isNiiMode, isNcMode } = useToggle();

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-md ${className}`}
    >
      <button
        onClick={() => setMode('nii')}
        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
          isNiiMode
            ? 'bg-emerald-600 text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        NII
      </button>
      <button
        onClick={() => setMode('nc')}
        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
          isNcMode
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        NC Value
      </button>
    </div>
  );
}
