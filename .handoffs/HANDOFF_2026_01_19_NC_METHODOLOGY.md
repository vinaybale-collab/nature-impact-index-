# Handoff: Natural Capital Methodology & UI Design
**Date**: January 19, 2026
**Session Focus**: Creating upgraded NC methodology and UI design documents

---

## SESSION SUMMARY

Created 2 of 4 super-detailed planning documents:

| Document | Status | Location |
|----------|--------|----------|
| NATURAL_CAPITAL_METHODOLOGY_v4.md | COMPLETE | Root folder |
| UI_DESIGN_SPECIFICATION_v2.md | COMPLETE | Root folder |
| plan_new.md | PENDING | Not created yet |
| tasks_new.md | PENDING | Not created yet |

---

## WHAT WAS ACCOMPLISHED

### 1. Natural Capital Methodology v4.0 (MAJOR UPGRADE)

The new methodology upgrades UN SEEA with our unique work:

| Enhancement | What It Does |
|-------------|--------------|
| **MSA-Centric Biodiversity** | Uses Base_MSA_Loss as core metric, not generic coefficient |
| **Continuous Water Stress** | Water_Stress_Score as multiplier (1x-10x) instead of discrete tiers |
| **PA Proximity Risk** | PA_Proximity_Score multiplies biodiversity/land values (1x-2x) |
| **Scope 3 Biodiversity** | Scope3_Biodiversity_MSA with 50% discount |
| **Triple-Loop Validation** | Statistical + Consistency + External triangulation |

**Key Coefficients Defined**:
- Scope 1+2 GHG: Rs 8,500/tCO2e
- Scope 3 GHG: Rs 4,250/tCO2e (50% discount)
- Water: Rs 50,000/ML base x (1 + Stress x 1.8)
- Land: Rs 4 lakh/ha/year
- MSA Biodiversity: Rs 6 lakh per MSA per Cr revenue
- Waste: Rs 20,000/MT base

### 2. UI Design Specification v2.0

World-class dark gradient design (Stripe/Linear/Vercel inspired):

- **Toggle View**: NII Score <-> Natural Capital Rs
- **Color System**: Deep navy backgrounds, emerald green accents
- **5 Dimension Colors**: Climate (orange), Water (blue), Land (lime), Biodiversity (green), Pollution (purple)
- **Key Components**: Toggle switch, Score gauge, Radar chart, Stacked bar
- **Responsive**: Desktop-first, mobile-optimized
- **Tech Stack**: Next.js 14, Tailwind CSS, Recharts, Framer Motion

---

## DATABASE STATUS (VERIFIED)

```
Companies: 525
Columns: 129
Sectors: 29
Coverage: 100% on all key indicators
```

**Our Unique Indicators (100% coverage)**:
- Base_MSA_Loss, MSA_Intensity_V7_Total
- Water_Stress_Score (0-5 continuous)
- PA_Proximity_Score, Distance_To_Protected_Area_km
- Scope3_Biodiversity_MSA
- V7_Direct_EIF, V7_Scope3_Factor

---

## WHAT'S REMAINING

### Immediate (This Session):
1. **plan_new.md** - Implementation plan with:
   - Gemini task delegation
   - Replit deployment strategy
   - Phase breakdown

2. **tasks_new.md** - Detailed task breakdown:
   - Calculate NC script
   - JSON generation
   - UI development
   - Deployment

### Next Phase:
1. Create `scripts/calculate_natural_capital.py`
2. Generate JSON files for UI
3. Build Next.js application
4. Deploy to nii.urvara.life

---

## KEY DECISIONS CONFIRMED

| Decision | Choice | Rationale |
|----------|--------|-----------|
| NII vs NC | Toggle View (both) | User can switch perspectives |
| NPR Metric | Skip | No profit data available |
| Homepage Map | No map | Facility data incomplete |
| Methodology | UN SEEA + INII enhancements | Best of both worlds |
| Deployment | Replit | $25/mo, easy deployment |
| Domain | nii.urvara.life | Already available |

---

## RESOURCES AVAILABLE

1. **Claude** (this session) - Complex logic, code generation
2. **Gemini** (Google AI Studio) - Task delegation, content generation
3. **Replit** ($25/mo subscription) - Hosting, deployment, running scripts

---

## TO CONTINUE

```
Read these files:
1. NATURAL_CAPITAL_METHODOLOGY_v4.md
2. UI_DESIGN_SPECIFICATION_v2.md

Then create:
1. plan_new.md (with Gemini/Replit utilization)
2. tasks_new.md (detailed breakdown)

After that:
1. Create calculate_natural_capital.py
2. Generate JSON files
3. Start UI development
```

---

## FILE LOCATIONS

```
Root:
- NATURAL_CAPITAL_METHODOLOGY_v4.md (NEW)
- UI_DESIGN_SPECIFICATION_v2.md (NEW)
- NATURAL_CAPITAL_VALUATION_COMPREHENSIVE.md (original reference)
- FINAL_BIODIVERSITY_METHODOLOGY.md (reference for rigor level)

Data:
- data/company_biodiversity_scores_v7.7.0_SECTORS_FINAL_2026_01_18.csv
```

---

**Next Agent Command**:
```
Read NATURAL_CAPITAL_METHODOLOGY_v4.md and UI_DESIGN_SPECIFICATION_v2.md, then create plan_new.md and tasks_new.md with Gemini/Replit task delegation strategy.
```
