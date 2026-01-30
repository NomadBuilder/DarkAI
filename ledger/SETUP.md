# The Ledger — Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your data**
   - Place Ontario Public Accounts CSV files in `/data/raw/`
   - Expected columns: `fiscal_year`, `vendor_name` (or `vendor`), `amount` (or `amount_paid`), `ministry` (or `department`)

3. **Process the data**
   ```bash
   npm run process-data
   ```
   This will:
   - Normalize vendor names
   - Aggregate payments by year
   - Generate JSON datasets in `/data/processed/` and `/public/data/processed/`

4. **Classify vendors** (Manual step)
   - Open `/data/processed/vendors_master.json`
   - For top ~200 vendors, update:
     - `vendor_type`: `"public"`, `"non_profit"`, `"for_profit"`, or `"unknown"`
     - `service_category`: `"staffing"`, `"consulting"`, `"healthcare_delivery"`, `"IT"`, `"facilities"`, or `"other"`
     - `confidence`: `"high"`, `"medium"`, or `"low"`
     - `evidence_note`: Brief explanation of classification
   - Re-run `npm run process-data` to regenerate datasets

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```
   Output will be in `/out/` directory.

## Data Structure

### Input (CSV)
Each CSV file should contain:
- `fiscal_year` or `year`: Fiscal year (e.g., 2014)
- `vendor_name` or `vendor` or `recipient`: Vendor name
- `amount` or `amount_paid` or `total`: Payment amount
- `ministry` or `department`: Ministry name

### Output (JSON)
- `payments_by_year.json`: All payments with vendor IDs
- `system_composition.json`: Yearly totals by vendor type
- `vendors_master.json`: Vendor metadata and yearly payments
- `lens_*.json`: Curated datasets for each lens (staffing, consulting, healthcare)

## Vendor Classification Guide

### Vendor Types

**Public**
- Hospitals
- School boards
- Municipalities
- Crown agencies
- Public institutions

**Non-profit**
- Registered charities
- Known non-profit operators
- Non-profit service providers

**For-profit**
- Incorporated companies
- Staffing agencies
- Private clinics
- Consulting firms
- IT vendors
- Facilities management companies

### Service Categories

**Staffing**
- Temporary staffing agencies
- Recruitment firms
- HR outsourcing

**Consulting**
- Management consulting
- Strategy consulting
- Professional services

**Healthcare Delivery**
- Private clinics
- Diagnostic services
- Healthcare service providers

**IT**
- Software vendors
- IT services
- Technology consulting

**Facilities**
- Facilities management
- Maintenance services
- Property management

**Other**
- Everything else

## Classification Confidence

- **High**: Clear public records, known entity type
- **Medium**: Reasonable inference from name/context
- **Low**: Uncertain, needs verification

## Next Steps After Classification

1. Review lens datasets in `/data/processed/lens_*.json`
2. Update `copy_angle` fields in lens files for narrative sections
3. Test visualization with real data
4. Refine visual encoding based on data distribution
