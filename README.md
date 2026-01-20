# India Nature Impact Index & Per Unit Industry Hooks
## Complete Implementation Specification

**Version**: 1.0  
**Date**: December 31, 2025  
**Project**: Urvara.Life Nature Ledger  
**Prepared for**: Claude Code Implementation

---

## 🎯 PROJECT OVERVIEW

This package contains complete specifications for building:

1. **India Nature Impact Index**: Composite ranking of 550 Indian companies on environmental impact (Climate, Water, Land, Biodiversity, Pollution)
2. **Per Unit Industry Hooks**: 7 sector-specific intensity benchmarks (Aviation, Automotive, Pharma, Data Centers, FMCG, Cement, Steel)

**Purpose**: Create a pressure mechanism to drive corporate nature-positive commitments through transparent public rankings.

---

## 📦 PACKAGE CONTENTS

### Core Specification Documents (9 files)

| Document | Purpose | Key Content |
|----------|---------|-------------|
| **01_project_brief.md** | Executive summary | Scope, objectives, design decisions |
| **02_methodology_framework.md** | Academic foundation | Literature review, 50+ citations |
| **03_indicator_definitions.md** | Data dictionary | All 25 sub-indicators defined |
| **04_data_pipeline_spec.md** | Data automation | PDF scraping, extraction logic |
| **05_calculation_engine.md** | Scoring formulas | Normalization, aggregation math |
| **06_gis_biodiversity_module.md** | Spatial analysis | GLOBIO MSA, protected areas |
| **07_frontend_ui_spec.md** | Dashboard design | User interface mockups |
| **08_claude_code_implementation.md** | Build guide | Step-by-step execution |
| **09_manual_setup_checklist.md** | **START HERE** | What YOU do manually |

### Implementation Tools (1 file)

| File | Purpose |
|------|---------|
| **generate_company_list.py** | Generates 550-company CSV |

---

## ⚡ QUICK START GUIDE

### Step 1: Read Document 9 First
**File**: `09_manual_setup_checklist.md`

This tells you:
- 4 geospatial datasets to download (25 minutes)
- Validation steps after automation
- Total manual effort: ~55 minutes

### Step 2: Prepare Geospatial Data
Download these 4 files ONCE:

1. **WDPA Protected Areas** (India)
   - Source: https://www.protectedplanet.net/country/IND
   - File: `wdpa_india.zip` (~50 MB)

2. **Key Biodiversity Areas** (Global)
   - Source: http://www.keybiodiversityareas.org/kba-data/request
   - File: `kba_global.gpkg` (~30 MB)

3. **GLOBIO MSA Raster** (India)
   - Source: https://www.globio.info/download-grip-dataset
   - File: `globio_msa_india.tif` (~100 MB)

4. **WRI Aqueduct Water Stress** (India)
   - Source: https://www.wri.org/data/aqueduct-global-maps-30-data
   - File: `wri_aqueduct_india.zip` (~20 MB)

### Step 3: Upload to Claude Code

1. Create new Claude Code project
2. Upload all 10 files from this package
3. Upload the 4 geospatial datasets
4. Install dependencies:
   ```bash
   pip install pandas geopandas rasterio anthropic pdfplumber requests beautifulsoup4
   ```

### Step 4: Run Implementation

Follow **Document 8** (`08_claude_code_implementation.md`) for detailed build steps.

**High-level pipeline**:
```
Generate company list → Download PDFs → Extract data → 
Geocode facilities → GIS analysis → Imputation → 
Scoring → Build frontend → Deploy
```

**Estimated runtime**: 2-4 hours  
**Cost**: ~$30 (Claude API for PDF extraction)

---

## 🎓 METHODOLOGY HIGHLIGHTS

### Academic Rigor
- **50+ peer-reviewed citations** supporting methodology
- Aligned with **SBTN, TNFD, Natural Capital Protocol**
- Novel application of **GLOBIO MSA model** for biodiversity assessment
- **Transparent imputation** with 3-tier data quality system

### Data Quality
- **Expected completeness**: 65-75% of indicators
- **Tier 1** (direct company data): 40-50%
- **Tier 2** (imputed with models): 30-40%
- **Tier 3** (sector averages): 10-20%

### Technical Innovation
- **Facility-level geospatial analysis** (not just company HQ)
- **MSA-based biodiversity impact** using distance-decay models
- **Context-aware water stress** weighting by WRI Aqueduct basins
- **Client-side interactivity** for zero hosting costs

---

## 📊 EXPECTED OUTPUTS

### 1. Public Dashboard
- **URL**: `nature-impact-index.netlify.app` (or custom domain)
- **Features**:
  - Search 550 companies
  - View rankings and scores
  - Explore detailed indicators
  - Compare sector peers

### 2. Interactive Sandbox
- Adjust dimension weights (real-time recalculation)
- Override company data (async submission)
- Scenario testing

### 3. Industry Hooks
- 7 sector benchmarks
- Per-unit intensity metrics
- Peer comparison within industries

