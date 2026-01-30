# Classification Logic & Confidence Assessment

## Overview

The automated classification system uses pattern matching on vendor names to classify entities as:
- **Public** (hospitals, school boards, municipalities, crown agencies)
- **Non-Profit** (charities, non-profit organizations)
- **For-Profit** (incorporated companies, staffing agencies, consulting firms)
- **Unknown** (unclassified, needs manual review)

## Classification Process

### Step 1: Pattern Matching

The system checks vendor names against predefined patterns in this order:

1. **Public Institution Patterns** (checked first)
   - Hospitals: `hospital`, `health sciences`, `health centre`
   - School boards: `school board`, `district school board`
   - Municipalities: `city of`, `town of`, `municipality of`
   - Universities: `university`, `college`
   - Government: `ontario`, `government`, `ministry`, `crown`
   - Crown agencies: `metrolinx`, `hydro one`, `ontario power`
   - Public health: `public health`, `health unit`
   - Other public: `children's aid`, `conservation authority`, `pension plan board`

2. **Non-Profit Patterns**
   - `united way`, `red cross`, `ymca`, `ywca`
   - `community living`, `non-profit`, `nonprofit`
   - `foundation`, `association`, `society`
   - `institute`, `institution`
   - `charity`, `charitable`

3. **For-Profit Patterns**
   - Legal suffixes: `inc`, `ltd`, `llc`, `corp`, `corporation`, `incorporated`
   - Staffing keywords: `staffing`, `recruitment`, `hr`, `human resources`
   - Consulting keywords: `consulting`, `consultants`, `advisory`
   - Known firms: `deloitte`, `kpmg`, `pwc`, `mckinsey`, `accenture`, `ibm`
   - Healthcare private: `lifelabs`, `dynacare`, `medcan`, `shouldice`
   - IT vendors: `microsoft`, `oracle`, `sap`, `salesforce`
   - Staffing agencies: `altis`, `randstad`, `adecco`, `kelly`, `manpower`
   - Business terms: `group`, `holdings`, `partners`

### Step 2: Service Category Assignment (For-Profit Only)

If classified as for-profit, the system also assigns a service category:
- **Staffing**: Contains staffing/recruitment keywords
- **Consulting**: Contains consulting/advisory keywords or known consulting firms
- **Healthcare Delivery**: Contains healthcare/medical/diagnostic keywords
- **IT**: Contains IT/technology/software keywords
- **Other**: For-profit but doesn't match specific categories

### Step 3: Confidence Assignment

**High Confidence:**
- Matches clear public institution patterns (hospitals, school boards, municipalities)
- Contains legal suffixes (Inc., Ltd., Corp.) indicating for-profit
- Known major entities (Metrolinx, Deloitte, etc.)

**Medium Confidence:**
- Matches non-profit patterns (foundations, associations)
- Matches for-profit patterns but without legal suffix
- Reasonable inference from name/context

**Low Confidence:**
- No pattern match
- Ambiguous names
- Needs manual review

## Limitations & Known Issues

### 1. False Positives Possible
- Some entities might match patterns incorrectly
- Example: A company named "City Hospital Inc" might be misclassified

### 2. False Negatives
- Entities without clear patterns remain "unknown"
- Many legitimate for-profit vendors may not be classified if they don't match patterns

### 3. Pattern-Based Only
- No external data sources (CRA, business registry) are consulted
- Classification is based solely on name patterns

### 4. Top 500 Only
- Only the top 500 vendors by total spend are automatically classified
- Remaining ~27,000 vendors remain "unknown"

## Confidence Assessment

### High Confidence Classifications (~50-60%)
- Public institutions: **Very High** (hospitals, school boards have distinctive names)
- Major for-profit firms: **High** (Deloitte, KPMG, etc. are well-known)
- Legal suffix entities: **High** (Inc., Ltd. are clear indicators)

### Medium Confidence Classifications (~20-30%)
- Non-profits: **Medium** (patterns are less distinctive)
- For-profit without suffix: **Medium** (inference from keywords)

### Low Confidence / Unknown (~20-30%)
- Entities without clear patterns
- Ambiguous names
- Need manual review

## Recommendations

1. **Manual Review Required For:**
   - Top 50 vendors by spend (regardless of confidence)
   - Any vendor with >$100M in payments
   - Vendors in key categories (staffing, consulting, healthcare)

2. **Verification Sources:**
   - CRA Charity Database (for non-profits)
   - Ontario Business Registry (for for-profit entities)
   - Public institution directories (for public entities)

3. **Improvements Needed:**
   - Add external data source lookups
   - Improve pattern matching for edge cases
   - Add manual override capability
   - Expand pattern library based on review

## Current Classification Stats

- **Total Vendors**: 28,142
- **Classified**: ~298 (top 500 reviewed)
- **Public**: ~268
- **For-Profit**: ~22
- **Non-Profit**: ~8
- **Unknown**: ~27,844

## Example Classifications

### High Confidence - Public
- ✅ "Toronto District School Board" → public (high)
- ✅ "University Health Network" → public (high)
- ✅ "Metrolinx" → public (high)

### High Confidence - For-Profit
- ✅ "Deloitte Consulting" → for_profit/consulting (high)
- ✅ "Altis Human Resources" → for_profit/staffing (high)

### Medium Confidence
- ⚠️ "Community Living Toronto" → non_profit (medium)
- ⚠️ "ABC Group" → for_profit/other (medium)

### Low Confidence / Unknown
- ❓ "Payments Made For Services..." → unknown (aggregate category)
- ❓ "XYZ Services" → unknown (no pattern match)
