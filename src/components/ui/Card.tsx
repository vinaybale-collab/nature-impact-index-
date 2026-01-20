import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-bg-secondary rounded-xl border border-bg-tertiary/50
        ${hover ? 'transition-all duration-200 hover:border-bg-tertiary hover:shadow-lg hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-bg-tertiary/50 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-bg-tertiary/50 ${className}`}>
      {children}
    </div>
  );
}

// Stat card variant
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className = '' }: StatCardProps) {
  return (
    <Card className={`p-6 ${className}`} hover={false}>
      <p className="text-text-tertiary text-sm uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-text-primary font-data">{value}</p>
      {subtext && (
        <p className="text-text-muted text-sm mt-1">{subtext}</p>
      )}
    </Card>
  );
}
