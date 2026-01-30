# Vendor Classification Rubric

This document provides guidance for manually classifying vendors in `vendors_master.json`.

## Classification Process

1. **Sort by total spend** (descending)
2. **Classify top ~200 vendors** by total spend or growth rate
3. **Leave others as "unknown"** — they'll be visually de-emphasized

## Decision Tree

### Step 1: Is it a public institution?

**Yes → `vendor_type: "public"`**
- Hospitals (e.g., "Toronto General Hospital")
- School boards (e.g., "Toronto District School Board")
- Municipalities (e.g., "City of Toronto")
- Crown agencies (e.g., "Ontario Power Generation")
- Universities/colleges (public institutions)

**No → Continue**

### Step 2: Is it a registered non-profit?

**Yes → `vendor_type: "non_profit"`**
- Registered charities (check CRA charity database)
- Known non-profit operators
- Non-profit service providers

**No → Continue**

### Step 3: Is it a for-profit entity?

**Yes → `vendor_type: "for_profit"`**
- Incorporated companies (Inc., Ltd., Corp., etc.)
- Staffing agencies
- Private clinics
- Consulting firms
- IT vendors
- Facilities management

### Step 4: Determine service category (for for-profit vendors)

**Staffing** (`service_category: "staffing"`)
- Temporary staffing
- Recruitment
- HR outsourcing
- Examples: "Adecco", "Randstad", "Kelly Services"

**Consulting** (`service_category: "consulting"`)
- Management consulting
- Strategy consulting
- Professional services
- Examples: "Deloitte", "KPMG", "McKinsey"

**Healthcare Delivery** (`service_category: "healthcare_delivery"`)
- Private clinics
- Diagnostic services
- Healthcare service providers
- Examples: "LifeLabs", "Dynacare"

**IT** (`service_category: "IT"`)
- Software vendors
- IT services
- Technology consulting
- Examples: "Microsoft", "IBM", "Accenture"

**Facilities** (`service_category: "facilities"`)
- Facilities management
- Maintenance services
- Property management

**Other** (`service_category: "other"`)
- Everything else

## Confidence Levels

**High** (`confidence: "high"`)
- Clear public records
- Known entity type
- Official designation available

**Medium** (`confidence: "medium"`)
- Reasonable inference from name/context
- Industry knowledge suggests type
- Some uncertainty remains

**Low** (`confidence: "low"`)
- Uncertain classification
- Needs verification
- Best guess based on limited info

## Evidence Notes

Always include a brief `evidence_note` explaining your classification:

```json
{
  "vendor_id": "V00001",
  "vendor_name_normalized": "XYZ Staffing Inc",
  "vendor_type": "for_profit",
  "service_category": "staffing",
  "confidence": "high",
  "evidence_note": "Incorporated staffing agency, known industry player"
}
```

## Example Classifications

```json
{
  "vendor_id": "V00001",
  "vendor_name_normalized": "Toronto General Hospital",
  "vendor_type": "public",
  "service_category": null,
  "confidence": "high",
  "evidence_note": "Public hospital, part of University Health Network"
}
```

```json
{
  "vendor_id": "V00002",
  "vendor_name_normalized": "Deloitte Consulting",
  "vendor_type": "for_profit",
  "service_category": "consulting",
  "confidence": "high",
  "evidence_note": "Major consulting firm, incorporated entity"
}
```

```json
{
  "vendor_id": "V00003",
  "vendor_name_normalized": "Adecco Staffing",
  "vendor_type": "for_profit",
  "service_category": "staffing",
  "confidence": "high",
  "evidence_note": "Global staffing agency, for-profit corporation"
}
```

## Red Flags (Require Extra Care)

- Names that could be either public or private (e.g., "Ontario Health Services")
- Entities that changed status over time
- Joint ventures or partnerships
- When in doubt, mark as `"unknown"` with `confidence: "low"`

## Resources

- CRA Charity Database: https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch
- Ontario Business Registry: https://www.ontario.ca/page/search-ontario-business-registry
- Corporate registries for verification
