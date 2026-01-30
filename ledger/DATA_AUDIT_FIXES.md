# Data Audit & Classification Fixes

This document tracks data quality issues identified and fixed to ensure the dataset is pristine and accurately reflects actual spending patterns.

## Issues Fixed

### 1. Payment Processors / Pass-Throughs

**Issue**: Entities that act as payment processors or pass-throughs were incorrectly classified as for-profit vendors, inflating for-profit spending totals.

**Examples Fixed**:
- **D+H Corporation / Société Dh** ($1.7B in 2024) - OSAP student loan disbursement processor
- **Ontario Student Loan Trust** - Student loan pass-through

**Other Large Pass-Throughs Already Correctly Classified as "Unknown"**:
- **Odb** ($9.6B in 2024) - Ontario Drug Benefit program pass-through
- **Rbc-Ontaxrebat** ($1.7B in 2024) - Tax rebate processor
- **Student Loan Receivable** ($3.1B total) - Student loan accounting
- **Robinson Huron Treaty Litigation Fund** ($5B in 2023) - Settlement fund pass-through
- **Canada Pension Plan Investment Board** ($2.7B total) - Pension investment pass-through
- **Opseu Pension Trust** ($2.4B total) - Pension trust pass-through

**Fix**: Reclassified as "unknown" and excluded from for-profit calculations. Added to classification logic to prevent future misclassification.

### 2. Public Institutions Misclassified as For-Profit

**Issue**: Public hospitals, municipalities, and crown corporations were incorrectly classified as for-profit vendors.

**Examples Fixed**:
- **St. Joseph's Care Group** ($1.47B total) - Public hospital → reclassified as public
- **Royal Ottawa Health Care Group** ($1.37B total) - Public hospital → reclassified as public
- **Corporation of the County of Simcoe** ($891M total) - Municipality → reclassified as public
- **Corporation of the County of Wellington** ($400M total) - Municipality → reclassified as public
- **CMHC (Canada Mortgage & Housing Corp)** ($304M total) - Federal crown corporation → reclassified as public

**Fix**: Reclassified as "public" institutions. These are legitimate public spending, not privatization (Americanization).

### 3. Trusts and "In Trust" Entities

**Issue**: Legal trusts and "In Trust" entities are often pass-throughs for settlements, pensions, or other benefits, not direct service providers.

**Status**: Most large trusts are already correctly classified as "unknown". The classification logic now flags large trust entities for manual review.

### 4. Aggregate Categories

**Issue**: Aggregate accounting categories (e.g., "Accounts Under $50,000", "Interest on Ontario Securities") were sometimes classified as vendors.

**Status**: These are already correctly classified as "unknown" in the data.

## Impact on Numbers

### Before Fixes:
- 2024 For-Profit: ~$4.82B (included D+H and misclassified public institutions)

### After Fixes:
- 2024 For-Profit: ~$3.11B (corrected, excludes pass-throughs and public institutions)

## Classification Rules Updated

1. **Payment Processors**: Automatically classified as "unknown" if name contains:
   - "payment processor", "payment processing", "disbursement"
   - "student loan", "osap"
   - "pension", "trust" (for large amounts)
   - Known processors: D+H, Davis + Henderson

2. **Public Institutions**: Pattern matching improved for:
   - Hospitals (including "Care Group", "Health Care Group")
   - Municipalities ("Corporation of the County of...")
   - Crown corporations (CMHC, etc.)

3. **Exclusion Notes**: All reclassified vendors now include `exclusion_reason` field explaining why they were excluded/reclassified.

## Ongoing Monitoring

The audit script (`scripts/audit_data.py`) can be run periodically to identify:
- Large single-year payments (potential pass-throughs)
- Vendors with suspicious patterns
- Misclassified public institutions
- Payment processors not yet caught

## Data Integrity Principles

1. **Payment processors/pass-throughs** → Always "unknown", excluded from for-profit calculations
2. **Public institutions** → Always "public", not for-profit
3. **Aggregate categories** → Always "unknown"
4. **Trusts with large amounts** → Manual review, usually "unknown"
5. **Single large payments with no history** → Flag for review

## Files Modified

- `public/data/processed/vendors_master.json` - Vendor classifications updated
- `data/processed/vendors_master.json` - Same updates
- `scripts/classify_vendors.py` - Added payment processor patterns
- `scripts/fix_data_issues.py` - Automated fix script
- `public/data/processed/system_composition.json` - Regenerated with corrected totals
