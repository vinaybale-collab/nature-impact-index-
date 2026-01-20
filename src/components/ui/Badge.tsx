import { NiiRating } from '@/types/company';
import { getRatingBadgeColor } from '@/lib/data';

interface BadgeProps {
  rating: NiiRating;
  className?: string;
}

export default function Badge({ rating, className = '' }: BadgeProps) {
  const colorClass = getRatingBadgeColor(rating);

  return (
    <span className={`badge ${colorClass} ${className}`}>
      {rating}
    </span>
  );
}

interface ConfidenceBadgeProps {
  confidence: string;
  className?: string;
}

export function ConfidenceBadge({ confidence, className = '' }: ConfidenceBadgeProps) {
  const getColor = () => {
    switch (confidence.toUpperCase()) {
      case 'HIGH':
        return 'bg-score-excellent/20 text-score-excellent border-score-excellent/30';
      case 'MEDIUM':
        return 'bg-score-average/20 text-score-average border-score-average/30';
      case 'LOW':
        return 'bg-score-poor/20 text-score-poor border-score-poor/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <span className={`badge ${getColor()} ${className}`}>
      {confidence}
    </span>
  );
}

interface SectorBadgeProps {
  sector: string;
  className?: string;
}

export function SectorBadge({ sector, className = '' }: SectorBadgeProps) {
  return (
    <span className={`badge bg-bg-tertiary text-text-secondary border-bg-elevated/50 ${className}`}>
      {sector}
    </span>
  );
}
