"""
Calculate Natural Capital Values for India Nature Impact Index
==============================================================

This script implements the INII Standard methodology (UN SEEA Enhanced)
as defined in NATURAL_CAPITAL_METHODOLOGY_v4.md

FIXES IMPLEMENTED:
Session 21:
1. PA_Proximity_Score: Uses 0-0.14 range correctly (average across facilities)
2. Scope3_Biodiversity_MSA: Already in Rs Cr (V7_Scope3_Factor * Revenue)
3. Waste/Pollution: Parses notes for OVERBURDEN and EPR separation

Session 23 (v2.1):
4. RE Credit: Only offsets Scope 2 emissions (not Scope 1 or 3)
5. Sector MSA Overrides: 8→29 sector expansion with first-principles adjustments
   See: SECTOR_BIODIVERSITY_MAPPING_v1.md for full methodology

Input:  data/company_biodiversity_scores_v7.7.0_SECTORS_FINAL_2026_01_18.csv
Output: data/company_biodiversity_scores_v7.9.0_NC_CALCULATED.csv
        public/data/rankings.json
        public/data/sectors.json
        public/data/metadata.json
        public/data/companies/{slug}.json (525 files)

Author: Claude Code
Date: January 19, 2026
Version: 2.1
"""

import pandas as pd
import numpy as np
from scipy import stats
import json
import os
import re
from datetime import datetime

# =============================================================================
# CONFIGURATION
# =============================================================================

INPUT_FILE = "data/company_biodiversity_scores_v7.7.0_SECTORS_FINAL_2026_01_18.csv"
OUTPUT_CSV = "data/company_biodiversity_scores_v7.9.0_NC_CALCULATED.csv"
OUTPUT_DIR = "public/data"

# =============================================================================
# NATURAL CAPITAL COEFFICIENTS (Triangulated)
# =============================================================================

COEFFICIENTS = {
    # Climate (Source: Ricke et al. 2018, adjusted for India)
    'SCC_INDIA': 8500,              # Rs per tCO2e
    'SCOPE3_GHG_DISCOUNT': 0.5,     # 50% for indirect responsibility
    'GRID_EF': 0.228,               # tCO2e per GJ (India grid 2023)

    # Water (Source: Chennai desalination + WRI Aqueduct)
    'WATER_BASE_PRICE': 50000,      # Rs per ML (low stress)
    'WATER_STRESS_MULTIPLIER': 1.8, # Per stress point (0-5 scale)
    'WATER_RECYCLING_CREDIT': 0.5,  # 50% credit

    # Land (Source: TEEB India)
    'LAND_ES_VALUE': 400000,        # Rs per ha per year
    'DEGRADATION_COST': 800000,     # Rs per ha per year
    'RESTORATION_CREDIT': 400000,   # Rs per ha per year

    # Biodiversity (Source: GIST/TEEB calibrated)
    # PA_Proximity_Score is 0-0.14, multiply by 7 to get 0-1 range for multiplier
    'PA_SCORE_SCALE': 7.0,          # Scale factor for 0-0.14 to 0-1
    'MSA_FACTOR': 0.08,             # Direct MSA to revenue fraction
    'SCOPE3_BIO_DISCOUNT': 0.5,     # 50% for indirect

    # Pollution - DIFFERENTIATED (Source: CPCB, EPR Rules, Mining practice)
    'OPERATIONAL_WASTE_COST': 20000,    # Rs per MT (general waste)
    'OVERBURDEN_COST': 50,              # Rs per MT (inert mining rock)
    'INTERNAL_PLASTIC_COST': 50000,     # Rs per MT (high impact)
    'EPR_PLASTIC_COST': 5000,           # Rs per MT (collection, not generation)
    'EWASTE_COST': 70000,               # Rs per MT (hazardous)
    'HAP_COST': 500,                    # Rs per kg
    'RECYCLING_CREDIT': 10000,          # Rs per MT
}

# Sector-specific land multipliers
SECTOR_LAND_MULTIPLIER = {
    'Metals & Mining': 1.5,
    'Cement Manufacturing': 1.4,
    'Oil & Gas': 1.3,
    'Chemicals & Fertilizers': 1.2,
    'Energy & Power': 1.1,
    'Construction & Real Estate': 1.0,
    'Manufacturing - Automobiles': 0.9,
    'Pharmaceuticals & Healthcare': 0.8,
    'FMCG & Consumer Goods': 0.7,
    'Information Technology': 0.5,
    'Banking & Financial Services': 0.3,
}

# Expected NIR ranges by sector (for validation)
SECTOR_NIR_RANGES = {
    'Metals & Mining': (0.08, 0.45),
    'Cement Manufacturing': (0.08, 0.40),
    'Oil & Gas': (0.06, 0.35),
    'Chemicals & Fertilizers': (0.05, 0.30),
    'Energy & Power': (0.04, 0.25),
    'Manufacturing - Automobiles': (0.03, 0.20),
    'Pharmaceuticals & Healthcare': (0.02, 0.12),
    'FMCG & Consumer Goods': (0.02, 0.10),
    'Information Technology': (0.005, 0.06),
    'Banking & Financial Services': (0.002, 0.04),
}

