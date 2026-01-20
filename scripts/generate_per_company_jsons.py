"""
Generate Individual JSON Files for Each Company
Creates 540 separate JSON files (one per company)
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime
import re

base_dir = Path(r"C:\Users\Vinay Bale\Documents\nature-impact-index")
data_dir = base_dir / "data"
output_dir = data_dir / "company_jsons"

# Create output directory
output_dir.mkdir(exist_ok=True)

print("="*80)
print("GENERATE PER-COMPANY JSON FILES")
print("="*80)
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Load master dataset
print("\n[STEP 1] Loading master dataset...")
master_df = pd.read_csv(data_dir / "master_573_companies_COMPLETE.csv")
dpi_df = pd.read_csv(data_dir / "data_preparedness_index_573.csv")

print(f"[OK] Loaded {len(master_df)} records for {master_df['Company_Name'].nunique()} companies")

# Function to create safe filename
def create_safe_filename(company_name):
    """Convert company name to safe filename"""
    # Remove special characters, replace spaces with underscores
    safe_name = re.sub(r'[^\w\s-]', '', company_name)
    safe_name = re.sub(r'[-\s]+', '_', safe_name)
    safe_name = safe_name.lower().strip('_')
    return f"{safe_name}.json"

# Generate JSON for each company
print("\n[STEP 2] Generating individual JSON files...")

companies = master_df['Company_Name'].unique()
files_created = 0

for company in companies:
    company_data = master_df[master_df['Company_Name'] == company]
    company_dpi = dpi_df[dpi_df['Company_Name'] == company].iloc[0]

    # Get sector
    sector = company_data['Sector'].iloc[0] if 'Sector' in company_data.columns else 'Unknown'

    # Organize indicators by dimension
    indicators_by_dimension = {}
    all_indicators = []

    for _, row in company_data.iterrows():
        dimension = row['Dimension']

        indicator_dict = {
            'indicator_id': row['Indicator_ID'],
            'value': float(row['Value']) if pd.notna(row['Value']) and str(row['Value']).replace('.','').replace('-','').replace('e','').replace('+','').isdigit() else str(row['Value']),
            'unit': row['Unit'],
            'data_tier': row['Data_Tier'],
            'confidence': row['Confidence'],
            'source': row['Source_URL'],
            'data_year': row['Data_Year'],
            'dimension': dimension
        }

        all_indicators.append(indicator_dict)

        if dimension not in indicators_by_dimension:
            indicators_by_dimension[dimension] = []

        indicators_by_dimension[dimension].append(indicator_dict)

    # Create company JSON
    company_json = {
        'metadata': {
            'company_name': company,
            'sector': sector,
            'company_type': company_dpi['Company_Type'],
            'generated_date': datetime.now().isoformat()
        },
        'data_quality': {
            'data_preparedness_index': float(company_dpi['Data_Preparedness_Index']),
            'total_indicators': int(company_dpi['Total_Indicators']),
            'tier_breakdown': {
                'tier1': {
                    'count': int(company_dpi['Tier1_Count']),
                    'percentage': float(company_dpi['Tier1_Pct'])
                },
                'tier2': {
                    'count': int(company_dpi['Tier2_Count']),
                    'percentage': float(company_dpi['Tier2_Pct'])
                },
                'tier3': {
                    'count': int(company_dpi['Tier3_Count']),
                    'percentage': float(company_dpi['Tier3_Pct'])
                }
            }
        },
        'indicators': {
            'all': all_indicators,
            'by_dimension': indicators_by_dimension
        }
    }

    # Save JSON file
    filename = create_safe_filename(company)
    filepath = output_dir / filename

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(company_json, f, indent=2, ensure_ascii=False)

    files_created += 1

    if files_created % 50 == 0:
        print(f"  Created {files_created} files...")

print(f"\n[OK] Created {files_created} company JSON files")
print(f"     Output directory: {output_dir}")

# Create index file
print("\n[STEP 3] Creating company index...")

company_index = []
for company in companies:
    company_dpi = dpi_df[dpi_df['Company_Name'] == company].iloc[0]
    company_data = master_df[master_df['Company_Name'] == company]

    company_index.append({
        'company_name': company,
        'filename': create_safe_filename(company),
        'sector': company_data['Sector'].iloc[0] if 'Sector' in company_data.columns else 'Unknown',
        'company_type': company_dpi['Company_Type'],
        'dpi': float(company_dpi['Data_Preparedness_Index']),
        'total_indicators': int(company_dpi['Total_Indicators'])
    })

# Sort by DPI (descending)
company_index_sorted = sorted(company_index, key=lambda x: x['dpi'], reverse=True)

index_json = {
    'metadata': {
        'total_companies': len(company_index),
        'generated_date': datetime.now().isoformat()
    },
    'companies': company_index_sorted
}

with open(output_dir / '_company_index.json', 'w', encoding='utf-8') as f:
    json.dump(index_json, f, indent=2, ensure_ascii=False)

print(f"[OK] Created company index: {output_dir / '_company_index.json'}")

print("\n" + "="*80)
print("PER-COMPANY JSON GENERATION COMPLETE")
print("="*80)
print(f"  Total companies: {files_created}")
print(f"  Output directory: {output_dir}")
print(f"  Index file: _company_index.json")
print(f"\nCompleted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*80)
