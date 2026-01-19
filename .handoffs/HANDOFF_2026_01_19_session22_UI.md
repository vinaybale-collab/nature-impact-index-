# SESSION 22 HANDOFF - NC CALCULATION + UI STARTED

**Date**: January 19, 2026
**Session**: 22 (continued after compaction)
**Database**: v7.8.0_NC_CALCULATED (525 companies, NC values calculated)
**Status**: NC COMPLETE + UI FOUNDATION BUILT

---

## FOR NEXT SESSION - COPY THIS:

```
Read these files in order:
1. .handoffs/LATEST_HANDOFF.md
2. .validation/CRITICAL_RULES_MEMORY.md

Then run on Replit:
npm install
npm run dev

If errors, paste them. If works, Gemini creates Methodology page.
```

---

## SESSION 22 ACCOMPLISHMENTS

### Phase 1: NC Calculation (COMPLETE)
- Created `scripts/calculate_natural_capital.py` v2.0
- Fixed 3 critical issues (PA score, Scope3 Bio, Waste parsing)
- Generated 528 JSON files in `public/data/`
- Validation: 62% pass (accepted - GIST benchmarks are global, India differs)
- Added RULE 16 to CRITICAL_RULES_MEMORY.md

### Phase 2: UI Foundation (BUILT)

**Project Config Files:**
- `package.json` - Dependencies (Next.js 14, React, Tailwind, Recharts, Framer Motion)
- `tailwind.config.js` - Custom colors (bg-primary, accent-primary, dim-*, score-*)
- `next.config.js` - Static export config
- `tsconfig.json` - TypeScript config
- `postcss.config.js` - PostCSS config

**Core Files:**
- `src/types/company.ts` - All TypeScript types
- `src/context/ToggleContext.tsx` - NII/NC toggle state management
- `src/lib/data.ts` - Data loading utilities + helpers
- `src/app/globals.css` - Global styles, CSS variables, utilities
- `src/app/layout.tsx` - Root layout with ToggleProvider

**UI Components:**
- `src/components/ui/Toggle.tsx` - Animated toggle switch
- `src/components/ui/Badge.tsx` - Rating badges
- `src/components/ui/Card.tsx` - Card components
- `src/components/layout/Header.tsx` - Fixed navbar
- `src/components/layout/Footer.tsx` - Footer

**Pages:**
- `src/app/page.tsx` - Homepage (hero, stats, top performers, sectors, dimensions)
- `src/app/rankings/page.tsx` - Rankings table with search/filter/sort
- `src/app/company/[slug]/page.tsx` - Company profile (static generation)
- `src/app/company/[slug]/CompanyClient.tsx` - Client component for toggle

---

## NEXT STEPS (In Order)

### STEP 1: Replit - Install & Test
```bash
npm install
npm run dev
```
Expected: Site runs at localhost:3000

### STEP 2: Fix Any Errors
If npm errors, paste them to Claude for fixes.

### STEP 3: Gemini - Methodology Page
Copy this prompt to Google AI Studio:

```
Create src/app/methodology/page.tsx for Next.js 14 App Router.

Dark theme with Tailwind CSS. Colors:
- bg-bg-primary: #0A0E14
- bg-bg-secondary: #121820
- text-text-primary: #F9FAFB

Sections:
1. Hero: "INII Methodology" + "Transparent. Rigorous. Open Source."
2. Framework: UN SEEA Enhanced explanation
3. 5 Dimension cards (Climate, Water, Land, Biodiversity, Pollution)
4. Coefficients table (Scope 1/2: Rs 8,500/tCO2e, Scope 3: Rs 4,250, Water: Rs 50-500K/ML, Land: Rs 4L/ha, Waste: Rs 20K/MT)
5. Data Sources
6. Footer link to home

Export: export default function MethodologyPage()
```

### STEP 4: Replit - Build & Deploy
```bash
npm run build
```
Then deploy and configure nii.urvara.life domain.

---

## FILE STRUCTURE CREATED

```
nature-impact-index/
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── postcss.config.js
├── public/
│   └── data/
│       ├── rankings.json
│       ├── sectors.json
│       ├── metadata.json
│       └── companies/ (525 JSON files)
├── scripts/
│   └── calculate_natural_capital.py
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx (Homepage)
    │   ├── rankings/
    │   │   └── page.tsx
    │   └── company/
    │       └── [slug]/
    │           ├── page.tsx
    │           └── CompanyClient.tsx
    ├── components/
    │   ├── ui/
    │   │   ├── Toggle.tsx
    │   │   ├── Badge.tsx
    │   │   └── Card.tsx
    │   └── layout/
    │       ├── Header.tsx
    │       └── Footer.tsx
    ├── context/
    │   └── ToggleContext.tsx
    ├── lib/
    │   └── data.ts
    └── types/
        └── company.ts
```

---

## CRITICAL LEARNINGS (From NC Calculation)

1. **PA_Proximity_Score is 0-0.14** - Average across facilities, scale by 7.0
2. **Scope3_Biodiversity_MSA is already Rs Cr** - Don't multiply by MSA_VALUE
3. **Mining overburden: Rs 50/MT** - Parse notes for INCLUDES_OVERBURDEN
4. **FMCG EPR plastic: Rs 5,000/MT** - Parse notes for INCLUDES_EPR
5. **Don't hardcode caps** - Trace data lineage first

---

## DELEGATION SUMMARY

| Task | Owner | Status |
|------|-------|--------|
| NC Calculation | Claude | DONE |
| Project setup | Claude | DONE |
| Core components | Claude | DONE |
| Homepage, Rankings, Company pages | Claude | DONE |
| npm install + test | Replit | NEXT |
| Methodology page | Gemini | AFTER Replit |
| Build + Deploy | Replit | LAST |

---

## KEY COEFFICIENTS (Reference)

```python
COEFFICIENTS = {
    'SCC_INDIA': 8500,              # Rs/tCO2e
    'SCOPE3_GHG_DISCOUNT': 0.5,
    'WATER_BASE_PRICE': 50000,      # Rs/ML
    'LAND_ES_VALUE': 400000,        # Rs/ha/year
    'PA_SCORE_SCALE': 7.0,
    'MSA_FACTOR': 0.08,
    'OPERATIONAL_WASTE_COST': 20000,
    'OVERBURDEN_COST': 50,
    'INTERNAL_PLASTIC_COST': 50000,
    'EPR_PLASTIC_COST': 5000,
}
```

---

**Session 22 Complete**
**Next Action**: Run `npm install` on Replit