### 4. Downloadable Data
- CSV with all company scores
- Methodology documentation (PDF export)
- Data quality reports

---

## 🔧 TECHNICAL SPECIFICATIONS

### Infrastructure
- **Language**: Python 3.10+
- **GIS**: GeoPandas, Rasterio
- **Frontend**: Static HTML/JS (React optional)
- **Hosting**: Netlify/Vercel (free tier)
- **Database**: JSON files (no backend needed)

### Performance
- **Data pipeline**: 2-4 hours (one-time)
- **Updates**: 3-4 hours every 6 months
- **Dashboard load time**: <2 seconds
- **Ranking recalculation**: <200ms

### Costs
- **One-time setup**: ~$30 (Claude API)
- **Ongoing**: $0-10/month (hosting)
- **Geospatial data**: Free (all datasets are open)

---

## 🎯 SUCCESS METRICS (Phase 1)

### Launch Goals
- ✅ Dashboard live and functional
- ✅ 550 companies ranked
- ✅ 1000+ users in first month
- ✅ 50+ companies submit data corrections
- ✅ Media coverage in 3+ major outlets

### Data Quality
- ✅ 65-75% data completeness achieved
- ✅ Zero methodology challenges from academics
- ✅ Audit trail for all data sources

### User Engagement
- ✅ Average session duration >3 minutes
- ✅ 30% of users interact with sandbox
- ✅ 10+ corporate partnerships for Nature Ledger

---

## 📚 READING ORDER

**If you're new to this project**:
1. Read **Document 1** (Project Brief) - Understand the vision
2. Skim **Document 2** (Methodology) - See the academic rigor
3. Read **Document 9** (Manual Setup) - Know what you need to do
4. Follow **Document 8** (Implementation) - Build it!

**If you're reviewing methodology**:
- **Document 2** - Framework & literature review
- **Document 3** - All 25 indicator definitions
- **Document 5** - Scoring mathematics

**If you're implementing in Claude Code**:
- **Document 9** - Start here (manual tasks)
- **Document 8** - Step-by-step build
- **Document 4** - Data pipeline details
- **Document 6** - GIS implementation

---

## 🚀 PHASED ROADMAP

### Phase 1: MVP (Months 1-4) ← **YOU ARE HERE**
- 550 companies, 15 sectors
- 5 dimensions, 25 indicators
- 7 Industry Hooks
- Static dashboard with sandbox
- 65-75% data completeness

### Phase 2: Spatial Enhancement (Months 5-8)
- Facility-level MSA precision
- Top 200 companies fully geocoded
- Biodiversity dimension refinement
- 75-85% data completeness

### Phase 3: Supply Chain Integration (Months 9-14)
- Scope 3 supply chain modeling
- Commodity risk assessment
- 700-800 company coverage
- 80-90% data completeness

### Phase 4: Real-time & APIs (Months 15-18)
- Live BRSR ingestion
- Company API for data submission
- Monthly/quarterly updates
- Third-party integrations
- 85-95% data completeness

---

## 🆘 TROUBLESHOOTING

### Common Issues

**"PDF scraping blocked by BSE"**
- Solution: Add delays, use VPN, or download top 200 manually

**"Geospatial raster too large"**
- Solution: Clip to India bounding box using QGIS

**"Low geocoding success rate"**
- Solution: Accept city-level precision, flag as Tier 2

**"Claude API errors"**
- Solution: Implement retry logic with exponential backoff

Full troubleshooting guide in **Document 9**.

---

## 📞 SUPPORT & QUESTIONS

**For methodology questions**: Refer to Document 2 (50+ citations)  
**For implementation issues**: Check Document 8 (step-by-step guide)  
**For data quality concerns**: See Document 3 (indicator definitions)  
**For manual tasks**: Document 9 is your checklist

---

## ⚖️ LICENSE & ATTRIBUTION

**Methodology**: Open-source, cite as:
> Urvara.Life (2025). India Nature Impact Index: Methodology Framework. v1.0

**Data Sources**: All geospatial datasets have their own licenses (check source sites)

**Code**: To be released under MIT License (pending implementation)

---

## 🎉 FINAL CHECKLIST

Before uploading to Claude Code:

- [ ] Read Document 9 (Manual Setup Checklist)
- [ ] Downloaded 4 geospatial datasets
- [ ] Have ANTHROPIC_API_KEY ready
- [ ] Understand ~4 hour runtime for first build
- [ ] Budget ~$30 for Claude API costs
- [ ] Ready to deploy to Netlify/GitHub Pages

**Once all checked → You're ready to build!**

---

## 📈 VERSION HISTORY

- **v1.0** (Dec 31, 2025): Initial specification package
  - 9 core documents
  - 25 indicators defined
  - 550 companies targeted
  - 7 Industry Hooks designed
  - Full methodology with 50+ citations

---

**Built with 🌱 for a nature-positive future**

*Urvara.Life | Bangalore, India | 2025*