# GIST benchmarks for validation
GIST_BENCHMARKS = {
    'Cement Manufacturing': 0.28,
    'Metals & Mining': 0.35,
    'Oil & Gas': 0.22,
    'Chemicals & Fertilizers': 0.18,
    'FMCG & Consumer Goods': 0.08,
    'Pharmaceuticals & Healthcare': 0.06,
    'Information Technology': 0.02,
    'Banking & Financial Services': 0.01,
}

# =============================================================================
# SECTOR MSA OVERRIDES (Session 23 - 8→29 Sector Expansion)
# See SECTOR_BIODIVERSITY_MAPPING_v1.md for full methodology
# =============================================================================

SECTOR_MSA_OVERRIDES = {
    # Service Sectors (Zero Direct Impact - leased offices only) - Rationale: S1
    # These sectors operate from leased office buildings with ZERO direct land use
    # Their biodiversity impact is 100% supply chain (Scope 3)
    'Banking & Financial Services': 0.00,      # S1: Pure financing, leased offices only
    'Insurance': 0.00,                         # S1: Pure financial services
    'Financial Services - NBFC': 0.00,         # S1: Non-banking finance
    'Information Technology': 0.02,            # S1: Offices + data centers (some footprint)
    'Media & Entertainment': 0.02,             # S1: Studios, offices
    'R&D Services': 0.02,                      # S1: Research facilities

    # Service Sectors (Minimal Direct Impact) - Rationale: S2-S4
    'Healthcare Services': 0.05,               # S2: Hospital campuses
    'Telecom & Communication': 0.08,           # S3: Towers, fiber routes
    'Retail': 0.10,                            # S4: Stores, warehouses (mostly leased)
    'Distribution & Trading': 0.08,            # S3: Warehouses only
    'Hospitality & Leisure': 0.15,             # S4: Hotels, resorts (some owned land)

    # Light Manufacturing - Rationale: M1
    'FMCG & Consumer Goods': 0.25,             # M1: Factories, warehouses
    'Pharmaceuticals & Healthcare': 0.20,      # M1: Pharma plants (compact)
    'Manufacturing - Consumer Electronics': 0.15,  # M1: Assembly facilities
    'Textiles & Apparel': 0.30,                # M1: Mills, dyeing units

    # Heavy Manufacturing - Rationale: M2, H2
    'Manufacturing - Automobiles': 0.30,       # M2: Large assembly plants
    'Manufacturing - Engineering': 0.30,       # M2: Industrial equipment
    'Manufacturing - Paints & Coatings': 0.25, # M2: Chemical plants
    'Chemicals & Fertilizers': 0.40,           # H2: Chemical/fertilizer plants

    # Heavy Industry - Highest Impact - Rationale: H1
    'Metals & Mining': 0.65,                   # H1: Open-pit, tailings (INCREASED)
    'Oil & Gas': 0.55,                         # H1: Refineries, pipelines
    'Cement Manufacturing': 0.55,              # H2: Quarries, plants

    # Agriculture-linked - Rationale: A1
    'Manufacturing - Agro Processing': 0.45,   # A1: Processing + sourcing
    'Manufacturing - Paper & Pulp': 0.50,      # A1: Mills + forestry

    # Energy - Rationale: E1
    'Energy & Power': 0.45,                    # E1: Power plants, mixed sources

    # Construction - Rationale: C1
    'Construction & Real Estate': 0.35,        # C1: Development sites
    'Construction & Engineering': 0.35,        # C1: Infrastructure projects

    # Transport - Rationale: T1
    'Transportation & Logistics': 0.20,        # T1: Terminals, depots

    # Diversified - Rationale: X1
    'Diversified Conglomerate': 0.35,          # X1: Weighted average
}

# Scope3 Factor Adjustments (only where needed based on supply chain analysis)
SECTOR_SCOPE3_ADJUSTMENTS = {
    'Manufacturing - Agro Processing': 0.0060,   # Agricultural supply chain
    'Manufacturing - Paper & Pulp': 0.0040,      # Forestry supply chain
    'Cement Manufacturing': 0.0040,              # Raw material extraction
    'Construction & Engineering': 0.0020,        # Materials, equipment
}


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def safe_value(val, default=0):
    """Return value or default if NaN/None"""
    if pd.isna(val) or val is None:
        return default
    return float(val)


def get_water_price(stress_score):
    """
    Calculate stress-adjusted water price.
    Water_Stress_Score is 0-5 scale.
    """
    stress = min(max(safe_value(stress_score, 0), 0), 5)
    multiplier = 1 + (stress * COEFFICIENTS['WATER_STRESS_MULTIPLIER'])
    return COEFFICIENTS['WATER_BASE_PRICE'] * multiplier


def get_land_multiplier(sector):
    """Get sector-specific land ES multiplier"""
    return SECTOR_LAND_MULTIPLIER.get(sector, 1.0)


