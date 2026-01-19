# HANDOFF DOCUMENT - January 19, 2026 Session

**Session End Reason:** Context limit (3% remaining)
**Next Action:** Start new session with this document

---

## QUICK START FOR NEW SESSION

**Paste this in new session:**
```
Read these files in order:
1. C:\Users\Vinay Bale\Documents\nature-impact-index\.handoffs\HANDOFF_2026_01_19_SESSION.md (THIS FILE)
2. C:\Users\Vinay Bale\Documents\nature-impact-index\NATURAL_CAPITAL_VALUATION_COMPREHENSIVE.md
3. C:\Users\Vinay Bale\Documents\nature-impact-index\tasks.md

Then verify database:
python -c "import pandas as pd; df = pd.read_csv('data/company_biodiversity_scores_v7.7.0_SECTORS_FINAL_2026_01_18.csv'); print(f'Companies: {len(df)}, Columns: {len(df.columns)}, Sectors: {df[chr(34)}Sector{chr(34)}].nunique()')"
# Expected: 525 companies, 129 columns, 29 sectors
```

---

## SESSION SUMMARY

### What We Accomplished:
1. Read all project context documents
2. Verified database: 525 companies, 129 columns, 29 sectors, 100% data coverage
3. Identified that existing intensity metrics (Carbon_Intensity, Water_Intensity, MSA_Intensity, etc.) can be leveraged
4. Created initial plan at `C:\Users\Vinay Bale\.claude\plans\jaunty-frolicking-liskov.md`

### Key Decisions Made:
| Decision | Choice |
|----------|--------|
| NII Score vs Natural Capital | **TOGGLE VIEW** - Both views with toggle switch |
| NPR (Nature-to-Profit Ratio) | **SKIP** - No profit data available |
| Homepage Map | **NO MAP** - Facility data incomplete |
| Homepage Design | **World-class dark gradient** (Stripe/Linear/Vercel style) |
| Deployment | **Replit** (user has $25/mo subscription) + nii.urvara.life |
| Methodology | Use existing NATURAL_CAPITAL_VALUATION_COMPREHENSIVE.md |

---

## CRITICAL DATABASE COLUMNS (What We Have)

**100% data coverage on ALL these columns:**

### Climate:
- `Scope1_GHG_tCO2e`, `Scope2_GHG_tCO2e`, `Scope3_GHG_tCO2e`
- `Total_GHG_Emissions_tCO2e`, `Carbon_Intensity_tCO2e_per_Cr`
- `Renewable_Energy_Pct`, `Renewable_Energy_GJ`, `Total_Energy_GJ`

### Water:
- `Water_Consumption_KL`, `Water_Intensity`, `Water_Stress_Score`
- `Water_Recycling_Pct`, `Water_Discharge_ML`

### Land:
- `Total_Land_ha`, `Land_Owned_ha`, `Land_Leased_ha`
- `Land_Degraded_HA_Calculated`, `Land_Restored_ha`, `Land_Intensity`
- `Distance_To_Protected_Area_km`, `PA_Proximity_Score`

### Biodiversity (ALREADY CALCULATED!):
- `Base_MSA_Loss`, `V7_Direct_EIF`, `V7_Scope3_Factor`
- `MSA_Intensity_Direct`, `MSA_Intensity_Scope3`, `MSA_Intensity_V7_Total`
- `Scope3_Biodiversity_MSA`

### Pollution/Waste:
- `Waste_Generated_MT`, `Waste_Recycled_Pct`, `Waste_Intensity_MT_per_Cr`
- `Plastic_Waste_MT`, `E_Waste_MT`, `Hazardous_Air_Pollutants`

### Financial:
- `Revenue_Cr`

---

## NATURAL CAPITAL VALUATION - KEY COEFFICIENTS

From `NATURAL_CAPITAL_VALUATION_COMPREHENSIVE.md`:

| Indicator | Coefficient | Database Column |
|-----------|-------------|-----------------|
| Scope 1 GHG | ₹8,500/tCO2e | Scope1_GHG_tCO2e |
| Scope 2 GHG | ₹8,500/tCO2e | Scope2_GHG_tCO2e |
| Scope 3 GHG | ₹4,250/tCO2e (50% discount) | Scope3_GHG_tCO2e |
| Water (low stress) | ₹50,000/ML | Water_Consumption_KL / 1000 |
| Water (high stress) | ₹500,000/ML | Water_Consumption_KL / 1000 × stress |
| Land (forest) | ₹4 lakh/ha/year | Total_Land_ha |
| Land degradation | ₹5-12 lakh/ha/year | Land_Degraded_HA_Calculated |
| Biodiversity | ₹4-8 lakh/ha/year | Base_MSA_Loss × area |
| Waste | ₹20,000/tonne | Waste_Generated_MT |
| Air pollution (PM) | ₹500/kg | Hazardous_Air_Pollutants |

---

## WHAT NEEDS TO BE DONE

### Phase 1: Data Processing (scripts/calculate_natural_capital.py)
1. Apply coefficients from methodology to database
2. Calculate: NC_Climate_Cr, NC_Water_Cr, NC_Land_Cr, NC_Biodiversity_Cr, NC_Pollution_Cr
3. Calculate: TAESC_Cr = sum of all damages - credits
4. Calculate: NIR = TAESC_Cr / Revenue_Cr
5. Calculate: NII_Score (0-10 from percentile ranks)
6. Generate JSON files for UI

### Phase 2: Next.js Application
- Homepage with world-class dark gradient design
- Rankings page with toggle (NII Score ↔ Natural Capital ₹)
- Company profile pages with Nature Balance Sheet
- Methodology page

### Phase 3: Deployment
- Deploy to Replit
- Configure nii.urvara.life DNS

---

## EXISTING TASK DELEGATION (tasks.md)

21 tasks already defined for Gemini:
- GEMINI_TASK_01: TypeScript Interfaces
- GEMINI_TASK_02: Data Loading Utilities
- GEMINI_TASK_03-06: UI Components, Charts
- GEMINI_TASK_07-12: Company Profile features
- GEMINI_TASK_13-16: Tools & Pages
- GEMINI_TASK_17-19: Content Generation

**User has subscriptions to:**
- Replit ($25/mo) - for hosting & running scripts
- Google AI Studio (Gemini) - for task delegation
- Claude Code - for coordination & complex logic

---

## USER PREFERENCES

1. **World-class UI** - Inspired by Stripe, Linear, Vercel
2. **NO map on homepage** - Facility data incomplete
3. **Toggle view** - NII Score ↔ Natural Capital ₹
4. **Skip NPR** - No profit data
5. **Use existing methodology** - Don't simplify, use full UN SEEA spec

---

## FILES TO REFERENCE IN NEW SESSION

| Priority | File | Purpose |
|----------|------|---------|
| 1 | This handoff file | Context from this session |
| 2 | `NATURAL_CAPITAL_VALUATION_COMPREHENSIVE.md` | Full methodology with coefficients |
| 3 | `tasks.md` | 21 Gemini task definitions |
| 4 | `data/company_biodiversity_scores_v7.7.0_SECTORS_FINAL_2026_01_18.csv` | Production database |
| 5 | `.validation/CRITICAL_RULES_MEMORY.md` | 4 Axioms governing work |

---

## RECOMMENDED NEXT STEPS

1. **Create master plan.md** at project root with full implementation details
2. **Create calculate_natural_capital.py** script applying UN SEEA coefficients
3. **Run script** to add NC columns to database
4. **Generate JSON** files for UI
5. **Start Next.js app** on Replit
6. **Deploy** to nii.urvara.life

---

**Session ended:** January 19, 2026
**Context remaining:** 3%
**Recommendation:** Start fresh session with this handoff document
