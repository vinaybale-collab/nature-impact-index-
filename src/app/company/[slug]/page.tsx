import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRankingsStatic, getScoreColor, formatCr, formatPct } from '@/lib/data';
import { Company, DIMENSION_INFO, DimensionKey } from '@/types/company';
import CompanyClient from './CompanyClient';

// Generate static params for all companies
export async function generateStaticParams() {
  const rankings = getRankingsStatic();
  return rankings.companies.map((company) => ({
    slug: company.slug,
  }));
}

// Load company data at build time
async function getCompanyData(slug: string): Promise<Company | null> {
  try {
    const data = await import(`../../../../public/data/companies/${slug}.json`);
    return data.default as Company;
  } catch {
    return null;
  }
}

export default async function CompanyPage({
  params,
}: {
  params: { slug: string };
}) {
  const company = await getCompanyData(params.slug);

  if (!company) {
    notFound();
  }

  return <CompanyClient company={company} />;
}
