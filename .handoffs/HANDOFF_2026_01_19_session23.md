# Session 23 Handoff - January 19, 2026

## Session Summary
**Duration**: ~45 minutes
**Focus**: Data validation, methodology fixes, sector expansion framework

---

## What Was Accomplished

### 1. Website Testing
- Built successfully (522 static pages)
- Identified 2 critical data issues on refresh

### 2. Data Validation Script Created
- `scripts/validate_nc_data.py` - comprehensive validation
- Found **109 critical issues**:
  - 95 service sector companies with biodiversity > 80%
  - 14 companies with GHG but Climate = 0

### 3. Root Causes Identified

**Issue 1: Service Sector Biodiversity Too High**
- Banking/IT have same Base_MSA_Loss (0.42-0.62) as Mining
- Should be near-zero for service sectors (no direct land use)

**Issue 2: Climate = 0 for Energy Companies (ITC, etc.)**
- RE credit formula subtracts from ALL scopes
- Should only offset Scope 2 (purchased electricity)
- Scope 1 and Scope 3 cannot be offset by company's RE

### 4. Sector Expansion Framework Created
- **`SECTOR_BIODIVERSITY_MAPPING_v1.md`** - full methodology document
- Maps 8 global EXIOBASE sectors → 29 Indian sectors
- First-principles justification for each adjustment
- Validation framework included

### 5. Calculation Script Partially Updated
- `scripts/calculate_natural_capital.py` updated to v2.1
- Added `SECTOR_MSA_OVERRIDES` table (all 29 sectors)
- Added `SECTOR_SCOPE3_ADJUSTMENTS` table
- **NOT YET DONE**: Fix climate calculation (RE credit logic)

---

## What Needs To Be Done Next

### Immediate (Before Deployment)

1. **Fix Climate Calculation** in `calculate_natural_capital.py`:
   ```python
   # CURRENT (WRONG):
   total_rs = scope1_damage + scope2_damage + scope3_damage - re_credit

   # CORRECT:
   scope2_net = max(scope2_damage - re_credit, 0)  # RE only offsets Scope 2
   total_rs = scope1_damage + scope2_net + scope3_damage
   ```

2. **Apply Sector MSA Overrides** in biodiversity calculation:
   ```python
   def calculate_nc_biodiversity(row):
       sector = row['Sector']
       # Use override if available, else use source data
       msa_loss = SECTOR_MSA_OVERRIDES.get(sector, safe_value(row['Base_MSA_Loss']))
   ```

3. **Regenerate NC Data**:
   ```bash
   cd nature-impact-index
   python scripts/calculate_natural_capital.py
   ```

4. **Re-validate**:
   ```bash
   python scripts/validate_nc_data.py
   ```
   - Service sector biodiversity should drop to < 30%
   - Climate should be non-zero for energy companies

5. **Rebuild Website**:
   ```bash
   npm run build
   npm run dev
   ```

---

## Key Files Modified/Created

| File | Status | Description |
|------|--------|-------------|
| `SECTOR_BIODIVERSITY_MAPPING_v1.md` | NEW | Full 8→29 sector expansion methodology |
| `scripts/validate_nc_data.py` | NEW | Comprehensive data validation |
| `scripts/calculate_natural_capital.py` | PARTIAL | Added overrides, need to fix climate calc |
| `src/app/methodology/page.tsx` | DONE | Methodology page created |

---

## Validation Targets After Fix

| Check | Before | Target After |
|-------|--------|--------------|
| Service sector bio > 80% | 95 companies | 0 companies |
| Climate = 0 with GHG > 10K | 14 companies | 0 companies |
| Bio dominance > 95% | 85 companies | < 20 companies |

---

## Commands to Resume

```bash
# Navigate to project
cd "C:\Users\Vinay Bale\Documents\nature-impact-index"

# Dev server (if needed)
npm run dev

# After fixing calculation script
python scripts/calculate_natural_capital.py
python scripts/validate_nc_data.py
npm run build
```

---

## Critical Context

- The 8→29 sector expansion is documented in `SECTOR_BIODIVERSITY_MAPPING_v1.md`
- Each MSA override has a rationale code (S1-S4, M1-M2, H1-H2, etc.)
- The validation script checks 6 different issue types
- Website is ready except for data regeneration

---

**Next Session Priority**: Fix climate calc → Apply MSA overrides → Regenerate → Validate → Deploy
