'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ExternalLink } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: 'basics' | 'climate' | 'water' | 'land' | 'biodiversity' | 'pollution' | 'data';
}

const faqs: FAQItem[] = [
  // BASICS
  {
    category: 'basics',
    question: 'What does "Rs 23 per Rs 100" actually mean?',
    answer: (
      <div className="space-y-3">
        <p>
          It means that for every Rs 100 of revenue an average Indian company earns, they consume
          Rs 23 worth of ecosystem services for free. These services include clean air, water
          filtration, carbon absorption, pollination, and other natural processes that businesses
          depend on but don&apos;t pay for.
        </p>
        <p className="text-gray-500">
          This &quot;hidden subsidy from nature&quot; would have to be paid for if ecosystems collapsed
          or if proper environmental pricing existed. We call this the Nature Intensity Ratio (NIR).
        </p>
      </div>
    ),
  },
  {
    category: 'basics',
    question: 'How is the Total Annual Ecosystem Service Cost (TAESC) calculated?',
    answer: (
      <div className="space-y-3">
        <p>
          TAESC is the sum of five dimension costs, each representing a different type of
          environmental impact:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <p className="text-orange-600">TAESC = Climate + Water + Land + Biodiversity + Pollution</p>
        </div>
        <p className="text-gray-500">
          Each dimension uses scientifically-grounded coefficients to convert physical flows
          (tonnes of CO2, kiloliters of water, hectares of land) into monetary values.
        </p>
      </div>
    ),
  },
  {
    category: 'basics',
    question: 'Why express impact as a percentage of revenue?',
    answer: (
      <div className="space-y-3">
        <p>
          Absolute numbers are misleading. A company with Rs 100 Cr TAESC could be excellent
          (if revenue is Rs 10,000 Cr = 1% NIR) or terrible (if revenue is Rs 50 Cr = 200% NIR).
        </p>
        <p>
          By expressing impact as a percentage of revenue (the Nature Intensity Ratio), we enable:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Fair comparison across companies of different sizes</li>
          <li>Comparison across different sectors</li>
          <li>A clear threshold: NIR &gt;100% means environmental cost exceeds revenue</li>
        </ul>
      </div>
    ),
  },

  // CLIMATE
  {
    category: 'climate',
    question: 'How do you value carbon emissions?',
    answer: (
      <div className="space-y-3">
        <p>
          We use the Social Cost of Carbon (SCC) - the economic damage caused by emitting one
          additional tonne of CO2. Our coefficient is <strong>Rs 8,500 per tCO2e</strong> for
          direct emissions (Scope 1 &amp; 2).
        </p>
        <p className="text-gray-500">
          This is based on the India-specific SCC from peer-reviewed literature, which accounts
          for India&apos;s vulnerability to climate impacts including heat waves, agricultural
          disruption, and sea level rise.
        </p>
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
          <strong>Source:</strong> Ricke et al. (2018), &quot;Country-level social cost of carbon&quot;,
          Nature Climate Change
        </div>
      </div>
    ),
  },
  {
    category: 'climate',
    question: 'Why discount Scope 3 emissions by 50%?',
    answer: (
      <div className="space-y-3">
        <p>
          Scope 3 emissions occur in a company&apos;s value chain - from suppliers and from customers
          using their products. We apply a <strong>50% discount (Rs 4,250/tCO2e)</strong> because:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>The company has indirect, not direct control over these emissions</li>
          <li>It avoids double-counting (the supplier reports it as Scope 1)</li>
          <li>It follows TNFD and SBTI guidance on shared responsibility</li>
        </ul>
        <p className="text-gray-500">
          This balance recognizes that companies influence their supply chains while not holding
          them 100% accountable for emissions they don&apos;t directly control.
        </p>
      </div>
    ),
  },
  {
    category: 'climate',
    question: 'Why does Climate represent 56% of total impact?',
    answer: (
      <div className="space-y-3">
        <p>
          India&apos;s economy is still heavily coal-dependent (over 70% of electricity comes from
          coal). Companies in energy-intensive sectors like Steel, Cement, and Oil &amp; Gas
          generate massive direct emissions.
        </p>
        <p>
          Additionally, Scope 3 emissions from value chains add substantial indirect impact.
          This reflects a real pattern: climate is the dominant environmental externality for
          most industrial economies.
        </p>
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm">
          <strong>Benchmark:</strong> GIST Impact global studies show similar 40-60% climate
          share across industrial portfolios.
        </div>
      </div>
    ),
  },

  // WATER
  {
    category: 'water',
    question: 'How is water impact calculated?',
    answer: (
      <div className="space-y-3">
        <p>
          Water is valued based on consumption AND regional water stress. The base price is
          <strong> Rs 50,000 per ML</strong> (megaliter), multiplied by a stress factor.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <p>Water_Cost = Water_KL * 50,000 * (1 + 0.8 * Stress_Score)</p>
          <p className="text-gray-500 mt-2">// Stress_Score ranges from 0 (low) to 5 (extremely high)</p>
        </div>
        <p className="text-gray-500">
          A company consuming 1 ML in a water-stressed region (stress=5) pays 5x more in
          environmental cost than one consuming the same amount in a water-abundant region.
        </p>
      </div>
    ),
  },
  {
    category: 'water',
    question: 'Where does water stress data come from?',
    answer: (
      <div className="space-y-3">
        <p>
          We use the <strong>WRI Aqueduct 4.0</strong> dataset, which provides water stress
          scores at granular geographic levels. For each company, we:
        </p>
        <ol className="list-decimal list-inside text-gray-600 space-y-1">
          <li>Geocode their facility locations from BRSR disclosures</li>
          <li>Query the Aqueduct water stress layer at each location</li>
          <li>Calculate a weighted average stress score across all facilities</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
          <strong>Source:</strong> World Resources Institute Aqueduct 4.0 Water Risk Atlas
        </div>
      </div>
    ),
  },

  // LAND
  {
    category: 'land',
    question: 'How do you value land use?',
    answer: (
      <div className="space-y-3">
        <p>
          Land is valued at <strong>Rs 4,00,000 per hectare per year</strong>, representing the
          ecosystem services lost when land is converted from natural state to industrial use.
        </p>
        <p className="text-gray-500">
          This includes carbon sequestration, water filtration, flood regulation, habitat
          provision, and soil formation services that natural ecosystems provide.
        </p>
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
          <strong>Source:</strong> TEEB (The Economics of Ecosystems and Biodiversity) India
          Initiative valuations, adjusted for 2024
        </div>
      </div>
    ),
  },
  {
    category: 'land',
    question: 'Do you count both owned and leased land?',
    answer: (
      <div className="space-y-3">
        <p>
          Yes. Both owned and leased land represent actual ecosystem conversion. We calculate:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <p>Total_Land = Land_Owned + Land_Leased</p>
          <p>Land_Cost = Total_Land * 4,00,000</p>
        </div>
        <p className="text-gray-500">
          Many companies operate on a leased model (Land_Owned = 0, Land_Leased &gt; 0).
          This is a valid business model, not a data gap. The environmental impact is the same
          regardless of ownership structure.
        </p>
      </div>
    ),
  },

  // BIODIVERSITY
  {
    category: 'biodiversity',
    question: 'What is MSA and why do you use it?',
    answer: (
      <div className="space-y-3">
        <p>
          <strong>MSA (Mean Species Abundance)</strong> is a measure of local biodiversity
          relative to an undisturbed reference state. MSA = 1.0 means pristine; MSA = 0.5 means
          50% of original biodiversity remains.
        </p>
        <p>
          We use GLOBIO 4.0 sector-specific biodiversity intensity factors to estimate each
          company&apos;s MSA loss from direct operations and supply chain activities.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm">
          <strong>Source:</strong> GLOBIO 4.0 (Alkemade et al., Global Environmental Change)
        </div>
      </div>
    ),
  },
  {
    category: 'biodiversity',
    question: 'What is the Protected Area proximity multiplier?',
    answer: (
      <div className="space-y-3">
        <p>
          Companies with facilities near Protected Areas (national parks, wildlife sanctuaries,
          biosphere reserves) have higher biodiversity impact potential. We apply a proximity
          multiplier of <strong>1.0x to 2.0x</strong> based on average facility distance.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <p>PA_Multiplier = 1.0 + min(PA_Proximity_Score * 7, 1.0)</p>
          <p className="text-gray-500 mt-2">// PA_Proximity_Score = average(1/(1+distance_km)) across facilities</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm">
          <strong>Source:</strong> WDPA (World Database on Protected Areas), geocoded facility distances
        </div>
      </div>
    ),
  },

  // POLLUTION
  {
    category: 'pollution',
    question: 'How is waste valued?',
    answer: (
      <div className="space-y-3">
        <p>
          Different waste types have different environmental costs:
        </p>
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Waste Type</th>
              <th className="px-3 py-2 text-right">Value</th>
              <th className="px-3 py-2 text-left">Rationale</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200">
              <td className="px-3 py-2">Operational Waste</td>
              <td className="px-3 py-2 text-right font-mono">Rs 20,000/MT</td>
              <td className="px-3 py-2 text-gray-500">Disposal + remediation</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-3 py-2">Plastic Waste</td>
              <td className="px-3 py-2 text-right font-mono">Rs 50,000/MT</td>
              <td className="px-3 py-2 text-gray-500">Persistence + marine impact</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-3 py-2">E-Waste</td>
              <td className="px-3 py-2 text-right font-mono">Rs 50,000/MT</td>
              <td className="px-3 py-2 text-gray-500">Toxic components</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-3 py-2">Mining Overburden</td>
              <td className="px-3 py-2 text-right font-mono">Rs 50/MT</td>
              <td className="px-3 py-2 text-gray-500">Inert rock (not toxic)</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    category: 'pollution',
    question: 'Why is mining waste valued so low (Rs 50/MT)?',
    answer: (
      <div className="space-y-3">
        <p>
          Mining operations like Coal India report billions of tonnes of &quot;waste&quot;, but 99.9%
          is <strong>overburden</strong> - inert rock moved to access minerals. It&apos;s not toxic
          or hazardous, just volumetrically massive.
        </p>
        <p>
          We parse company notes to identify overburden vs. operational waste. Overburden gets
          Rs 50/MT (land disturbance cost) while toxic operational waste gets Rs 20,000/MT.
        </p>
        <p className="text-gray-500">
          Without this distinction, Coal India&apos;s pollution score would be absurdly high,
          misrepresenting actual environmental harm.
        </p>
      </div>
    ),
  },

  // DATA
  {
    category: 'data',
    question: 'Where does company data come from?',
    answer: (
      <div className="space-y-3">
        <p>We use multiple sources in priority order:</p>
        <ol className="list-decimal list-inside text-gray-600 space-y-1">
          <li><strong>BRSR Reports</strong> - Mandatory Business Responsibility reports (FY2023-24)</li>
          <li><strong>XBRL Filings</strong> - Structured data from NSE/BSE filings</li>
          <li><strong>Annual Reports</strong> - Sustainability sections and environmental disclosures</li>
          <li><strong>Integrated Reports</strong> - For companies following IR framework</li>
        </ol>
        <p className="text-gray-500">
          When direct data is unavailable, we use EXIOBASE 3.8.2 sector averages as a secondary source.
        </p>
      </div>
    ),
  },
  {
    category: 'data',
    question: 'What is your data coverage rate?',
    answer: (
      <div className="space-y-3">
        <p>
          Our database covers <strong>517 companies</strong> across 15 sectors. Data quality
          varies by indicator:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>GHG Emissions (Scope 1 &amp; 2): 95%+ direct data</li>
          <li>Water Consumption: 90%+ direct data</li>
          <li>Scope 3 Emissions: 70% direct, 30% modeled</li>
          <li>Biodiversity: 100% modeled (sector factors)</li>
        </ul>
        <p className="text-gray-500">
          Each company page shows confidence levels for transparency.
        </p>
      </div>
    ),
  },
  {
    category: 'data',
    question: 'How do you handle missing data?',
    answer: (
      <div className="space-y-3">
        <p>We use a tiered approach:</p>
        <ol className="list-decimal list-inside text-gray-600 space-y-2">
          <li>
            <strong>Tier 1:</strong> Direct company disclosure (highest confidence)
          </li>
          <li>
            <strong>Tier 2:</strong> Calculated from related metrics
            (e.g., energy consumption to estimate emissions)
          </li>
          <li>
            <strong>Tier 3:</strong> Sector median imputation (flagged as low confidence)
          </li>
        </ol>
        <p className="text-gray-500">
          We never guess values. Missing data is either imputed transparently or marked as
          unavailable.
        </p>
      </div>
    ),
  },
];

const categories = [
  { id: 'basics', name: 'The Basics', color: 'bg-gray-600' },
  { id: 'climate', name: 'Climate', color: 'bg-orange-500' },
  { id: 'water', name: 'Water', color: 'bg-blue-500' },
  { id: 'land', name: 'Land', color: 'bg-lime-500' },
  { id: 'biodiversity', name: 'Biodiversity', color: 'bg-emerald-500' },
  { id: 'pollution', name: 'Pollution', color: 'bg-purple-500' },
  { id: 'data', name: 'Data & Sources', color: 'bg-slate-500' },
];

const coefficientTable = [
  { category: 'GHG Emissions (Scope 1 & 2)', value: 'Rs 8,500', unit: 'per tCO2e', source: 'India SCC' },
  { category: 'GHG Emissions (Scope 3)', value: 'Rs 4,250', unit: 'per tCO2e', source: '50% discount' },
  { category: 'Water (Low Stress)', value: 'Rs 50,000', unit: 'per ML', source: 'WRI Aqueduct' },
  { category: 'Water (High Stress, 5x)', value: 'Rs 500,000', unit: 'per ML', source: 'WRI Aqueduct' },
  { category: 'Land Ecosystem Services', value: 'Rs 4,00,000', unit: 'per ha/year', source: 'TEEB India' },
  { category: 'MSA Biodiversity Loss', value: 'Rs 6,00,000', unit: 'per unit', source: 'GLOBIO 4.0' },
  { category: 'Operational Waste', value: 'Rs 20,000', unit: 'per MT', source: 'Disposal cost' },
  { category: 'Plastic Waste', value: 'Rs 50,000', unit: 'per MT', source: 'Environmental' },
  { category: 'Mining Overburden', value: 'Rs 50', unit: 'per MT', source: 'Inert rock' },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const category = categories.find(c => c.id === item.category);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${category?.color}`} />
          <span className="font-medium text-gray-900">{item.question}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function MethodologyPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const filteredFaqs = activeCategory
    ? faqs.filter(f => f.category === activeCategory)
    : faqs;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Hero */}
          <section className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How We Calculate Impact
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Transparent methodology. Peer-reviewed sources. No black boxes.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Our core metric:</span> For every Rs 100 of revenue,
                how much ecosystem service value does a company consume for free?
              </p>
              <p className="text-gray-500 mt-2">
                The average across 517 Indian companies is Rs 23 - meaning companies extract Rs 23
                of environmental value for every Rs 100 they earn.
              </p>
            </div>
          </section>

          {/* Category Filter */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Questions
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeCategory === cat.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.name}
                </button>
              ))}
            </div>
          </section>

          {/* FAQ Accordion */}
          <section className="mb-16">
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const globalIdx = faqs.indexOf(faq);
                return (
                  <FAQAccordion
                    key={globalIdx}
                    item={faq}
                    isOpen={openItems.has(globalIdx)}
                    onToggle={() => toggleItem(globalIdx)}
                  />
                );
              })}
            </div>
          </section>

          {/* Coefficient Reference Table */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Valuation Coefficients Reference
            </h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coefficientTable.map((coef) => (
                    <tr key={coef.category} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{coef.category}</td>
                      <td className="px-4 py-3 text-right font-mono text-orange-600 font-medium">{coef.value}</td>
                      <td className="px-4 py-3 text-gray-500">{coef.unit}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{coef.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Data Sources */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Our Data Sources
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'BRSR Reports', desc: 'Business Responsibility and Sustainability Reports (FY2023-24)', link: 'https://www.nseindia.com' },
                { name: 'WRI Aqueduct 4.0', desc: 'Water stress data for 50,000+ geocoded facilities', link: 'https://www.wri.org/aqueduct' },
                { name: 'GLOBIO 4.0', desc: 'Biodiversity impact factors by sector', link: 'https://www.globio.info' },
                { name: 'EXIOBASE 3.8.2', desc: 'Supply chain environmental intensity factors', link: 'https://www.exiobase.eu' },
                { name: 'TEEB India', desc: 'Ecosystem service valuations for Indian biomes', link: 'https://teebweb.org' },
                { name: 'WDPA', desc: 'Protected Area proximity calculations', link: 'https://www.protectedplanet.net' },
              ].map((source) => (
                <a
                  key={source.name}
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{source.name}</h3>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500">{source.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Open Source. Transparent. Peer Reviewable.
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto mb-6">
                All methodologies and coefficients are publicly documented. We welcome scrutiny
                and debate - that&apos;s how science improves.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/rankings"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  View Company Rankings
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