def get_pa_multiplier(pa_proximity_score):
    """
    Calculate Protected Area proximity multiplier.

    PA_Proximity_Score is 0-0.14 (average of 1/(1+distance) across facilities)
    Scale by 7 to get 0-1 range, then add 1 for 1.0-2.0 multiplier
    """
    score = safe_value(pa_proximity_score, 0)
    scaled = min(score * COEFFICIENTS['PA_SCORE_SCALE'], 1.0)  # Cap at 1.0
    return 1.0 + scaled  # Range: 1.0 to 2.0


def get_nii_rating(score):
    """Convert NII Score to rating category"""
    if score >= 8.0:
        return "Excellent"
    elif score >= 6.0:
        return "Good"
    elif score >= 4.0:
        return "Average"
    elif score >= 2.0:
        return "Poor"
    else:
        return "Critical"


def slugify(name):
    """Convert company name to URL-friendly slug"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug[:100]


def parse_waste_notes(row):
    """
    Parse notes to separate:
    1. Overburden (Mining) - inert rock
    2. EPR Plastic (FMCG) - post-consumer collection
    3. Operational/Internal - actual company waste

    Returns dict with separated values.
    """
    total_waste = safe_value(row['Waste_Generated_MT'])
    total_plastic = safe_value(row['Plastic_Waste_MT'])

    result = {
        'operational_waste_mt': total_waste,
        'operational_plastic_mt': total_plastic,
        'overburden_mt': 0,
        'epr_plastic_mt': 0,
        'has_overburden_notes': False,
        'has_epr_notes': False,
    }

    # Check Waste notes for OVERBURDEN
    waste_notes = str(row.get('Waste_Generated_MT_Notes', '') or '')
    if 'INCLUDES_OVERBURDEN' in waste_notes.upper():
        result['has_overburden_notes'] = True

        # Try to extract operational value from notes
        # Pattern: "Operational waste ~2M MT" or "operational ~X MT"
        match = re.search(r'operational[^0-9]*~?(\d+\.?\d*)\s*(M|K)?\s*MT', waste_notes, re.I)
        if match:
            value = float(match.group(1))
            unit = match.group(2)
            if unit:
                multiplier = {'M': 1e6, 'K': 1e3}.get(unit.upper(), 1)
            else:
                multiplier = 1
            result['operational_waste_mt'] = value * multiplier
            result['overburden_mt'] = total_waste - result['operational_waste_mt']
        else:
            # No explicit operational value, assume 0.1% is operational
            result['operational_waste_mt'] = total_waste * 0.001
            result['overburden_mt'] = total_waste * 0.999

    # Check Plastic notes for EPR
    plastic_notes = str(row.get('Plastic_Waste_MT_Notes', '') or '')
    if 'INCLUDES_EPR' in plastic_notes.upper() or 'EPR' in plastic_notes.upper():
        result['has_epr_notes'] = True

        # Try to extract internal value from notes
        # Pattern: "Internal plastic is ~13,000 MT" or "Internal is X MT"
        match = re.search(r'internal[^0-9]*~?(\d+[,\d]*\.?\d*)\s*MT', plastic_notes, re.I)
        if match:
            value = float(match.group(1).replace(',', ''))
            result['operational_plastic_mt'] = value
            result['epr_plastic_mt'] = max(0, total_plastic - value)
        else:
            # No explicit internal value, assume 10% is internal
            result['operational_plastic_mt'] = total_plastic * 0.1
            result['epr_plastic_mt'] = total_plastic * 0.9

    return result


# =============================================================================
# DIMENSION CALCULATIONS
# =============================================================================

def calculate_nc_climate(row):
    """
    Calculate Climate Natural Capital (Rs Cr)

    Components:
    - Scope 1 GHG: Full SCC
    - Scope 2 GHG: Full SCC
    - Scope 3 GHG: 50% SCC (indirect responsibility)
    - Renewable Energy: Credit (avoided emissions)
    """
    SCC = COEFFICIENTS['SCC_INDIA']
    GRID_EF = COEFFICIENTS['GRID_EF']

    scope1 = safe_value(row['Scope1_GHG_tCO2e'])
    scope2 = safe_value(row['Scope2_GHG_tCO2e'])
    scope3 = safe_value(row['Scope3_GHG_tCO2e'])
    re_gj = safe_value(row['Renewable_Energy_GJ'])

    # Damages (Rs)
    scope1_damage = scope1 * SCC
    scope2_damage = scope2 * SCC
    scope3_damage = scope3 * SCC * COEFFICIENTS['SCOPE3_GHG_DISCOUNT']

    # Credit (Rs) - avoided grid emissions
    # RE credit ONLY offsets Scope 2 (grid electricity), not Scope 1 or 3
    re_credit = re_gj * GRID_EF * SCC

    # Apply RE credit to Scope 2 only (can't go negative)
    scope2_net = max(scope2_damage - re_credit, 0)

    # Total in Rs Crores (Scope 1 + Scope 2 net + Scope 3)
    total_rs = scope1_damage + scope2_net + scope3_damage
    total_cr = total_rs / 1e7

    return max(total_cr, 0)


def calculate_nc_water(row):
    """
    Calculate Water Natural Capital (Rs Cr)

    Components:
    - Water consumption with stress multiplier (0-5 scale)
    - Recycling credit
    """
    water_kl = safe_value(row['Water_Consumption_KL'])
    stress = safe_value(row['Water_Stress_Score'])
    recycling_pct = safe_value(row['Water_Recycling_Pct'])

    # Convert to ML
    water_ml = water_kl / 1000

    # Stress-adjusted price
    unit_price = get_water_price(stress)

    # Consumption damage
    consumption_damage = water_ml * unit_price

    # Recycling credit
    recycled_ml = water_ml * (recycling_pct / 100)
    recycling_credit = recycled_ml * unit_price * COEFFICIENTS['WATER_RECYCLING_CREDIT']

    # Total in Rs Crores
    total_rs = consumption_damage - recycling_credit
    total_cr = total_rs / 1e7

    return max(total_cr, 0)


def calculate_nc_land(row):
    """
    Calculate Land Natural Capital (Rs Cr)

    Components:
    - Land footprint with sector multiplier
    - Land degradation
    - Restoration credit
    """
    sector = row['Sector']

    total_land = safe_value(row['Total_Land_ha'])
    degraded = safe_value(row['Land_Degraded_HA_Calculated'])
    restored = safe_value(row['Land_Restored_ha'])

    # Land footprint with sector multiplier
    land_mult = get_land_multiplier(sector)
    footprint_damage = total_land * COEFFICIENTS['LAND_ES_VALUE'] * land_mult

    # Degradation
    degradation_damage = degraded * COEFFICIENTS['DEGRADATION_COST']

    # Restoration credit
    restoration_credit = restored * COEFFICIENTS['RESTORATION_CREDIT']

    # Total in Rs Crores
    total_rs = footprint_damage + degradation_damage - restoration_credit
    total_cr = total_rs / 1e7

    return max(total_cr, 0)


def calculate_nc_biodiversity(row):
    """
    Calculate Biodiversity Natural Capital (Rs Cr)

    Components:
    1. Direct MSA loss: MSA_Loss * MSA_FACTOR * Revenue * PA_Multiplier
    2. Scope 3 biodiversity: Scope3_Biodiversity_MSA * 50% (ALREADY in Rs Cr!)

    KEY INSIGHT: Scope3_Biodiversity_MSA = V7_Scope3_Factor * Revenue_Cr
    It's already a calculated value in Rs Cr, not a 0-1 MSA fraction!

    FIX (Session 23): Use sector-specific MSA overrides for service sectors
    which have near-zero direct biodiversity impact (Banking=0.02, IT=0.05, etc.)
    """
    sector = row['Sector']
    # Use sector override if defined, otherwise fall back to database value
    msa_loss = SECTOR_MSA_OVERRIDES.get(sector, safe_value(row['Base_MSA_Loss']))
    scope3_bio = safe_value(row['Scope3_Biodiversity_MSA'])
    pa_score = safe_value(row['PA_Proximity_Score'])
    revenue_cr = safe_value(row['Revenue_Cr'], 1)

    # PA proximity multiplier (1.0 to 2.0)
    pa_mult = get_pa_multiplier(pa_score)

    # Direct biodiversity damage (Rs Cr)
    # MSA_FACTOR calibrated so MSA=0.5 produces ~4% of revenue
    direct_damage_cr = msa_loss * COEFFICIENTS['MSA_FACTOR'] * revenue_cr * pa_mult

    # Scope 3 biodiversity (ALREADY in Rs Cr)
    # Apply 50% discount for indirect responsibility
    scope3_damage_cr = scope3_bio * COEFFICIENTS['SCOPE3_BIO_DISCOUNT']

    # Total
    total_cr = direct_damage_cr + scope3_damage_cr

    return max(total_cr, 0)


def calculate_nc_pollution(row):
    """
    Calculate Pollution Natural Capital (Rs Cr)

    DIFFERENTIATED APPROACH:
    1. Operational waste: Full cost (Rs 20,000/MT)
    2. Mining overburden: Low cost (Rs 50/MT) - inert rock
    3. Internal plastic: High cost (Rs 50,000/MT)
    4. EPR plastic: Collection cost only (Rs 5,000/MT)
    5. E-waste: Hazardous cost (Rs 70,000/MT)
    6. HAP: Air pollution (Rs 500/kg)
    7. Recycling credit on operational waste
    """
    # Parse notes for overburden and EPR separation
    parsed = parse_waste_notes(row)

    ewaste_mt = safe_value(row['E_Waste_MT'])
    hap_kg = safe_value(row['Hazardous_Air_Pollutants'])
    recycling_pct = safe_value(row['Waste_Recycled_Pct'])

    # Operational waste (excluding overburden)
    operational_cost = parsed['operational_waste_mt'] * COEFFICIENTS['OPERATIONAL_WASTE_COST']

    # Mining overburden (very low cost - inert)
    overburden_cost = parsed['overburden_mt'] * COEFFICIENTS['OVERBURDEN_COST']

    # Plastic waste (differentiated)
    internal_plastic_cost = parsed['operational_plastic_mt'] * COEFFICIENTS['INTERNAL_PLASTIC_COST']
    epr_plastic_cost = parsed['epr_plastic_mt'] * COEFFICIENTS['EPR_PLASTIC_COST']

    # E-waste (hazardous)
    ewaste_cost = ewaste_mt * COEFFICIENTS['EWASTE_COST']

    # HAP (air pollution)
    hap_cost = hap_kg * COEFFICIENTS['HAP_COST']

    # Recycling credit (on operational waste only)
    recycled_mt = parsed['operational_waste_mt'] * (recycling_pct / 100)
    recycling_credit = recycled_mt * COEFFICIENTS['RECYCLING_CREDIT']

    # Total in Rs
    total_rs = (operational_cost + overburden_cost +
                internal_plastic_cost + epr_plastic_cost +
                ewaste_cost + hap_cost - recycling_credit)

    # Convert to Crores
    total_cr = total_rs / 1e7

    return max(total_cr, 0)


# =============================================================================
# AGGREGATION & SCORING
# =============================================================================

def calculate_all_nc(df):
    """Calculate all Natural Capital columns"""
    print("[INFO] Calculating NC_Climate_Cr...")
    df['NC_Climate_Cr'] = df.apply(calculate_nc_climate, axis=1)

    print("[INFO] Calculating NC_Water_Cr...")
    df['NC_Water_Cr'] = df.apply(calculate_nc_water, axis=1)

    print("[INFO] Calculating NC_Land_Cr...")
    df['NC_Land_Cr'] = df.apply(calculate_nc_land, axis=1)

    print("[INFO] Calculating NC_Biodiversity_Cr...")
    df['NC_Biodiversity_Cr'] = df.apply(calculate_nc_biodiversity, axis=1)

    print("[INFO] Calculating NC_Pollution_Cr...")
    df['NC_Pollution_Cr'] = df.apply(calculate_nc_pollution, axis=1)

    # Aggregate: TAESC
    print("[INFO] Calculating TAESC_Cr...")
    df['TAESC_Cr'] = (
        df['NC_Climate_Cr'] +
        df['NC_Water_Cr'] +
        df['NC_Land_Cr'] +
        df['NC_Biodiversity_Cr'] +
        df['NC_Pollution_Cr']
    )

    # NIR: Nature Intensity Ratio
    print("[INFO] Calculating NIR...")
    df['NIR'] = df['TAESC_Cr'] / df['Revenue_Cr'].replace(0, np.nan)
    df['NIR'] = df['NIR'].fillna(0)

    return df


def calculate_scores_and_ranks(df):
    """Calculate NII Score, ranks, and ratings"""
    print("[INFO] Calculating NII Scores and Ranks...")

    # NII Score: Percentile-based (lower NIR = higher score)
    all_nir = df['NIR'].values
    df['NII_Score'] = df['NIR'].apply(
        lambda x: round(10 * (1 - stats.percentileofscore(all_nir, x, kind='rank') / 100), 1)
        if x > 0 else 10.0
    )

    # Global rank (1 = best)
    df['NII_Rank'] = df['NII_Score'].rank(ascending=False, method='min').astype(int)

    # Sector rank
    df['NII_Sector_Rank'] = df.groupby('Sector')['NII_Score'].rank(
        ascending=False, method='min'
    ).astype(int)

    # Rating
    df['NII_Rating'] = df['NII_Score'].apply(get_nii_rating)

    # Percentile
    df['NII_Percentile'] = df['NII_Score'].apply(
        lambda x: round(stats.percentileofscore(df['NII_Score'].values, x, kind='rank'), 0)
    )

    return df


# =============================================================================
# VALIDATION (Triple-Loop)
# =============================================================================

def validate_loop1_statistical(df):
    """Loop 1: Check if NIR within expected sector ranges"""
    print("[INFO] Running Loop 1: Statistical validation...")

    total = len(df)
    passed = 0

    for _, row in df.iterrows():
        sector = row['Sector']
        nir = row['NIR']

        expected = SECTOR_NIR_RANGES.get(sector, (0.01, 0.50))
        if expected[0] <= nir <= expected[1]:
            passed += 1

    pct = (passed / total) * 100
    status = "PASS" if pct >= 80 else "WARNING" if pct >= 60 else "FAIL"
    print(f"[{status}] Loop 1: {passed}/{total} ({pct:.1f}%) within sector ranges")

    return pct


def validate_loop2_consistency(df):
    """Loop 2: Cross-indicator consistency checks"""
    print("[INFO] Running Loop 2: Consistency validation...")

    total = len(df)
    passed = 0

    for _, row in df.iterrows():
        issues = 0

        # Check: Climate should be significant for energy-intensive sectors
        if row['Sector'] in ['Energy & Power', 'Metals & Mining', 'Cement Manufacturing']:
            if row['TAESC_Cr'] > 0 and row['NC_Climate_Cr'] / row['TAESC_Cr'] < 0.1:
                issues += 1

        # Check: Water should be significant for water-intensive sectors
        if row['Sector'] in ['Chemicals & Fertilizers', 'Textiles & Apparel']:
            if row['Water_Stress_Score'] > 3 and row['TAESC_Cr'] > 0:
                if row['NC_Water_Cr'] / row['TAESC_Cr'] < 0.05:
                    issues += 1

        if issues == 0:
            passed += 1

    pct = (passed / total) * 100
    status = "PASS" if pct >= 85 else "WARNING" if pct >= 70 else "FAIL"
    print(f"[{status}] Loop 2: {passed}/{total} ({pct:.1f}%) consistency checks pass")

    return pct


def validate_loop3_external(df):
    """Loop 3: Compare with GIST benchmarks"""
    print("[INFO] Running Loop 3: External triangulation (GIST benchmarks)...")

    sectors_checked = 0
    sectors_passed = 0

    print("[INFO] GIST Comparison:")
    for sector, benchmark in GIST_BENCHMARKS.items():
        sector_data = df[df['Sector'] == sector]
        if len(sector_data) == 0:
            continue

        sectors_checked += 1
        avg_nir = sector_data['NIR'].mean()
        deviation = abs(avg_nir - benchmark) / benchmark * 100

        if deviation < 100:  # Within 100% of GIST (2x tolerance)
            sectors_passed += 1
            status = "[OK]"
        else:
            status = "[WARN]"

        print(f"  {status} {sector}: Our={avg_nir:.3f}, GIST={benchmark:.3f}, Dev={deviation:.1f}%")

    pct = (sectors_passed / sectors_checked) * 100 if sectors_checked > 0 else 100
    status = "PASS" if pct >= 70 else "WARNING" if pct >= 50 else "FAIL"
    print(f"[{status}] Loop 3: {sectors_passed}/{sectors_checked} ({pct:.1f}%) within GIST benchmarks")

    return pct


def run_validation(df):
    """Run all three validation loops"""
    print("\n" + "="*60)
    print("TRIPLE-LOOP VALIDATION")
    print("="*60)

    loop1_pct = validate_loop1_statistical(df)
    loop2_pct = validate_loop2_consistency(df)
    loop3_pct = validate_loop3_external(df)

    overall_pct = (loop1_pct + loop2_pct + loop3_pct) / 3

    print("\n" + "-"*60)
    if overall_pct >= 75:
        print(f"[PASS] Overall validation: {overall_pct:.1f}%")
    elif overall_pct >= 60:
        print(f"[WARNING] Overall validation: {overall_pct:.1f}%")
    else:
        print(f"[FAIL] Overall validation: {overall_pct:.1f}%")
    print("-"*60 + "\n")

    return overall_pct


# =============================================================================
# JSON GENERATION
# =============================================================================

def generate_company_json(row, sector_stats):
    """Generate JSON data for a single company"""
    company_name = row['Company_Name']
    sector = row['Sector']
    sector_stat = sector_stats.get(sector, {})

    taesc = row['TAESC_Cr'] if row['TAESC_Cr'] > 0 else 1  # Avoid division by zero

    return {
        'company_name': company_name,
        'slug': slugify(company_name),
        'sector': sector,
        'state': row['State'] if pd.notna(row['State']) else 'Unknown',
        'revenue_cr': round(safe_value(row['Revenue_Cr']), 2),

        'nii_score': round(row['NII_Score'], 1),
        'nii_rank': int(row['NII_Rank']),
        'nii_sector_rank': int(row['NII_Sector_Rank']),
        'nii_rating': row['NII_Rating'],
        'nii_percentile': int(row['NII_Percentile']),

        'taesc_cr': round(row['TAESC_Cr'], 2),
        'nir': round(row['NIR'], 4),
        'nir_pct': round(row['NIR'] * 100, 2),

        'breakdown': {
            'climate': {
                'value_cr': round(row['NC_Climate_Cr'], 2),
                'pct': round(row['NC_Climate_Cr'] / taesc * 100, 1)
            },
            'water': {
                'value_cr': round(row['NC_Water_Cr'], 2),
                'pct': round(row['NC_Water_Cr'] / taesc * 100, 1)
            },
            'land': {
                'value_cr': round(row['NC_Land_Cr'], 2),
                'pct': round(row['NC_Land_Cr'] / taesc * 100, 1)
            },
            'biodiversity': {
                'value_cr': round(row['NC_Biodiversity_Cr'], 2),
                'pct': round(row['NC_Biodiversity_Cr'] / taesc * 100, 1)
            },
            'pollution': {
                'value_cr': round(row['NC_Pollution_Cr'], 2),
                'pct': round(row['NC_Pollution_Cr'] / taesc * 100, 1)
            }
        },

        'raw_data': {
            'scope1_ghg_tco2e': round(safe_value(row['Scope1_GHG_tCO2e']), 0),
            'scope2_ghg_tco2e': round(safe_value(row['Scope2_GHG_tCO2e']), 0),
            'scope3_ghg_tco2e': round(safe_value(row['Scope3_GHG_tCO2e']), 0),
            'water_consumption_kl': round(safe_value(row['Water_Consumption_KL']), 0),
            'water_stress_score': round(safe_value(row['Water_Stress_Score']), 2),
            'total_land_ha': round(safe_value(row['Total_Land_ha']), 2),
            'base_msa_loss': round(safe_value(row['Base_MSA_Loss']), 3),
            'pa_proximity_score': round(safe_value(row['PA_Proximity_Score']), 4),
            'waste_generated_mt': round(safe_value(row['Waste_Generated_MT']), 0),
            'renewable_energy_pct': round(safe_value(row['Renewable_Energy_Pct']), 1),
        },

        'peer_comparison': {
            'sector_median_score': round(sector_stat.get('median_score', 5.0), 1),
            'sector_best_score': round(sector_stat.get('best_score', 10.0), 1),
            'sector_median_taesc': round(sector_stat.get('median_taesc', 0), 2),
            'sector_best_taesc': round(sector_stat.get('best_taesc', 0), 2),
        },

        'data_quality': {
            'tier': row['Data_Tier'] if pd.notna(row['Data_Tier']) else 'Unknown',
            'confidence': row['Confidence'] if pd.notna(row['Confidence']) else 'Medium',
        }
    }


def generate_all_json(df):
    """Generate all JSON output files"""
    print("[INFO] Generating JSON files...")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/companies", exist_ok=True)

    # Sector stats for peer comparison
    sector_stats = {}
    for sector in df['Sector'].unique():
        sector_data = df[df['Sector'] == sector]
        sector_stats[sector] = {
            'median_score': sector_data['NII_Score'].median(),
            'best_score': sector_data['NII_Score'].max(),
            'median_taesc': sector_data['TAESC_Cr'].median(),
            'best_taesc': sector_data['TAESC_Cr'].min(),
        }

    # Per-company JSON
    print(f"[INFO] Generating {len(df)} company JSON files...")
    for _, row in df.iterrows():
        company_data = generate_company_json(row, sector_stats)
        slug = company_data['slug']
        with open(f"{OUTPUT_DIR}/companies/{slug}.json", 'w', encoding='utf-8') as f:
            json.dump(company_data, f, indent=2, ensure_ascii=False)

    # Rankings JSON
    print("[INFO] Generating rankings.json...")
    rankings_data = {
        'generated_at': datetime.now().isoformat(),
        'total_companies': len(df),
        'companies': []
    }
    for _, row in df.sort_values('NII_Rank').iterrows():
        rankings_data['companies'].append({
            'company_name': row['Company_Name'],
            'slug': slugify(row['Company_Name']),
            'sector': row['Sector'],
            'state': row['State'] if pd.notna(row['State']) else 'Unknown',
            'nii_score': round(row['NII_Score'], 1),
            'nii_rank': int(row['NII_Rank']),
            'taesc_cr': round(row['TAESC_Cr'], 2),
            'nir': round(row['NIR'], 4),
            'rating': row['NII_Rating'],
            'confidence': row['Confidence'] if pd.notna(row['Confidence']) else 'Medium',
        })
    with open(f"{OUTPUT_DIR}/rankings.json", 'w', encoding='utf-8') as f:
        json.dump(rankings_data, f, indent=2, ensure_ascii=False)

    # Sectors JSON
    print("[INFO] Generating sectors.json...")
    sectors_data = {'sectors': []}
    for sector in sorted(df['Sector'].unique()):
        sector_df = df[df['Sector'] == sector]
        best = sector_df.loc[sector_df['NII_Score'].idxmax()]
        worst = sector_df.loc[sector_df['NII_Score'].idxmin()]

        sectors_data['sectors'].append({
            'sector': sector,
            'company_count': len(sector_df),
            'avg_nii_score': round(sector_df['NII_Score'].mean(), 1),
            'avg_taesc_cr': round(sector_df['TAESC_Cr'].mean(), 2),
            'avg_nir': round(sector_df['NIR'].mean(), 4),
            'median_nir': round(sector_df['NIR'].median(), 4),
            'best_company': {
                'name': best['Company_Name'],
                'slug': slugify(best['Company_Name']),
                'score': round(best['NII_Score'], 1)
            },
            'worst_company': {
                'name': worst['Company_Name'],
                'slug': slugify(worst['Company_Name']),
                'score': round(worst['NII_Score'], 1)
            },
            'avg_breakdown': {
                'climate_cr': round(sector_df['NC_Climate_Cr'].mean(), 2),
                'water_cr': round(sector_df['NC_Water_Cr'].mean(), 2),
                'land_cr': round(sector_df['NC_Land_Cr'].mean(), 2),
                'biodiversity_cr': round(sector_df['NC_Biodiversity_Cr'].mean(), 2),
                'pollution_cr': round(sector_df['NC_Pollution_Cr'].mean(), 2),
            }
        })
    with open(f"{OUTPUT_DIR}/sectors.json", 'w', encoding='utf-8') as f:
        json.dump(sectors_data, f, indent=2, ensure_ascii=False)

    # Metadata JSON
    print("[INFO] Generating metadata.json...")
    metadata = {
        'generated_at': datetime.now().isoformat(),
        'database_version': 'v7.8.0_NC_CALCULATED',
        'source_version': 'v7.7.0_SECTORS_FINAL',
        'total_companies': len(df),
        'total_sectors': df['Sector'].nunique(),
        'statistics': {
            'avg_nii_score': round(df['NII_Score'].mean(), 2),
            'median_nii_score': round(df['NII_Score'].median(), 2),
            'avg_taesc_cr': round(df['TAESC_Cr'].mean(), 2),
            'total_taesc_cr': round(df['TAESC_Cr'].sum(), 2),
            'avg_nir': round(df['NIR'].mean(), 4),
            'median_nir': round(df['NIR'].median(), 4),
        },
        'dimension_totals_cr': {
            'climate': round(df['NC_Climate_Cr'].sum(), 2),
            'water': round(df['NC_Water_Cr'].sum(), 2),
            'land': round(df['NC_Land_Cr'].sum(), 2),
            'biodiversity': round(df['NC_Biodiversity_Cr'].sum(), 2),
            'pollution': round(df['NC_Pollution_Cr'].sum(), 2),
        },
        'rating_distribution': {
            'Excellent': len(df[df['NII_Rating'] == 'Excellent']),
            'Good': len(df[df['NII_Rating'] == 'Good']),
            'Average': len(df[df['NII_Rating'] == 'Average']),
            'Poor': len(df[df['NII_Rating'] == 'Poor']),
            'Critical': len(df[df['NII_Rating'] == 'Critical']),
        },
        'coefficients_used': COEFFICIENTS,
    }
    with open(f"{OUTPUT_DIR}/metadata.json", 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"[DONE] Generated {len(df) + 3} JSON files in {OUTPUT_DIR}/")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*60)
    print("NATURAL CAPITAL CALCULATION - INII STANDARD v2.0")
    print("="*60)
    print()
    print("FIXES APPLIED:")
    print("  1. PA_Proximity_Score: Uses 0-0.14 range correctly")
    print("  2. Scope3_Biodiversity_MSA: Already in Rs Cr")
    print("  3. Waste: Parses notes for OVERBURDEN and EPR separation")
    print()

    # Load database
    print(f"[INFO] Loading database: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)
    print(f"[INFO] Loaded {len(df)} companies, {len(df.columns)} columns")
    print(f"[INFO] Sectors: {df['Sector'].nunique()}")
    print()

    # Calculate NC values
    print("[INFO] Calculating Natural Capital values...")
    df = calculate_all_nc(df)

    # Calculate scores and ranks
    df = calculate_scores_and_ranks(df)

    # Print summary
    print("\n" + "-"*60)
    print("CALCULATION SUMMARY")
    print("-"*60)
    print(f"Total TAESC: Rs {df['TAESC_Cr'].sum():,.0f} Cr")
    print(f"Average TAESC: Rs {df['TAESC_Cr'].mean():,.2f} Cr")
    print(f"Average NIR: {df['NIR'].mean()*100:.2f}%")
    print(f"Median NIR: {df['NIR'].median()*100:.2f}%")
    print(f"Average NII Score: {df['NII_Score'].mean():.1f}")
    print()

    total_taesc = df['TAESC_Cr'].sum()
    print("Dimension Breakdown (Total Rs Cr):")
    print(f"  Climate:      Rs {df['NC_Climate_Cr'].sum():>12,.0f} Cr ({df['NC_Climate_Cr'].sum()/total_taesc*100:.1f}%)")
    print(f"  Water:        Rs {df['NC_Water_Cr'].sum():>12,.0f} Cr ({df['NC_Water_Cr'].sum()/total_taesc*100:.1f}%)")
    print(f"  Land:         Rs {df['NC_Land_Cr'].sum():>12,.0f} Cr ({df['NC_Land_Cr'].sum()/total_taesc*100:.1f}%)")
    print(f"  Biodiversity: Rs {df['NC_Biodiversity_Cr'].sum():>12,.0f} Cr ({df['NC_Biodiversity_Cr'].sum()/total_taesc*100:.1f}%)")
    print(f"  Pollution:    Rs {df['NC_Pollution_Cr'].sum():>12,.0f} Cr ({df['NC_Pollution_Cr'].sum()/total_taesc*100:.1f}%)")
    print()

    print("Rating Distribution:")
    for rating in ['Excellent', 'Good', 'Average', 'Poor', 'Critical']:
        count = len(df[df['NII_Rating'] == rating])
        print(f"  {rating:10}: {count:3} companies ({count/len(df)*100:.1f}%)")
    print("-"*60)

    # Run validation
    run_validation(df)

    # Save enhanced CSV
    print(f"[INFO] Saving enhanced database: {OUTPUT_CSV}")
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"[DONE] Saved {len(df)} companies with {len(df.columns)} columns")

    # Generate JSON files
    generate_all_json(df)

    print()
    print("="*60)
    print("[COMPLETE] Natural Capital calculation finished!")
    print("="*60)
    print()
    print("Output files:")
    print(f"  - {OUTPUT_CSV}")
    print(f"  - {OUTPUT_DIR}/rankings.json")
    print(f"  - {OUTPUT_DIR}/sectors.json")
    print(f"  - {OUTPUT_DIR}/metadata.json")
    print(f"  - {OUTPUT_DIR}/companies/*.json (525 files)")
    print()


if __name__ == "__main__":
    main()
