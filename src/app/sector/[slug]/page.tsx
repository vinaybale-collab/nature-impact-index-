import { getSectorsStatic } from '@/lib/data';
import SectorClient from './SectorClient';

// Generate slug from sector name
function generateSlug(sector: string): string {
  return sector.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Generate static params for all sectors
export function generateStaticParams() {
  const sectorsData = getSectorsStatic();
  return sectorsData.sectors.map((sector) => ({
    slug: generateSlug(sector.sector),
  }));
}

// Generate metadata for each sector page
export function generateMetadata({ params }: { params: { slug: string } }) {
  const sectorsData = getSectorsStatic();
  const sector = sectorsData.sectors.find((s) => generateSlug(s.sector) === params.slug);

  if (!sector) {
    return {
      title: 'Sector Not Found | India Nature Impact Index',
    };
  }

  return {
    title: `${sector.sector} | India Nature Impact Index`,
    description: `Nature impact analysis for ${sector.company_count} companies in the ${sector.sector} sector. Average NIR: ${(sector.avg_nir * 100).toFixed(1)}%.`,
  };
}

export default function SectorPage({ params }: { params: { slug: string } }) {
  return <SectorClient slug={params.slug} />;
}
